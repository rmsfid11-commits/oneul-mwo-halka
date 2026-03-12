import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zaovfspzyncbnymvzhcm.supabase.co";
const supabaseAnonKey = "sb_publishable_NrDArcWHooWOVdtECW0-Jg_7Tdbhrm_";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
