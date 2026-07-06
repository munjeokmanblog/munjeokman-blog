// ⚠️ 여기에 본인의 Supabase 프로젝트 URL과 anon(public) key를 넣으세요.
// Supabase 대시보드 > Project Settings > API 에서 확인할 수 있습니다.
const SUPABASE_URL = "https://ntpgaiftvttrhkxqktkt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50cGdhaWZ0dnR0cmhreHFrdGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNTA5ODUsImV4cCI6MjA5ODgyNjk4NX0.CiANXFT2KacwKqpclJ3iYs0A4NUzpR9l_riW2WpC47U";

// 관리자 로그인용 고정 이메일 (Supabase Auth에 이 이메일로 유저를 하나 만들어두면 됩니다)
const ADMIN_EMAIL = "admin@munjeokman.local";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
