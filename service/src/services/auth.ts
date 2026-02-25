import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DatabaseWrapper } from '../config/db-wrapper.js';
import { User, AuthRequest, RegisterRequest, AuthResponse, UserRole } from '../types/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'radio-cesar-secret-key-change-in-production';

/**
 * Servicio de autenticación
 */
export class AuthService {
  constructor(private db: DatabaseWrapper) {}

  /**
   * Registra un nuevo usuario
   */
  async register(req: RegisterRequest): Promise<AuthResponse> {
    // Validar que el email no exista
    const existingUser = this.db.getOne<{ id: number }>(
      'SELECT id FROM users WHERE email = ?',
      [req.email.toLowerCase()]
    );

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = bcrypt.hashSync(req.password, 10);

    // Crear usuario
    const result = this.db.run(
      `INSERT INTO users (email, password, displayName, role, isActive)
       VALUES (?, ?, ?, ?, ?)`,
      [req.email.toLowerCase(), hashedPassword, req.displayName, 'listener', 1]
    );

    const userId = result.lastID;

    // Crear perfil de usuario
    this.db.run(`INSERT INTO user_profiles (userId) VALUES (?)`, [userId]);

    // Obtener usuario creado
    const user = this.db.getOne<User>(
      'SELECT id, email, displayName, role, avatar, bio, createdAt, updatedAt, isActive FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new Error('Error al crear el usuario');
    }

    // Generar token
    const token = this.generateToken(user);

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role as UserRole,
      avatar: user.avatar,
      token,
    };
  }

  /**
   * Inicia sesión de un usuario
   */
  async login(req: AuthRequest): Promise<AuthResponse> {
    // Buscar usuario por email
    const user = this.db.getOne<User>(
      'SELECT * FROM users WHERE email = ? AND isActive = 1',
      [req.email.toLowerCase()]
    );

    if (!user) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Verificar contraseña
    const passwordMatch = bcrypt.compareSync(req.password, user.password!);

    if (!passwordMatch) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Generar token
    const token = this.generateToken(user);

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role as UserRole,
      avatar: user.avatar,
      token,
    };
  }

  /**
   * Verifica y decodifica un token JWT
   */
  verifyToken(token: string): { id: number; email: string; role: UserRole } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Genera un token JWT
   */
  private generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUserById(userId: number): Promise<User | null> {
    const user = this.db.getOne<User>(
      'SELECT id, email, displayName, role, avatar, bio, createdAt, updatedAt, isActive FROM users WHERE id = ?',
      [userId]
    );
    return user || null;
  }

  /**
   * Actualiza un usuario
   */
  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.displayName !== undefined) {
      updates.push('displayName = ?');
      values.push(data.displayName);
    }

    if (data.bio !== undefined) {
      updates.push('bio = ?');
      values.push(data.bio);
    }

    if (data.avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(data.avatar);
    }

    if (updates.length === 0) {
      const user = await this.getUserById(userId);
      if (!user) throw new Error('Usuario no encontrado');
      return user;
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(userId);

    this.db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const user = await this.getUserById(userId);
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  }

  /**
   * Obtiene todos los usuarios (solo para admin)
   */
  async getAllUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    return this.db.getAll<User>(
      `SELECT id, email, displayName, role, avatar, bio, createdAt, updatedAt, isActive 
       FROM users LIMIT ? OFFSET ?`,
      [limit, offset]
    );
  }

  /**
   * Elimina un usuario (solo para admin)
   */
  async deleteUser(userId: number): Promise<void> {
    // No permitir eliminar al admin principal
    const user = await this.getUserById(userId);
    if (user?.email === 'admin@radiocesar.local') {
      throw new Error('No se puede eliminar el administrador principal');
    }

    this.db.run('DELETE FROM users WHERE id = ?', [userId]);
  }

  /**
   * Actualiza el rol de un usuario (solo para admin)
   */
  async updateUserRole(userId: number, role: UserRole): Promise<User> {
    // No permitir cambiar el rol del admin principal
    const user = await this.getUserById(userId);
    if (user?.email === 'admin@radiocesar.local') {
      throw new Error('No se puede cambiar el rol del administrador principal');
    }

    this.db.run(
      'UPDATE users SET role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [role, userId]
    );

    const updatedUser = await this.getUserById(userId);
    if (!updatedUser) throw new Error('Usuario no encontrado');
    return updatedUser;
  }
}
