import { NextApiRequest, NextApiResponse } from "next"
import { supabaseKey, supabaseUrl } from "../../utils/credentials"
import { createClient } from "@supabase/supabase-js"

export default async function getNewestFlags() {
  const supabase = createClient(supabaseUrl, supabaseKey);  // ✅

  const { data } = await supabase
    .from('flag')
    .select('flagId')
    .order('flagId', { ascending: false })
    .limit(1)
    ;
  return data
}