import React, { useState, useEffect, useRef } from "react"
import Modal from "react-modal"
import { useForm, SubmitHandler } from "react-hook-form"
import { supabaseKey, supabaseUrl } from "./utils/credentials"
import { createClient } from "@supabase/supabase-js"
import {
  useContractWrite,
  usePrepareContractWrite,
  useContractEvent,
  useAccount,
  useNetwork
} from "wagmi"
import {
  FLAGDAO_CONTRACT_ADDR,
  contractABI,
} from "./utils/constants"
import useDebounce from "./usehooks"

// Modal.setAppElement('#root');  // 这行代码应该在你的App根元素上

import {email, password} from "./utils/credentials"

import { Akord, Auth, NFTMetadata } from "@akord/akord-js";
const { wallet, jwt } = await Auth.signIn(email, password);
const akord = await Akord.init(wallet);
const vaultId: string = "MVCubhFGdWwrlRq_p_yvYOHvCCcs0agMl0Cc1oFPMY8"
const manifestNode = await akord.manifest.get(vaultId);

type Inputs = {
  isOnchain: string
  name: string
  address: string
  goal: string
  pledgement: number
  goal_type: string
  start_date: string
  end_date: string
}

type PorpsType = {
  flagId: number
  setFlagId: Function
  fetchFlags: Function
}

const supabase = createClient(supabaseUrl, supabaseKey)

