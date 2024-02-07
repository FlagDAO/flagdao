import { NextApiRequest, NextApiResponse } from "next"
import { supabaseKey, supabaseUrl } from "../../utils/credentials"
import { createClient } from "@supabase/supabase-js"

export default async function getflags(req: NextApiRequest, res: NextApiResponse): Promise<any | undefined> {
  const supabase = createClient(supabaseUrl, supabaseKey);  // ✅
  
  try {
    const { data, error } = await supabase.from("flag").select("*")
    console.log("get flags's data", data);

    if (data) {
      data.sort((a, b) => b.created_at.localeCompare(a.created_at))
      return res.status(200).json(data);
    } else {
      return res.status(404).json({ error: "No flags found" });
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Fetch flags - Internal server error" });
  }
}

// 不 work, 真是奇怪了...
// const fetchFlags = async () => {
//     try {
//       const response = await fetch("/api/getflags");  // 调用 API 路由的路径
//       if (response.ok) {
//         const data = await response.json();
//         setData(data)
//         setDarr(data)
//       } else { console.error("Failed to fetch data");}
//     } catch (error) { console.error(error); }
//   }
//   useEffect(() => {

//     fetchFlags();
//   }, []);