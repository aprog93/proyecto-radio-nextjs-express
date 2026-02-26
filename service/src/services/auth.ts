import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { User, AuthRequest, RegisterRequest, AuthResponse, UserRole } from '../types/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'radio-cesar-secret-key-change-in-production';

/**
 * Servicio de autenticación con Prisma ORM
 */
export class AuthService {
  /**
   * Registra un nuevo usuario
   */
  async register(req: RegisterRequest): Promise<AuthResponse> {
    // Validar que el email no exista
    const existingUser = await prisma.user.findUnique({
      where: { email: req.email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = bcrypt.hashSync(req.password, 10);

    // Crear usuario con perfil
    const user = await prisma.user.create({
      data: {
        email: req.email.toLowerCase(),
        password: hashedPassword,
        displayName: req.displayName,
        role: 'listener',
        isActive: true,
        profile: {
          create: {},
        },
      },
    });

    // Generar token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role as UserRole,
      avatar: user.avatar,
      bio: user.bio,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role as UserRole,
      avatar: user.avatar || undefined,
      token,
    };
  }

  /**
   * Inicia sesión de un usuario
   */
  async login(req: AuthRequest): Promise<AuthResponse> {
    // Buscar usuario por email
    const user = await prisma.user.findFirst({
      where: {
        email: req.email.toLowerCase(),
        isActive: true,
      },
    });

    if (!user) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Verificar contraseña
    const passwordMatch = bcrypt.compareSync(req.password, user.password);

    if (!passwordMatch) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Generar token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role as UserRole,
      avatar: user.avatar,
      bio: user.bio,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role as UserRole,
      avatar: user.avatar || undefined,
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      displayName: user.displayName,
      role: user.role as UserRole,
      avatar: user.avatar || undefined,
      bio: user.bio || undefined,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Actualiza un usuario
   */
  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    // Obtener usuario actual para asegurar que existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error('Usuario no encontrado');
    }

    // Construir objeto de actualización
    const updateData: any = {};
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    // Si no hay cambios, retornar usuario actual
    if (Object.keys(updateData).length === 0) {
      return {
        id: existingUser.id,
        email: existingUser.email,
        password: existingUser.password,
        displayName: existingUser.displayName,
        role: existingUser.role as UserRole,
        avatar: existingUser.avatar || undefined,
        bio: existingUser.bio || undefined,
        isActive: existingUser.isActive,
        createdAt: existingUser.createdAt.toISOString(),
        updatedAt: existingUser.updatedAt.toISOString(),
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      password: updatedUser.password,
      displayName: updatedUser.displayName,
      role: updatedUser.role as UserRole,
      avatar: updatedUser.avatar || undefined,
      bio: updatedUser.bio || undefined,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  }

  /**
   * Obtiene todos los usuarios (solo para admin)
   */
  async getAllUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    const users = await prisma.user.findMany({
      take: limit,
      skip: offset,
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      password: user.password,
      displayName: user.displayName,
      role: user.role as UserRole,
      avatar: user.avatar || undefined,
      bio: user.bio || undefined,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));
  }

  /**
   * Elimina un usuario (solo para admin)
   */
  async deleteUser(userId: number): Promise<void> {
    // No permitir eliminar al admin principal
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    if (user.email === 'admin@radiocesar.local') {
      throw new Error('No se puede eliminar el administrador principal');
    }

    await prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Actualiza el rol de un usuario (solo para admin)
   */
  async updateUserRole(userId: number, role: UserRole): Promise<User> {
    // No permitir cambiar el rol del admin principal
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    if (user.email === 'admin@radiocesar.local') {
      throw new Error('No se puede cambiar el rol del administrador principal');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      password: updatedUser.password,
      displayName: updatedUser.displayName,
      role: updatedUser.role as UserRole,
      avatar: updatedUser.avatar || undefined,
      bio: updatedUser.bio || undefined,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  }
}
