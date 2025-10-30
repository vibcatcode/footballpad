import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
    // 로그인 후 실제로는 supabase 이벤트(Hook)로 이동 처리 필요
    window.location.href = '/dashboard/builder';
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-green-950">
      <button className="px-6 py-3 rounded bg-white shadow" onClick={handleGoogleLogin}>
        Google 로그인
      </button>
    </main>
  );
}
