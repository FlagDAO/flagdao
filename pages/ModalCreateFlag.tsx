'use client';
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure} from "@nextui-org/react";
import React, { useState, useEffect, useRef } from "react"
import "ethers";
import {parseEther, ethers, Numeric} from "ethers";
import UploadToArweave, {CanShowAlert } from "../utils/UploadToArweave"
import { useForm, SubmitHandler } from "react-hook-form"
import DatePicker from "react-datepicker";
import { TuiDateRangePicker } from 'nextjs-tui-date-range-picker';

import {
  useContractWrite,
  useContractRead,
  usePrepareContractWrite,
  useContractEvent,
  useAccount,
  useNetwork,
} from "wagmi"

import {
  FLAGDAO_CONTRACT_ADDR,
  contractABI,
} from "../utils/constants"
import useDebounce from "../utils/useHooks";
import { supabase } from "./_app";

import getNewestFlags from "./api/getNewestFlag";
import postToSupabase from "./api/post";

type Inputs = {
    name: string
    address: string
    goal: string
    label: string
    _pledgement: number
    startDate: number
    endDate: number
}
  
export const calculate_pledgement = (_pledgement: number | string): string => {
    if (_pledgement === undefined) {
      return "0.01";
    }
    const pledgementValue = _pledgement === "" ? "0.01" : _pledgement.toString();
    return pledgementValue;
}

