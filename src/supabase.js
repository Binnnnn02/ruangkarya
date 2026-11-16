import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const WORK_FILE_BUCKET = "work-files";

export async function fetchWorks(admin = false) {
  if (!supabase) return null;
  let request = supabase.from("works").select("*").order("created_at", { ascending: false });
  if (!admin) request = request.eq("status", "published");
  const { data, error } = await request;
  if (error) throw error;
  return data;
}

export async function fetchSubmissions() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("status", "pending")
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function hasAdminAccess(userId) {
  if (!supabase || !userId) return false;
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return !error && Boolean(data);
}
