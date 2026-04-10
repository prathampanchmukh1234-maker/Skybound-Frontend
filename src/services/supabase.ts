
import { createClient } from '@supabase/supabase-js';

// Support both standard and Vite-prefixed environment variables.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Helper to check if we have a valid configuration
export const isSupabaseConfigured = () => {
  const isUrlValid = !!supabaseUrl && !supabaseUrl.includes('placeholder') && supabaseUrl.startsWith('https://');
  const isKeyValid = !!supabaseAnonKey && !supabaseAnonKey.includes('placeholder') && supabaseAnonKey.length > 20;
  return isUrlValid && isKeyValid;
};

// Initialize with placeholder if missing to avoid immediate crash, 
// but we will check before usage.
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder-none.supabase.co', 
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-none',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'skybound-auth-token',
      flowType: 'pkce'
    }
  }
);

export const uploadFile = async (bucket: string, path: string, file: File) => {
  if (!isSupabaseConfigured()) {
    console.error("Supabase is not configured.");
    return null;
  }
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Upload failed, skipping storage sync.");
    return null;
  }
};

export const getPublicUrl = (bucket: string, path: string) => {
  if (!isSupabaseConfigured()) return '';
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};
