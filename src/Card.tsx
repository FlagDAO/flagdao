import {
  useContractWrite,
  usePrepareContractWrite,
  useAccount
} from "wagmi";
import { createClient } from '@supabase/supabase-js'
import {supabaseKey, supabaseUrl} from "./env"
import Avatar, { genConfig } from 'react-nice-avatar'
import { getTimeDifference } from "./utils/utils";

import { useState, useEffect, lazy } from "react";
import {CardProps } from './App'
// import contractABI from "./utils/FlagDAO.json";
import { BigNumber } from "ethers";
import  useDebounce  from './usehooks';
import { FLAGDAO_CONTRACT_ADDR, REACT_APP_CHAIN_ID, contractABI, ERC20_CONTRACT_ADDR, ercABI } from "./utils/constants";
const BettorsModal = lazy(() => import("./components/BettorsModal"));
import { BsCurrencyBitcoin } from "react-icons/bs";

const config = genConfig()
const supabase = createClient(supabaseUrl, supabaseKey)


const Card: React.FC<CardProps> = (props) => {
  const [amt, setAmt] = useState<number>(0);
  const _amt = useDebounce(amt, 100);
  const [id, setId] = useState<Number>(props.flag_id);
  const _id = useDebounce(id, 100);
  const { address } = useAccount();

  // console.log("created_at", getTimeDifference(props.created_at));


  const changeId = (e: any) =>{
    setId(e.target.value);
  }

  const { config } = usePrepareContractWrite({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    // chainId: REACT_APP_CHAIN_ID,
    functionName: 'pledge',
    args: [_id, _amt],
    enabled: Boolean(_id)
  });

  const { data, isLoading, write: write_pledge, error } = useContractWrite(config);
  if(error) console.log("Pledge error", error);

  // console.log("props.bettors_plg .. ",props.name, props.bettors_plg, _amt);

  
  const updateBackend = async (_id: any) => {

    if (address == props.address){ // Pledge itself
      const { data: dat, error } = await supabase
      .from('flag')
      .update({ amt: (Number(_amt) + Number(props.self_plg)) })
      .eq('flagID', _id)
    
    } else { // Pledge others
      const { data: dat, error } = await supabase
      .from('flag')
      .update({ bettors_amt: Number(_amt) + Number(props.bettors_plg) })
      .eq('flagID', _id)
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    write_pledge?.();
    updateBackend(_id);
  }

  const HoverComponent = () => {
    return (
        <div className="relative group">
            <div className="w-64 h-64 bg-blue-500">Hover me</div>
            <div className="absolute right-0 top-0 mt-2 mr-2 w-64 h-64 bg-red-500 opacity-0 group-hover:opacity-80 transition-opacity duration-200">
                Modal content
            </div>
        </div>
    );
};

  return (
    <div className="flex justify-center">
      <div className="flex md:max-w-2xl w-full justify-between md:flex-row p-4 m-4 flex-col items-center rounded-2xl bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700">
        <div className="flex flex-row items-center">
          {/* Avatar */}
          <div className="flex-col items-center p-4">
            <div><Avatar style={{ width: '5rem', height: '5rem' }} {...genConfig(props?.name) } /> </div>
            <div className="text-center text-slate-800 font-medium">@{props?.name}</div>
          </div>

          {/* Middle: flag Content / Pledgement / labes */}
          <div className="flex flex-col justify-start p-6">
            <p className="mb-2 text-lg font-medium text-neutral-600 dark:text-neutral-200">
              <img className="inline pr-3" src="../iconmonstr-quote-1.svg" />
                {props?.goal}
              <img className="inline pl-2" src="../iconmonstr-quote-3.svg" />
            </p>
            <div className="flex justify-start font-sans py-1 text-slate-400 font-medium">
              <span className="text-sm pt-1 pr-1">Self Pleaged: </span> <span className="text-lg font-bold text-lime-700"> ${props?.self_plg?.toString()}</span>
              {/* <span className="text-sm pt-1 pr-1 ml-4">Bettors: </span> <span className="text-lg font-bold text-lime-700">${props?.bettors_plg?.toString()}</span> */}
              <BettorsModal bettors_plg={props.bettors_plg} flag_id={props.flag_id} />
            </div>

            <div className="flex justify-start text-xs py-1 text-slate-400 font-medium">
              <span> 🏁 flag From {props?.startAt} To {props?.endAt}</span> 
            </div>
            <p className="text-xs  text-slate-400  dark:text-neutral-300 pb-4">
              {props?.address?.slice(0,5)}...{props?.address?.slice(-5,)}{" "}{" "}{" "}{getTimeDifference(props?.created_at)}
            </p>

            <div className="Labels & # Status">
              <button className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#{props?.goal_type}</button>
              <button className={`inline-block rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 
                ${props?.flag_status === 'ongoing' ? 'bg-yellow-500' : 
                  props?.flag_status === 'success' ? 'bg-green-600' : 
                  props?.flag_status === 'rug' ? 'bg-red-500' : ''}`}>
                  {props?.flag_status}
              </button>          
            </div>
          </div>
        </div>

        {/* Button & input of Pledge */}
        <div> {
          props.flag_status == "ongoing" &&
            <form onSubmit={(e) => handleSubmit(e)} >
              {isLoading  ?
              <span className="font-sans font-semibold text-slate-800 text-base  text-center  rounded-lg ">Pledging..</span>
              :
              <>
                {/* <label htmlFor="input-group-1" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Email</label> */}
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-1 pointer-events-none">
                    <BsCurrencyBitcoin className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
                  </div>
                  <input 
                    className="w-20 pl-6 bg-gray-50 border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 blockpl-6 p-1.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    onChange={(e: any) => setAmt((e.target.value))}
                    placeholder="$0"
                    value={_amt}
                    type="number" id="input-group-1" />
                </div>
                <button type="submit" className="w-full border-x-0.5 font-sans font-semibold text-slate-100 text-base px-2 py-1 text-center mr-2 mb-2 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 rounded-lg ">Pledge</button>
              </>
              }
            </form>
           }

          <form >
            { props.flag_status == "success" &&
            <button type="submit" className="border-x-0.5 font-sans font-semibold text-slate-100 text-base px-2 py-1 text-center mr-2 mb-2 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 rounded-lg ">Collect Winnings</button>
            }
            { props.flag_status == "rug" &&
            <button type="submit" className="border-x-0.5 font-sans font-semibold text-slate-100 text-base px-2 py-1 text-center mr-2 mb-2 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 rounded-lg ">Claim the Bet!</button>
            }
          </form>
        </div>

      </div>
    </div>
  )
}

export default Card;

// <div className="max-w-sm rounded overflow-hidden shadow-lg">
// <Avatar style={{ width: '4rem', height: '4rem' }} {...genConfig(props.name) } />
// <span>{props.name}</span>
// <div className="px-6 py-4">
//   <div className="font-bold text-xl mb-2">The Coldest Sunset</div>
//   <p className="text-gray-700 text-base">
//     Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
//   </p>
// </div>

// </div>

// <div className="mt-6"> 
// <div className="rounded-lg overflow-hidden shadow-lg p-4 bg-white flex flex-row">
//   <div className="basis-3/4 flex flex-col h-auto">
//     <div className="flex pl-4 pr-6 w-auto text-xl font-semibold tracking-tight">
//       <p>{props.goal}</p>
//     </div>
//     <div className="flex flex-col"> 
//        <div className="pt-2 py-1 px-4 font-sans tracking-tight">addr: {props.address}</div>
//        <div className="py-1 px-4 font-sans tracking-tight">slef-pledged:
//           <div className="inline text-xl font-semibold py-1 px-1 text-gray-700">${props.self_plg.toString()}</div>
//        </div>
//     </div>
//   </div>

//   <div className="w-1/4 grid grid-cols-1 gap-4">

//   </div>
// </div>
// </div>