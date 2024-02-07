import { useContractWrite, usePrepareContractWrite, useAccount, useContractEvent} from "wagmi"
import { createClient } from "@supabase/supabase-js"
import { supabaseKey, supabaseUrl } from "../utils/credentials"
import Avatar, { genConfig } from "react-nice-avatar"
import { getTimeDifference } from "../utils/utils"
import {parseEther, ethers} from "ethers";

import { useState, useEffect, lazy } from "react"
import { CardProps } from "./Homepage"
// import contractABI from "./utils/FlagDAO.json";
import useDebounce from "../utils/useHooks"
import {
  FLAGDAO_CONTRACT_ADDR,
  contractABI,
} from "../utils/constants"
// const BettorsModal = lazy(() => import("./components/BettorsModal"))
import { calculate_pledgement } from "./ModalCreateFlag"
import Image from 'next/image'
// import { BsCurrencyBitcoin } from "react-icons/bs"
// import { useContractEvents, useContract } from "@thirdweb-dev/react";

// const config = genConfig()
const supabase = createClient(supabaseUrl, supabaseKey)


const Card: React.FC<CardProps> = (props) => {
  const [amt, setAmt] = useState<number>(0.01)
  const _amt = useDebounce(amt, 10)
  const [id, setId] = useState<Number>(props.flagId)
  const _id = useDebounce(id, 100)
  const { address } = useAccount()

  // console.log("created_at", getTimeDifference(props.created_at));

  const changeId = (e: any) => {
    setId(e.target.value)
  }

  const { config } = usePrepareContractWrite({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    // chainId: REACT_APP_CHAIN_ID,
    functionName: "gamblePledge",
    args: [_id,],
    value: parseEther(calculate_pledgement(_amt)), // ethers.utils.parseEther("0.1"),
    enabled: Boolean(_id),
  })

  const {
    data,
    isLoading,
    isSuccess,
    isError,
    write: write_gamblePledge,
    error,
  } = useContractWrite(config)
  if (error) console.log("Pledge error", error)



  // there exists id=3, I want to update the JSON Array field, that add `{"bettor": "mike", "amt": 0.001}` into the JSON Array
  // fetch the bettors list:
  const testFetchJSONOfBettors = async () =>  {
    const { data: fetchBettorsData, error: fetchBettorsError } = await supabase
      .from('flag')
      .select(`
        flagId, name, bettors,
        bettors->name,
        bettors->value
      `).eq("flagId", _id)
      .limit(1);
      console.log("fetchBettorsData -  returns:\n", _id, fetchBettorsData)

      if (fetchBettorsData && fetchBettorsData.length > 0 && fetchBettorsData[0].bettors) {
        return {
          name: fetchBettorsData[0].bettors.name,
          value: fetchBettorsData[0].bettors.value,
        };
      }
      return { name: [], value: [] };
  }

  const InsertBettorsToSupabase = async () => {

      const {name: namelist, value: valuelist} = await testFetchJSONOfBettors();
      
      console.log("namelist, valuelist", namelist, valuelist);

      const updatedBettors = {
        name: [...namelist, address],
        value: [...valuelist, _amt]
      };

      const { data: datatest, error } = await supabase
        .from('flag')
        .update({
          bettors: updatedBettors
        })
        // .eq('address->postcode', 90210)  // selector
        .eq("flagId", _id)
        .select();
        // console.log("testInsertJson function returns:\n", datatest)
      ;
    }


  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      console.log("handleSubmit...")
      await write_gamblePledge?.()
    } catch (error) {
      console.error('Gamble-Pledge transaction failed:', error)
    }
  }
  
  // listen the blockchain chage.   // useEffect(() => {  },[])
  // 有 2 个 TS compiler Warning(不用管):
  // 1. Property 'args' does not exist on type 'Log'.ts(2339)
  // 2. Cannot invoke an object which is possibly 'undefined'.ts(2722) 
  const unwatch = useContractEvent({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    eventName: 'GamblePledge',
    listener: (logs) => {
      // logs[0] 里面放的是 _mint 函数 emit 的事件.
      const { args } = logs[1] as any; // 跳过类型检查
      console.log("`GamblePledge` Listen ..", args, )
      InsertBettorsToSupabase()   // 更新后端 supabase
    },
  })

  const HoverComponent = () => {
    return (
      <div className="relative group">
        <div className="w-64 h-64 bg-blue-500">Hover me</div>
        <div className="absolute right-0 top-0 mt-2 mr-2 w-64 h-64 bg-red-500 opacity-0 group-hover:opacity-80 transition-opacity duration-200">
          Modal content
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="flex md:max-w-2xl w-full justify-between md:flex-row p-4 m-4 flex-col items-center rounded-2xl bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-row items-center">
          {/* Avatar */}
          <div className="flex-col items-center p-4">
            <div>




            {/*             
              <button 
                 className="bg bg-amber-600 m-2 p-2 w-full h-full"
                 onClick={(e) => testFetchJSONOfBettors()}> testFetchJSONOfBettors 
              </button>


              <button 
                 className="bg bg-amber-600 m-2 p-2 w-full h-full"
                 onClick={(e) => testInsertJson()}> testInsertJson 
              </button> */}


              <Avatar
                style={{ width: "5rem", height: "5rem" }}
                {...genConfig(props?.name || "default")}
              />{" "}
            </div>
            <div className="text-center text-slate-800 font-medium">
              @{props?.name}
            </div>
          </div>

          {/* Middle: flag Content / Pledgement / labes */}
          <div className="flex flex-col justify-start p-6">
            <p className="mb-2 text-lg font-medium text-neutral-600">
              <Image src="./iconmonstr-quote-1.svg" width={30} height={30} className="inline pr-3 pb-3" alt="" />
              {props?.goal}
              <Image src="./iconmonstr-quote-3.svg" width={30} height={30} className="inline pl-3 pt-3" alt="" />
            </p>
            <div className="flex justify-start font-sans py-1 text-slate-400 font-medium">
              <span className="text-sm pt-1 pr-1">Self Pledged: </span>{" "}
              <span className="text-lg font-bold text-indigo-700">
                {" "}
                ${props?.pledgement?.toString()}
              </span>
              {/* <span className="text-sm pt-1 pr-1 ml-4">Bettors: </span> <span className="text-lg font-bold text-lime-700">${props?.bettors_plg?.toString()}</span> */}
              {/* 
              <BettorsModal
                bettors_plg={props.bettors_plg}
                flag_id={props.flag_id}
              /> */}
            </div>

            <div className="flex justify-start text-xs py-1 text-slate-400 font-medium">
              <span>
                {" "}
                🏁 flag From {props?.startDate} To {props?.endDate}
              </span>
            </div>
            <p className="text-xs  text-slate-400 pb-4">
              {props?.address?.slice(0, 5)}...{props?.address?.slice(-5)}{" "}
              {getTimeDifference(props?.created_at)}
            </p>

            <div className="Labels & # Status">
              <button className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                #Flag
              </button>
              <button
                className={`inline-block rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 
                ${
                  props?.flagStatus === "Ongoing"
                    ? "bg-yellow-500"
                    : props?.flagStatus === "Success"
                    ? "bg-green-600"
                    : props?.flagStatus === "Rug"
                    ? "bg-red-500"
                    : ""
                }`}
              >
                {props?.flagStatus}
              </button>
            </div>
          </div>
        </div>

        {/* Button & input of Pledge */}
        <div>
          {" "}
          {props?.flagStatus == "Ongoing" && (
            <form onSubmit={(e) => handleSubmit(e)}>

              {isLoading ? (
                <span className="font-sans font-semibold text-slate-800 text-base  text-center  rounded-lg ">
                  Pledging..
                </span>
              ) : (
                <>
                  {/* <label
                    htmlFor="input-group-1"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Your Email
                  </label> */}
                  <div className="relative mb-2 w-32">
                    <div className="absolute inset-y-0 left-1 flex items-center pl-1 pointer-events-none">
                      {/* <BsCurrencyBitcoin className="w-5 h-5 text-gray-500" />*/}
                      {/* <FontAwesomeIcon icon="fa-brands fa-ethereum" />*/}
                      <svg xmlns="http://www.w3.org/2000/svg" height="16" width="10" viewBox="0 0 320 512"><path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z"/></svg>
                    </div>
                    <input
                      className="w-full pl-6 bg-gray-50 border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5"
                      onChange={(e: any) => setAmt(e.target.value)}
                      placeholder="bet for it!"
                      value={_amt}
                      min={0.00001}
                      max={9.2}
                      step={0.00001}  
                      type="number"
                      id="input-group-1"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full border-x-0.5 font-sans font-semibold text-slate-100 text-base px-2 py-1 text-center mr-2 mb-2 bg-gradient-to-br from-indigo-300 via-blue-400 to-indigo-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-200 rounded-lg "
                  >
                    Pledge
                  </button>
                </>
              )}
            </form>
          )}
          {/* <form>
            {props?.flagStatus == "success" && (
              <button
                type="submit"
                className="border-x-0.5 font-sans font-semibold text-slate-100 text-base px-2 py-1 text-center mr-2 mb-2 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 rounded-lg "
              >
                Collect Winnings
              </button>
            )}
            {props?.flagStatus == "rug" && (
              <button
                type="submit"
                className="border-x-0.5 font-sans font-semibold text-slate-100 text-base px-2 py-1 text-center mr-2 mb-2 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 rounded-lg "
              >
                Claim the Bet!
              </button>
            )}
          </form> */}
        </div>
      </div>
    </div>
  )
}
export default Card;