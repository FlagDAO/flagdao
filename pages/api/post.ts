import { supabaseKey, supabaseUrl } from "../../utils/credentials"
import { createClient } from "@supabase/supabase-js"
const supabase = createClient(supabaseUrl, supabaseKey);

type Inputs = {
  flagId: number
  name: string
  address: string | undefined
  goal: string
  pledgement: number
  start_date: string
  end_date: string
  chainName: string | undefined
  chainId: number | undefined
  arId: string | undefined
}
export default async function postToSupabase(props: Inputs) {

  try{      
    const {data: res, error} = await supabase.from("flag").insert([
      {
        flagId: Number(props.flagId + 1), // whereas `TypeError: Do not know how to serialize a BigInt`
        name: props.name,
        address: props.address,
        goal: props.goal,
        pledgement: props.pledgement,
        startAt: props.start_date === "" ? null : props.start_date,
        endAt: props.end_date === "" ? null : props.end_date,
        chain: props.chainName,
        chainId: props.chainId,
        onChain : true,
        arId: props.arId,
      },
    ]).select()
    
    console.log("res,", res)
    
    if(res && 'status' in res && res.status == 409){ 
      console.log("DATA post To Backend Database: \n", res.status )
    }

  } catch(error) {
    console.log("Error postToBackendDatabase ", error)
  }
}