const ModalComponent: React.FC<PorpsType> = ({
  flagId,
  setFlagId,
  fetchFlags,
}) => {
  const { address } = useAccount()
  const { chain } = useNetwork()
  
  const [modalIsOpen, setIsOpen] = useState(false)
  const [goal, setGoal] = useState<string>()
  const [pledgement, setPledgement] = useState<number>()
  const _goal = useDebounce(goal, 500)
  const _pledgement = useDebounce(pledgement, 500)
  const [name, setName] = useState<string>()
  const [isOnchain, setIsOnchain] = useState<string>();
  const [goalType, setGoalType] = useState<string>();

  const nameRef = useRef<string | undefined>('');
  nameRef.current = name;

  const goalRef = useRef<string | undefined>('');
  goalRef.current = _goal;

  const pledgementRef = useRef<number | undefined>();
  pledgementRef.current = _pledgement;

  const goalTypeRef = useRef<string | undefined>('');
  goalTypeRef.current = goalType;

  const [onChain, setOnChain] = useState(true)
  // const [flagId, setFlagId] = useState<any | undefined>();

  const { register, handleSubmit, watch, formState: { errors },} = useForm<Inputs>()

  const [nftId, setNftId] = useState<string | null>(null); // 存储 mint 后的 nftId

  // console.log("supabaseKey, supabaseUrl", supabaseKey, supabaseUrl);

  // useEffect(() => {
  //   setPledgement(watch("pledgement"))
  //   setGoal(watch("goal"))
  //   setName(watch("name"))
  //   // console.log("goal, pledgement: ", goal, pledgement)
  // }, [watch("name"), watch("pledgement"), watch("goal")])

  useEffect(() => {
    setIsOnchain(watch("isOnchain"));
    setName(watch("name"));
    setGoal(watch("goal"));
    setPledgement(watch("pledgement"));
    setGoalType(watch("goal_type"));
  }, [watch("isOnchain"), watch("name"), watch("goal"), watch("pledgement"), watch("goal_type")]);


  // // before transfer money to contract, you need to approve the contract allowance.
  // const { config: config_erc } = usePrepareContractWrite({
  //   address: ERC20_CONTRACT_ADDR,
  //   abi: ercABI,
  //   chainId: chain?.id,
  //   functionName: "approve",
  //   args: [FLAGDAO_CONTRACT_ADDR, _pledgement ?? 0 ], // no need to ** 18, cause in contract it has been.
  //   enabled: Boolean(_pledgement),
  // })
  // const { data: erc_approve_res, isSuccess, write: erc20_approve, error: erc_error } = useContractWrite(config_erc)
  // console.log("erc20_approve isSuccess", isSuccess)

  // launch function to transfer money to contract.
  const { config } = usePrepareContractWrite({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    chainId: chain?.id,
    functionName: "launch",
    args: [_goal, _pledgement ?? 0 ], // no need to ** 18
    enabled: Boolean(_pledgement),
  })

  const { data: res, isLoading, write, error } = useContractWrite(config)
  // console.log("write() function:", write);  if Metamask can't be called, check it.

  const onSubmit: SubmitHandler<Inputs> = async (data, e) => {
    e?.preventDefault();
    try { 
      await write?.();   // transfer ERC-20 token to `flag.sol` contract.
    }
    catch (error) { console.error("onSubmit async An error occurred:", error); }
  }
  console.log("...others", name,address,_goal,_pledgement,goalType)

  // useRef 是为了处理:在提交表单后异步事件处理的期间，你的React组件状态丢失的问题。这可能是因为页面刷新或者组件重新渲染造成的。在React中，当组件重新渲染时，它的状态会被重置
  // useRef常常被用来获取和保存不会因组件重新渲染而改变的变量。
  const postToBackendDatabase = async (flag_id: number) => {
    // if (_data) { // if (_data && onChain && typeof flagId !== "undefined") {
      console.log("postToBackendDatabase(), flag_id and others: ", flag_id, nameRef.current,address, goalRef.current , pledgementRef.current, goalTypeRef.current )
      const { error, data: res } = await supabase.from("flag").insert([
        {
          flagID: Number(flag_id), // whereas `TypeError: Do not know how to serialize a BigInt`
          name: name,
          address: address,
          goal: _goal,
          amt: _pledgement,
          goalType: goalType,
          onChain,
          // startAt: _data.start_date === "" ? null : _data.start_date,
          // endAt: _data.end_date === "" ? null : _data.end_date,
        },
      ]).select()
      console.log("postToBackendDatabase res", res)
      console.log("postToBackendDatabase error", error)
  }

  // Listen Event, when on-chain contract successes, execute it to post backend database.
  useContractEvent({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    eventName: "Launch",
    listener(log: any) {
      console.log("log[0].args.id.....", log[0])
      postToBackendDatabase(log[0].args.id) // pass in the flag_id.
    },
  })

  function openModal() { setIsOpen(true) }
  function closeModal() { setIsOpen(false) }





  const nftMetadata: NFTMetadata = {
    name: goal?.toString() || "",
    creator: name?.toString(),
    owner: address?.toString() || "", // should be a valid Arweave address
    collection: "flagDAO",
    description: goal,
    type: "document",
    topics: [goalType || ""]
  };
  
  // 创建一个新的 Blob 对象，它是 File 接口的基础
  const blob = new Blob([goal || ""], { type: 'text/plain' });
  const file = new File([blob], "flag.txt", { type: 'text/plain' }); // 使用 Blob 对象创建一个 File 对象

  const handleMintNft = async () => {
    if (!file) { console.error('No file selected'); return; }
    try {
      console.log("nftMetadata", nftMetadata);
      const response = await akord.nft.mint(vaultId, file, nftMetadata);
      setNftId(response.nftId);
      console.log('NFT minted with ID:', response.nftId);
    } catch (error) {
      console.error('Error minting NFT:', error);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <button
        onClick={openModal}
        className="mt-16 items-center w-auto text-center my-4 px-8 mx-10 bg-gradient-to-br from-indigo-300 via-blue-400 to-indigo-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-200  text-white font-bold py-3 rounded-xl text-xl"
      >
        Create Flag
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="flex items-center justify-center w-full h-full"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <div className="relative bg-slate-50 rounded-lg shadow-lg w-2/5 py-10 px-20">
          <button 
            onClick={closeModal}
            className="absolute top-4 right-4 p-2"
            style={{ cursor: 'pointer' }}
          >
            <span role="img" aria-label="Close" className="text-3xl font-bold"> ×</span>
          </button>
          <h3 className="text-2xl mb-4 text-center font-black">
            create your FLAG!
          </h3>

          {/* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
          <form onSubmit={handleSubmit((e) =>  onSubmit(e))}>
            {/* register your input into the hook by invoking the "register" function */}
            <label className="block text-gray-700 font-bold">
              * OnChain or not:
            </label>
              <select
                id="countries"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                {...register("isOnchain", { required: true })}
              >
                <option
                  defaultValue="onchain"
                  value="onchain"
                  className="border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700"
                >on-chain </option>
                <option
                  value="offchain"
                  className="border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700"
                >off-chain</option>
              </select>
            <>
              <label className="block text-gray-700 font-bold">1111</label>
              <button onClick={handleMintNft}>Mint NFT</button>
              {nftId && <p>NFT ID: {nftId}</p>}            
            </>



            <>
              <label className="text-gray-700 font-bold block mt-4">
                * Name:
              </label>
              <input
                className="border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700"
                defaultValue=""
                placeholder="your name..."
                autoFocus
                {...register("name", { required: "Please enter a your name." })}
              />
              {errors?.name && (
                <div className="mb-3 text-normal text-red-500">
                  {errors?.name.message}
                </div>
              )}
            </>

            <input
              className="hidden"
              defaultValue={address}
              {...register("address")}
            />

            <>
              <label className="text-gray-700 font-bold block mt-4">
                * Goal(flag):
              </label>
              <input
                className="border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700"
                defaultValue=""
                placeholder="your goal/flag..."
                autoFocus
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

            {onChain && (
              <>
                <label className="text-gray-700 font-bold block mt-4">
                  * Flag's Pledge Amount:
                </label>
                <input
                  className="border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700"
                  defaultValue={0}
                  type="number"
                  placeholder="your flag's pledge amount..."
                  autoFocus
                  {...register("pledgement", {
                    required: "Please enter your goal/flag.",
                  })}
                />
                {errors?.goal && (
                  <div className="mb-3 text-normal text-red-500">
                    {errors?.goal.message}
                  </div>
                )}
              </>
            )}

            <>
              <label className="text-gray-700 font-bold block mt-4">
                * Goal Type：
              </label>
              {errors?.goal_type && (
                <div className="text-normal text-red-500 ">
                  {errors?.goal_type.message}
                </div>
              )}
              <div>
                <label className="ml-4 inline-block text-sm">
                  <input
                    className="mt-2 mr-1"
                    value="Rust"
                    type="radio"
                    {...register("goal_type", {
                      required: "This is required.",
                    })}
                  />
                  Rust
                </label>
              </div>

              <div>
                <label className="ml-4 inline-block text-sm">
                  <input
                    className="mt-2 mr-1"
                    type="radio"
                    value="ZKP"
                    {...register("goal_type")}
                  />
                  ZKP
                </label>
              </div>

              <div>
                <label className="ml-4 inline-block text-sm">
                  <input
                    className="mt-2 mr-1"
                    type="radio"
                    value="Co-lean"
                    {...register("goal_type")}
                  />
                  Co-lean (CreatorsDAO)
                </label>
              </div>

              <div>
                <label className="ml-4 inline-block text-sm">
                  <input
                    className="mt-2 mr-1"
                    type="radio"
                    value="others"
                    {...register("goal_type")}
                  />
                  Other flags
                </label>
              </div>
            </>

            {/* <>
              <label className="text-gray-700 font-bold inline mt-4">
                Flag Start At:
              </label>
              <input
                type="date"
                className="ml-4 inline mb-3 w-auto p-2 border border-gray-300 rounded"
                {...register("start_date")}
              />
            </>
            <div></div>
            <>
              <label className="text-gray-700 font-bold inline mt-2">
                Flag End At:
              </label>
              <input
                type="date"
                className="ml-6 inline mb-4 w-auto p-2 border border-gray-300 rounded"
                {...register("end_date")}
              />
            </> */}
            {isLoading ? (
              <span className="mt-4 w-full rounded-md bg-black px-20  py-2 text-white border font-semibold text-md">
                Submitting...
              </span>
            ) : (
              <button
                className="mt-4 w-full rounded-md bg-black px-20  py-2 text-white border font-semibold text-md"
                type="submit"
                name="Submit"
                disabled={isLoading}
              >
                {" "}
                Submit{" "}
              </button>
            )}
            {isLoading && (
              <p className="text-sm text-slate-500">
                uploading to blockchain... Please wait...
              </p>
            )}
            {Boolean(flagId) && (
              <p className="text-sm text-slate-500">
                Uploaded on the blockchain! the flag ID is {Number(flagId)},
                press ESC to quit.
              </p>
            )}
          </form>
        </div>
      </Modal>
    </div>
  )
}

export default ModalComponent
