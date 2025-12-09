-- Users 테이블에 프로필 이미지 URL 컬럼 추가

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- 컬럼 설명 추가
COMMENT ON COLUMN public.users.profile_image_url IS '프로필 이미지 URL (Supabase Storage)';

