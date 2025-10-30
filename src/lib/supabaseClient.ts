import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('환경변수 NEXT_PUBLIC_SUPABASE_URL이 누락되어 있습니다. .env.local 파일을 확인하세요!');
}
if (!supabaseAnonKey) {
  throw new Error('환경변수 NEXT_PUBLIC_SUPABASE_ANON_KEY가 누락되어 있습니다. .env.local 파일을 확인하세요!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
