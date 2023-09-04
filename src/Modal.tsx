import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import { useForm, SubmitHandler } from "react-hook-form";
import {supabaseKey, supabaseUrl} from "./env"
import { createClient } from '@supabase/supabase-js'
import {
  useContractWrite,
  usePrepareContractWrite,
  useContractEvent,
  useAccount,
} from "wagmi";
import { FLAGDAO_CONTRACT_ADDR, contractABI, ERC20_CONTRACT_ADDR, ercABI} from "./utils/constants";
import useDebounce from './usehooks';


// Modal.setAppElement('#root');  // 这行代码应该在你的App根元素上

type Inputs = {
  isOnchain: string,
  name: string,
  address: string,
  goal: string,
  pledgement: number,
  goal_type: string,
  start_date: string,
  end_date: string,
};

type PorpsType = {
  flagId: number,
  setFlagId: Function,
  fetchFlags: Function,
}

const supabase = createClient(supabaseUrl, supabaseKey)

const ModalComponent: React.FC<PorpsType> = ({flagId, setFlagId, fetchFlags}) => {
  const { address } = useAccount();

  const [modalIsOpen, setIsOpen] = useState(false);
  const [onChain, setOnChain] = useState(true);
  // const [flagId, setFlagId] = useState<any | undefined>();
  const [data, setData] = useState<Inputs>();
  const _data = useDebounce(data, 500);
  const [isGoingonchain, setIsGoingonchain] = useState(false);

  const [goal, setGoal] = useState<string>();
  const [pledgement, setPledgement] = useState<number>();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>();

  useEffect(() => {
    if(watch("isOnchain") === "onchain") { setOnChain(true); }
    else if(watch("isOnchain") === "offchain") { setOnChain(false); }
  },[watch("isOnchain")])

  useEffect(() => {
    setPledgement(watch("pledgement"));
    setGoal(watch("goal"));
  },[watch("pledgement"), watch("goal")])


  // function sleep(ms: any) {
  //   return new Promise(resolve => setTimeout(resolve, ms));
  // }

  useContractEvent({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    eventName: 'Launch',
    listener(log: any) {
      console.log("log[0].args.id.....",log[0])
      setFlagId(log[0].args.id);
      setIsGoingonchain(false);
    },
  })

  const {config} = usePrepareContractWrite({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    functionName: 'launch',
    args: [goal, pledgement, 1685156971, 1686971371],
    enabled: Boolean(goal)
  })
  const { data: res , isLoading, write, error } = useContractWrite(config); // res: hash



  const onSubmit: SubmitHandler<Inputs> = async (data, e) => {
    // e?.preventDefault();
    setData(data);
    write?.();
    console.log("start Submitting onChain...: write?.()");
    console.log("isLoading", isLoading);
    setIsGoingonchain(true);
    // } else {
    //   console.log("onSubmit postFlagOffchain")
    //   postFlagOffchain();
    // }
  }

  function openModal() { setIsOpen(true); }
  function closeModal(){  setIsOpen(false); }

  /*
  // data 是 Transaction hash
  // variables 是 pass to Contract 的 params
  const { data: hash, isLoading, isSuccess, writeAsync, variables } = useContractWrite({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    functionName: 'launch',
    // chainId ... // old version (under 0.1) you MUST specify chainID. fk
  })*/


  // const { config: cfg } = usePrepareContractWrite({
  //   address: ERC20_CONTRACT_ADDR,
  //   abi: ercABI,
  //   functionName: 'approve',
  //   args: [FLAGDAO_CONTRACT_ADDR, data?.pledgement],
  //   // chainId ... // old version (under 0.1) you MUST specify chainID. fk
  // })
  // const { data: data_arc, isLoading: islding, write: wrtErc } = useContractWrite(cfg)

  const postFlagOffchain = async () => {
    if(_data){
      const { error, data: res} = await supabase
      .from('flag')
      .insert([
        { 
          name: _data.name ,
          address: _data.address,
          goal: _data.goal,
          goalType: _data.goal_type,
          onChain,
          startAt: _data.start_date === "" ? null :_data.start_date,
          endAt: _data.end_date === "" ? null : _data.end_date
        },
      ]);
    }
  };

  const postFlag = async () => {
    // flagId = 0 相当于是 false, 所以第 "1" 个(idx 为 0) 需要手动创建...
    if(_data && onChain && typeof flagId !== 'undefined'){
      console.log("post FlagID: ", flagId, "to Backend....")
      const { error, data: res} = await supabase
      .from('flag')
      .insert([
        { 
          flagID: Number(flagId),
          name: _data.name ,
          address: _data.address,
          goal: _data.goal,
          amt: _data.pledgement,
          goalType: _data.goal_type,
          onChain,
          startAt: _data.start_date === "" ? null :_data.start_date,
          endAt: _data.end_date === "" ? null : _data.end_date
        },
      ]);
    }
  };

  // 这里暂时有一个小 Bug, 每次页面刷新都会尝试将 flag 写入后端, 不过因为 flagID 不能重复,
  // 所以每次写入都会失败, 虽然不影响运行, 但是看起来丑丑的.
  useEffect(()=> {
    postFlag();
    fetchFlags();
    console.log("flagID is ", flagId,  "postFlag() will excute again..")
  },[flagId])

  // Close modal...
  // function handleSubmit() {
  //   closeModal();
  // }  // 好像没用到?

  return (
    <div className="flex justify-center items-center">
      <button 
        onClick={openModal} 
        className="items-center w-auto text-center my-4 px-14 mx-10 underline bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400  text-white font-bold py-2 rounded-xl text-xl">
        Create Flag                                                 
      </button>

      <Modal 
        isOpen={modalIsOpen} 
        onRequestClose={closeModal} 
        className="flex items-center justify-center w-full h-full"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        
        <div className="bg-slate-50 rounded-lg shadow-lg w-2/5 py-10 px-20">
          <h3 className="text-2xl mb-4 text-center font-black">Create your Flag!</h3>

          {/* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
          <form onSubmit={ handleSubmit((e) => onSubmit(e))}>  
            {/* register your input into the hook by invoking the "register" function */}

            <label className="block text-gray-700 font-bold">* OnChain or not:</label>
              <select id="countries" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  {...register("isOnchain", { required: true })}>
                <option  defaultValue="onchain" value="onchain" className="border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700">on-chain</option>
                <option value="offchain" className="border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700">off-chain</option>
              </select>

            <>
              <label className='text-gray-700 font-bold block mt-4'>* Name:</label>
              <input
                className='border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700'
                defaultValue=''
                placeholder='your name...'
                autoFocus
                {...register("name", { required: "Please enter a your name.", })}
              />
              {errors?.name && (
                <div className='mb-3 text-normal text-red-500'>
                  {errors?.name.message}
                </div>
              )}
            </>

            <input className="hidden" defaultValue={address} {...register("address")} />

            
            <>
              <label className='text-gray-700 font-bold block mt-4'>* Goal(flag):</label>
              <input
                className='border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700'
                defaultValue=''
                placeholder='your goal/flag...'
                autoFocus
                {...register("goal", { required: "Please enter your goal/flag.", })}
              />
              {errors?.goal && (
                <div className='mb-3 text-normal text-red-500'>
                  {errors?.goal.message}
                </div>
              )}
            </>

            {onChain && (
            <>
              <label className='text-gray-700 font-bold block mt-4'>* Flag's Pledge Amount:</label>
              <input
                className='border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700'
                defaultValue={0}
                type="number"
                placeholder="your flag's pledge amount..."
                autoFocus
                {...register("pledgement", { required: "Please enter your goal/flag.", })}
              />
              {errors?.goal && (
                <div className='mb-3 text-normal text-red-500'>
                  {errors?.goal.message}
                </div>
              )}
            </>)}

            {/* Radios 单选 - 机构类型  */}
            <>
              <label className='text-gray-700 font-bold block mt-4'>* Goal Type：</label>
              {errors?.goal_type && (
                <div className='text-normal text-red-500 '>
                  {errors?.goal_type.message}
                </div>
              )}
              <div>
                <label className='ml-4 inline-block text-sm'>
                  <input className='mt-2 mr-1'
                    value='Rust'
                    type='radio'
                    {...register("goal_type", { 'required': "This is required.", })}
                  />Rust
                </label>
              </div>

              <div>
                <label className='ml-4 inline-block text-sm'>
                  <input className='mt-2 mr-1' type='radio' value='ZKP' {...register("goal_type")} />
                  ZKP
                </label>
              </div>

              <div>
                <label className='ml-4 inline-block text-sm'>
                  <input className='mt-2 mr-1' type='radio' value='Co-lean' {...register("goal_type")} />
                  Co-lean (CreatorsDAO)
                </label>
              </div>

              <div>
                <label className='ml-4 inline-block text-sm'>
                  <input className='mt-2 mr-1' type='radio' value='others' {...register("goal_type")} />
                  Other flags
                </label>
              </div>
            </>

            <>
              <label className='text-gray-700 font-bold inline mt-4'>Flag Start At:</label> 
              <input
                type="date"
                className="ml-4 inline mb-3 w-auto p-2 border border-gray-300 rounded"
                {...register("start_date")}
              />
            </>
            <div></div>
            <>
              <label className='text-gray-700 font-bold inline mt-2'>Flag End At:</label> 
              <input
                type="date"
                className="ml-6 inline mb-4 w-auto p-2 border border-gray-300 rounded"
                {...register("end_date")}
              />
            </>
            {isLoading ?
              <span className="mt-4 w-full rounded-md bg-black px-20  py-2 text-white border font-semibold text-md">Submitting...</span>
              :
              <button
                className='mt-4 w-full rounded-md bg-black px-20  py-2 text-white border font-semibold text-md'
                type="submit"
                name="Submit"
                disabled={isLoading}
              > Submit </button>
            }
            {(isGoingonchain && !isLoading) &&  <p className="text-sm text-slate-500">uploading to blockchain... Please wait...</p>}
            {(Boolean(flagId)) && <p className="text-sm text-slate-500">Uploaded on the blockchain! the flag ID is {Number(flagId)}, press ESC to quit.</p>}

          </form>

        </div>
      </Modal>
    </div>
  );
}

export default ModalComponent;
