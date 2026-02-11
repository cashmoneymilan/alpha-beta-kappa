import { NextResponse } from "next/server";

// GET /api/status - Check configuration status
export async function GET() {
  const status = {
    supabase: {
      configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      serviceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    rapidApi: {
      configured: !!process.env.RAPIDAPI_KEY,
    },
    deepseek: {
      configured: !!process.env.DEEPSEEK_API_KEY,
    },
    cron: {
      configured: !!process.env.CRON_SECRET,
    },
  };

  return NextResponse.json(status);
}
