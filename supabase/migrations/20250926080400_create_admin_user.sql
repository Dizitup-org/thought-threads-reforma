-- Create default admin user
-- Note: In production, you should change this password immediately

INSERT INTO public.admin_users (email, password_hash, created_at) 
VALUES (
  'admin@reforma.com',
  '$2a$10$8K1p/a0dURXAm7QiTRqUzuN0/SpuDMaM1YW8NvCe78O9jV53s8KqO', -- bcrypt hash for "admin123"
  NOW()
)
ON CONFLICT (email) DO NOTHING;