const ModalCreateFlag: React.FC = () => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  
  const arweaveRef = useRef<CanShowAlert>(null); // 调用子组件的方法
  const [flagIdContract, setFlagIdContract] = useState<number>(0);
  const [flagIdBackend, setFlagIdBackend] = useState<number>(0);

  // 接受从子组件 <UploadToArweave /> 传来的 arId. 设置到父组件中.
  const [arId, setArId] = useState<string>("");  // 存储 upload 后的 nftId
  const [mintStatus, setMintStatus] = useState<string>("");  // 存储 upload 情况(一般是 minting...)

  // 子组件调用时, 会 call 这个传递 arId, onArweaveIdSet 函数传递 arId
  const handleArIdChange = (arId: string) => { // 
    console.log("handleArIdChange arId: ", arId);
    setArId(arId);
    setMintStatus("");
  };

  const handleArNFTMint = (status: string) => { // Minting. if(mintStatus == "Minting") { .. }
    console.log("handleArNFTMint status: ", status);
    setMintStatus(status);
  }


  // const [startDate, setStartDate] = useState<number | Date>(0);
  // const [endDate, setEndDate] = useState<number | Date>(0);
  // const [startDate, setStartDate] = useState(new Date());
  const initDate = new Date();
  initDate.setMonth(initDate.getMonth() + 1);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(initDate);
  const [unixTimeStart, setUnixTimeStart] = useState<number>();
  const [unixTimeEnd, setUnixTimeEnd] = useState<number>();
  const options = {
    language: 'en',
    usageStatistics: false,
    format: 'YYYY-MM-dd',
    selectableRangeStart: startDate,
    selectableRangeEnd: endDate,
  };
  const handleReset = () => {
    setStartDate(new Date());
    setEndDate(initDate);
  };
  useEffect(()=>{
    setUnixTimeStart(Math.floor(startDate.getTime() / 1000));
    setUnixTimeEnd(Math.floor(endDate.getTime() / 1000));
  }, [startDate, endDate])
  console.log("startDate.getTime()", unixTimeStart);
  console.log("endDate.getTime()", unixTimeEnd);

  const { address, isConnected, status } = useAccount()
  const { chain  } = useNetwork()
  
  const [goal, setGoal] = useState<string>("")
  // const [pledgement, setPledgement] = useState<string>("0.01");
  const [_pledgement, set_Pledgement] = useState<number>(0.01)
  const _goal = useDebounce(goal, 20)
  // const _pledgement = useDebounce(pledgement, 200)

  const [name, setName] = useState<string>("")
  const [label, setLabel] = useState<string>("")
  

  const nameRef = useRef<string | undefined>("");
  nameRef.current = name;

  const labelRef = useRef<string | undefined>("");
  labelRef.current = label;

  const goalRef = useRef<string | undefined>("");
  goalRef.current = _goal;

  const pledgementRef = useRef<number | undefined>();
  pledgementRef.current = _pledgement;

  const { data: idOnchain, isError: isFlagIdErr } = useContractRead({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    functionName: 'getNewestFlagId',
  })

  useEffect(() => {
    if (idOnchain) { 
      setFlagIdContract(Number(idOnchain));
      console.log("idOnchain----", idOnchain);
    }
  }, [idOnchain]);


  useEffect(() => {
    const fetchNewestFlagFromSupabase = async () => {
      const data = await getNewestFlags();  // api/getNewestFlag
      if(data) {
        setFlagIdBackend(data[0].flagId)
        console.log("fetchNewestFlagFromSupabase----", data[0].flagId);
      }
    }
    fetchNewestFlagFromSupabase();
  }, []);


  /* forum */ 
  const { register, handleSubmit, watch, formState: { errors },} = useForm<Inputs>()
  useEffect(() => {
    setName(watch("name"));
    setGoal(watch("goal"));
    set_Pledgement(watch("_pledgement"));
    setLabel(watch("label"));
  }, [watch("name"), watch("goal"), watch("_pledgement"), watch("label")]);


  // const postToSupabase = async (flagId: number) => {
  //   console.log("To supabase, flag_id and others: ", nameRef.current, address, goalRef.current , pledgementRef.current )
  //   try{      
  //     // fetch flagID

  //     const newestflagId = data![0].flagId;
  //     console.log("newest flagID from supabase", newestflagId);
      
  //     if(data && data[0].flagId) {
  //       if(flagId == newestflagId) { 
  //         return  // flagId 在后端已经存在.
  //       }else{
  //         const {data: res } = await supabase.from("flag").insert([
  //           {
  //             flagId: Number(data[0]?.flagId + 1), // whereas `TypeError: Do not know how to serialize a BigInt`
  //             name: name,
  //             address: address,
  //             goal: _goal,
  //             pledgement: _pledgement,
  //             startAt: startAt === "" ? null : startAt,
  //             endAt: endAt === "" ? null : endAt,
  //             chain: chain?.name,
  //             chainId: chain?.id,
  //             onChain : true,
  //             arId,
  //           },
  //         ]).select()
  //         console.log("the DATA post To Backend Database: \n", res)
  //     }
  //   }
  //   } catch(error) {
  //     console.log("postToBackendDatabase error", error)
  //   }
  // }

  // // 只有这个能监听到函数,别改了..
  // // 这个函数不会调起 GamblePledge 事件.
  // // Listen Event, when on-chain contract successes, execute it to post backend database.
  useContractEvent({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    // eventName: "testEventEmit",  完整参数
    eventName: "CreateFlag", // (我发现这个地方填函数名也可以..) 完整参数 amt arTxId flagId sender
    listener: (logs) => {
      // ERC1155 Transfer 的 Emit 参数:
      // const { args } = logs[0]
      // console.log("`testEventEmit CreateFlag`.....", args)
     

      // amt : 2000000000000n
      // arTxId : "aa228340-f44a-4f65-9ee7-6aebfa8668f5"
      // flagId : 14n
      // sender : "0x65d5b68A7878A987e7A19826A7f9Aa6F5F92e10F"
      const { args: arg } = logs[1] as any
      console.log("`CreateFlag args` is .....", arg);
    },
  })

  // create function to put flag onChian.
  const { config } = usePrepareContractWrite({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    chainId: chain?.id,
    functionName: "createFlag",
    args: [_goal, arId, name, label, 102020202, 102020203], // no need to ** 18
    value: parseEther(calculate_pledgement(_pledgement)), // ethers.utils.parseEther("0.1"),
  })

  const { data: res, write, error, isLoading, isSuccess, isError } = useContractWrite(config)

  const onSubmit: SubmitHandler<Inputs> = async (data, e) => {
    e?.preventDefault();
    try {
      write?.();   //  "create(arId)"

      // postToSupabase({
      //   flagId: flagIdContract,
      //   name: data.name,
      //   address: address,
      //   goal: data.goal,
      //   pledgement: data._pledgement,
      //   start_date: data.start_date,
      //   end_date: data.end_date,
      //   chainName: chain?.name,
      //   chainId: chain?.id,
      //   arId: arId,
      // })
    }
    catch (error) { 
      console.error("onSubmit async An error occurred:", error); 
    }
  }

  // console.log("infos:, goal, name, startAt, endAt flagId\n", address, goal, name, startAt, endAt,)
  // console.log("Test upload on Chain \n", arId, _pledgement);
  
  // 状态判断
  // isLoading: 调起钱包的一瞬间, 由 false -> true.
  // isSuccess: 直到合约执行完毕, 才由 false -> true. (昨天观测到现象,今天又不成立了...)
  // console.log("isLoading, isSuccess, isError\n", isLoading, isSuccess, isError, flagId );

  return (
    <div className="flex justify-center items-center">
      <Button
        onPress={onOpen}
        className="mt-16 items-center w-auto text-center my-4 px-8 mx-10 bg-gradient-to-br from-indigo-300 via-blue-400 to-indigo-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-200  text-white font-bold py-3 rounded-xl text-xl"
        > Create Flag
      </Button>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        className="p-8 h-auto"
        // className="flex items-center justify-center w-full h-full"
        // overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
        <ModalContent>
            {(onClose: any) => (

        isConnected ? (

        <div 
        //   className="relative bg-slate-50 rounded-lg shadow-lg md:w-2/5 py-10 px-20"
          >
          <h3 className="text-2xl mb-4 text-center font-black">
            create your FLAG!
          </h3>
         

          {/* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
          <form>
            {/* register your input into the hook by invoking the "register" function */}


            <>
              <label className="text-gray-700 font-bold block mt-4">
                * Your flag(Goal) is:
              </label>
              <textarea
                className="border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700"
                defaultValue=""
                placeholder="🚩 your goal/flag..."
                autoFocus
                rows={3}
                {...register("goal", {
                  required: "Please enter your goal/flag.",
                })}
              />
              {errors?.goal && (
                <div className="mb-3 text-normal text-red-500">
                  {errors?.goal.message}
                </div>
              )}
            </>
            



            <label className="text-gray-700 font-bold block mt-4">
                    Flag&apos;s start/end date:
                  </label>
            <div className="className=border-solid border-gray-300 border mt-1 px-2 w-full rounded text-gray-700">
            <TuiDateRangePicker
              handleChange={(date) => {
                setStartDate(date[0])
                setEndDate(date[1])
              }}
              options={options}
              inputWidth={80}
              containerWidth={200}
              startpickerDate={startDate}
              endpickerDate={endDate}
              />
            </div>

            <div className="mb-6">
              <label className="text-gray-700 font-bold block mt-4">
                * Label:
              </label>
              <input
                className="border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700"
                defaultValue="Flag"
                placeholder="🤖 your flag type/label..."
                autoFocus
                {...register("label", { required: "Please enter a flag type/label." })}
              />
              {errors?.label && (
                <div className="mb-3 text-normal text-red-500">
                  {errors?.label.message}
                </div>
              )}
            </div>

            <>
              <label className="text-gray-700 font-bold block mt-4">
                * Name:
              </label>
              <input
                className="border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700"
                defaultValue=""
                placeholder="🤖 your name..."
                autoFocus
                {...register("name", { required: "Please enter a your name." })}
              />
              {errors?.name && (
                <div className="mb-3 text-normal text-red-500">
                  {errors?.name.message}
                </div>
              )}
            </>
            {/* <div className="grid grid-cols-2 justify-between gap-4">
                <div id="left">
                  <label className="text-gray-700 font-bold block mt-4">
                    Flag&apos;s Start Date:
                  </label>
                  <DatePicker
                    selected={startDate}  // startDate是您的状态变量，用于保存选择的日期
                    onChange={(date: any) => {}setStartDate(date)} // 设置startDate状态的函数
                    className="border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700"
                    placeholderText="📅 Select start date..."
                    // autoFocus
                  />
                </div>

                <div id="right">
                  <label className="text-gray-700 font-bold block mt-4">
                    End Date:
                  </label>
                  <DatePicker
                    selected={endDate}  // endDate是您的状态变量，用于保存选择的日期
                    onChange={(date: any) => {
                      const unixStamp = Math.floor(new Date(date).getTime() / 1000);
                      setEndAt(unixStamp)
                    }} // 设置endDate状态的函数
                    className="border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700"
                    placeholderText="📅 Select end date..."
                  />
                </div>
            </div> */}
            {}
            <>
              <UploadToArweave
                  ref={arweaveRef} 
                  name={name!} 
                  goal={goal?.replace(/[\r\n]/g,"").trim()}
                  onArweaveIdSet={handleArIdChange} 
                  onSetMintRes  ={handleArNFTMint}
               />  
              {
                ((!arId && (mintStatus != "Minting")) || (mintStatus == "Error")) && 
                  <button className="mt-4 w-full rounded-md bg-black    py-2 text-white border font-semibold text-md"
                    // 调用子组件的方法
                    onClick={(e) => { arweaveRef.current?.handleUploadToArweave(e) }}>
                    send to Arweave.
                  </button>
              }
              {
                (mintStatus == "Minting") && 
                    <button className="mt-4 w-full rounded-md bg-black    py-2 text-white border font-semibold text-md"
                      disabled={true}
                    >
                    sending to Arweave...
                  </button>
              }

              {
                arId && 
                  <div className="p-4 flex flex-col justify-between">
                    <div>✅ Success! </div>
                    <div>Your <span className="font-bold">Arweave</span> Flag 🚩 NFT ID is: </div>
                    <div className="text-gray-500 text-sm ml-4">{arId}</div>
                  </div>
              }
            </>
           </form>  {/* First form */}


          {/* Second form */}

          <form onSubmit={handleSubmit((e) => onSubmit(e))}>


          {arId && 
            <>
                <label className="text-gray-700 font-bold block mt-4">
                  Pledge amount for the flag:
                </label>
                <div className="jus justify-between grid grid-cols-2 ">
                  <input
                    className="border-solid inline  border-gray-300 py-1 mt-1 pl-4 border w-full rounded text-gray-700"
                    defaultValue={0.01}
                    type="number"
                    min={0.000001}
                    max={9.2}
                    step={0.000001}
                    placeholder="💰 your flag's pledge amount..."
                    autoFocus
                    {...register("_pledgement", {
                      required: "Please enter your pledge amount.",
                    })}
                  />
                  <div className="w-full py-1 mt-1 pl-2"> ETH.</div>
                </div>
                {errors?._pledgement && (
                  <div className="mb-3 text-normal text-red-500">
                    {errors?._pledgement.message}
                  </div>
                )}
 
                { (!isLoading && !isSuccess) &&
                    <button
                      className="mt-4 w-full rounded-md bg-black text-center  py-2 text-white border font-semibold text-md"
                      type="submit"
                      name="Submit"
                      disabled={isLoading}>
                      Pledge 💰 onChain
                    </button>
                }
                { isLoading &&
                    <>
                      <button className="mt-4 w-full rounded-md bg-black text-center  py-2 text-white border font-semibold text-md">
                        Calling wallet, please wait...
                      </button>
                    </>
                }
                {
                  (isSuccess && flagIdContract) && 
                      <div className="text-sm text-slate-500"> 
                        <p>Successfully uploaded to blockchain! </p>
                        <p>{name}({address?.slice(0, 3)}...{address?.slice(-2)}) pledged {_pledgement} ETH for her/his flag 🚩(with flagId is {Number(flagIdContract)})</p>
                      </div>
                }
                {
                  isError && 
                    <p className="text-sm text-slate-500">
                      User cancel or other errors.
                    </p>
                }
            </>
          }

          </form>
        </div>
        ): <div className="py-6 text-2xl font-semibold">Pls connect your wallet.</div>
        )}
        </ModalContent>
        </Modal>

    </div>
  )
}

export default ModalCreateFlag;



{/* 
<>

<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
<ModalContent>
    {(onClose) => (
    <>
        <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
        <ModalBody>
        <p> 
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Nullam pulvinar risus non risus hendrerit venenatis.
            Pellentesque sit amet hendrerit risus, sed porttitor quam.
        </p>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Nullam pulvinar risus non risus hendrerit venenatis.
            Pellentesque sit amet hendrerit risus, sed porttitor quam.
        </p>
        <p>
            Magna exercitation reprehenderit magna aute tempor cupidatat consequat elit
            dolor adipisicing. Mollit dolor eiusmod sunt ex incididunt cillum quis. 
            Velit duis sit officia eiusmod Lorem aliqua enim laboris do dolor eiusmod. 
            Et mollit incididunt nisi consectetur esse laborum eiusmod pariatur 
            proident Lorem eiusmod et. Culpa deserunt nostrud ad veniam.
        </p>
        </ModalBody>
        <ModalFooter>
        <Button color="danger" variant="light" onPress={onClose}>
            Close
        </Button>
        <Button color="primary" onPress={onClose}>
            Action
        </Button>
        </ModalFooter>
    </>
    )}
</ModalContent>
</Modal>
</> */}