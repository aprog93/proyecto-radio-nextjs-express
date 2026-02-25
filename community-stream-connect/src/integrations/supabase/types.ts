export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      donaciones: {
        Row: {
          anonimo: boolean
          created_at: string
          id: string
          mensaje: string | null
          monto: number
          user_id: string | null
        }
        Insert: {
          anonimo?: boolean
          created_at?: string
          id?: string
          mensaje?: string | null
          monto: number
          user_id?: string | null
        }
        Update: {
          anonimo?: boolean
          created_at?: string
          id?: string
          mensaje?: string | null
          monto?: number
          user_id?: string | null
        }
        Relationships: []
      }
      etiquetas: {
        Row: {
          id: string
          nombre: string
          slug: string
        }
        Insert: {
          id?: string
          nombre: string
          slug: string
        }
        Update: {
          id?: string
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      eventos: {
        Row: {
          capacidad: number | null
          created_at: string
          descripcion: string | null
          estado: Database["public"]["Enums"]["evento_estado"]
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          imagen_url: string | null
          slug: string
          titulo: string
          ubicacion: string | null
          updated_at: string
        }
        Insert: {
          capacidad?: number | null
          created_at?: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["evento_estado"]
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          imagen_url?: string | null
          slug: string
          titulo: string
          ubicacion?: string | null
          updated_at?: string
        }
        Update: {
          capacidad?: number | null
          created_at?: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["evento_estado"]
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          imagen_url?: string | null
          slug?: string
          titulo?: string
          ubicacion?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inscripciones: {
        Row: {
          created_at: string
          evento_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evento_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          evento_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      noticias: {
        Row: {
          autor_id: string | null
          categoria_id: string | null
          contenido: string | null
          created_at: string
          estado: Database["public"]["Enums"]["noticia_estado"]
          extracto: string | null
          id: string
          imagen_url: string | null
          publicado_en: string | null
          slug: string
          titulo: string
          updated_at: string
        }
        Insert: {
          autor_id?: string | null
          categoria_id?: string | null
          contenido?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["noticia_estado"]
          extracto?: string | null
          id?: string
          imagen_url?: string | null
          publicado_en?: string | null
          slug: string
          titulo: string
          updated_at?: string
        }
        Update: {
          autor_id?: string | null
          categoria_id?: string | null
          contenido?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["noticia_estado"]
          extracto?: string | null
          id?: string
          imagen_url?: string | null
          publicado_en?: string | null
          slug?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "noticias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      noticias_etiquetas: {
        Row: {
          etiqueta_id: string
          noticia_id: string
        }
        Insert: {
          etiqueta_id: string
          noticia_id: string
        }
        Update: {
          etiqueta_id?: string
          noticia_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "noticias_etiquetas_etiqueta_id_fkey"
            columns: ["etiqueta_id"]
            isOneToOne: false
            referencedRelation: "etiquetas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noticias_etiquetas_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "noticias"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          created_at: string
          estado: Database["public"]["Enums"]["pedido_estado"]
          id: string
          items: Json
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estado?: Database["public"]["Enums"]["pedido_estado"]
          id?: string
          items?: Json
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          estado?: Database["public"]["Enums"]["pedido_estado"]
          id?: string
          items?: Json
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      productos: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: string
          imagen_url: string | null
          nombre: string
          precio: number
          slug: string
          stock: number
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          nombre: string
          precio?: number
          slug: string
          stock?: number
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          nombre?: string
          precio?: number
          slug?: string
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          preferred_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      programas: {
        Row: {
          activo: boolean
          categoria: string | null
          conductor: string | null
          created_at: string
          descripcion: string | null
          horario: Json | null
          id: string
          imagen_url: string | null
          nombre: string
          slug: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categoria?: string | null
          conductor?: string | null
          created_at?: string
          descripcion?: string | null
          horario?: Json | null
          id?: string
          imagen_url?: string | null
          nombre: string
          slug: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria?: string | null
          conductor?: string | null
          created_at?: string
          descripcion?: string | null
          horario?: Json | null
          id?: string
          imagen_url?: string | null
          nombre?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "locutor" | "usuario"
      evento_estado: "proximo" | "en_vivo" | "finalizado" | "cancelado"
      noticia_estado: "borrador" | "publicado" | "archivado"
      pedido_estado:
        | "pendiente"
        | "pagado"
        | "enviado"
        | "entregado"
        | "cancelado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "locutor", "usuario"],
      evento_estado: ["proximo", "en_vivo", "finalizado", "cancelado"],
      noticia_estado: ["borrador", "publicado", "archivado"],
      pedido_estado: [
        "pendiente",
        "pagado",
        "enviado",
        "entregado",
        "cancelado",
      ],
    },
  },
} as const
