
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://dahnxrqdtmjfhphbzsef.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_x0AftwAsRO0vdtd19-eIxw_tdIN93Oi";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
