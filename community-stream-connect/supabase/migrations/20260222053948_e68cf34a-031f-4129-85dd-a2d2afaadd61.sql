
-- 1. Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'locutor', 'usuario');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'usuario',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  preferred_language TEXT DEFAULT 'es',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly viewable" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Trigger: auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'usuario');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Categorías
CREATE TABLE public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  parent_id UUID REFERENCES public.categorias(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorias are publicly viewable" ON public.categorias
  FOR SELECT USING (true);

CREATE POLICY "Admins/editors manage categorias" ON public.categorias
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')
  );

-- 4. Etiquetas
CREATE TABLE public.etiquetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

ALTER TABLE public.etiquetas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Etiquetas are publicly viewable" ON public.etiquetas
  FOR SELECT USING (true);

CREATE POLICY "Admins/editors manage etiquetas" ON public.etiquetas
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')
  );

-- 5. Noticias (Blog/News)
CREATE TYPE public.noticia_estado AS ENUM ('borrador', 'publicado', 'archivado');

CREATE TABLE public.noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  extracto TEXT,
  contenido TEXT,
  imagen_url TEXT,
  autor_id UUID REFERENCES auth.users(id),
  categoria_id UUID REFERENCES public.categorias(id),
  estado noticia_estado NOT NULL DEFAULT 'borrador',
  publicado_en TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published noticias are public" ON public.noticias
  FOR SELECT USING (estado = 'publicado');

CREATE POLICY "Admins/editors manage noticias" ON public.noticias
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')
  );

-- Noticias-etiquetas junction
CREATE TABLE public.noticias_etiquetas (
  noticia_id UUID REFERENCES public.noticias(id) ON DELETE CASCADE,
  etiqueta_id UUID REFERENCES public.etiquetas(id) ON DELETE CASCADE,
  PRIMARY KEY (noticia_id, etiqueta_id)
);

ALTER TABLE public.noticias_etiquetas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read noticias_etiquetas" ON public.noticias_etiquetas
  FOR SELECT USING (true);

CREATE POLICY "Admins/editors manage noticias_etiquetas" ON public.noticias_etiquetas
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')
  );

-- 6. Programas de radio
CREATE TABLE public.programas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  imagen_url TEXT,
  conductor TEXT,
  categoria TEXT DEFAULT 'general',
  horario JSONB DEFAULT '[]'::jsonb,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.programas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Programas are publicly viewable" ON public.programas
  FOR SELECT USING (true);

CREATE POLICY "Admins/editors manage programas" ON public.programas
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')
  );

-- 7. Eventos
CREATE TYPE public.evento_estado AS ENUM ('proximo', 'en_vivo', 'finalizado', 'cancelado');

CREATE TABLE public.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  imagen_url TEXT,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  ubicacion TEXT,
  estado evento_estado NOT NULL DEFAULT 'proximo',
  capacidad INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eventos are publicly viewable" ON public.eventos
  FOR SELECT USING (true);

CREATE POLICY "Admins/editors manage eventos" ON public.eventos
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')
  );

-- Inscripciones a eventos
CREATE TABLE public.inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES public.eventos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (evento_id, user_id)
);

ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inscripciones" ON public.inscripciones
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can register to events" ON public.inscripciones
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can cancel own inscripcion" ON public.inscripciones
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins manage inscripciones" ON public.inscripciones
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 8. Productos (Tienda)
CREATE TABLE public.productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  precio NUMERIC(10,2) NOT NULL DEFAULT 0,
  imagen_url TEXT,
  stock INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Productos are publicly viewable" ON public.productos
  FOR SELECT USING (activo = true);

CREATE POLICY "Admins manage productos" ON public.productos
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 9. Pedidos
CREATE TYPE public.pedido_estado AS ENUM ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado');

CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  estado pedido_estado NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pedidos" ON public.pedidos
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can create pedidos" ON public.pedidos
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage pedidos" ON public.pedidos
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 10. Donaciones
CREATE TABLE public.donaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  monto NUMERIC(10,2) NOT NULL,
  mensaje TEXT,
  anonimo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own donaciones" ON public.donaciones
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Anyone can create donaciones" ON public.donaciones
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins view all donaciones" ON public.donaciones
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_noticias_updated_at BEFORE UPDATE ON public.noticias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_programas_updated_at BEFORE UPDATE ON public.programas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON public.eventos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON public.productos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
