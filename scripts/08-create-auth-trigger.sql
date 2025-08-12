-- Función para crear un registro en la tabla 'usuarios' después de un nuevo registro en 'auth.users'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_type text;
    user_name text;
    user_phone text;
    conductor_code text;
BEGIN
    -- Obtener el tipo de usuario y nombre del metadata si existen
    user_type := COALESCE(NEW.raw_user_meta_data->>'tipo_usuario', 'usuario');
    user_name := COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email);
    user_phone := NEW.raw_user_meta_data->>'telefono';
    conductor_code := NEW.raw_user_meta_data->>'codigo_conductor';

    INSERT INTO public.usuarios (id, email, nombre, tipo_usuario, telefono)
    VALUES (NEW.id, NEW.email, user_name, user_type, user_phone);

    -- Si el tipo de usuario es 'conductor', también inserta en la tabla 'conductores'
    IF user_type = 'conductor' THEN
        INSERT INTO public.conductores (id, codigo_conductor)
        VALUES (NEW.id, conductor_code);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger que se ejecuta después de insertar un nuevo usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
