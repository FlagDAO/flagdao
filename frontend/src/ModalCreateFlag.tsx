import React, { useState, useEffect, useRef } from "react"
import {parseEther} from "ethers";
import Modal from "react-modal"
import { UploadToArweave, CanShowAlert } from "./components/UploadToArweave"
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

export const ModalCreateFlag: React.FC<PorpsType> = ({
  flagId, // 从 App 父组件传来的 flagId, 表示.
  setFlagId,
  fetchFlags,
}) => {
  const arweaveRef = useRef<CanShowAlert>(null);

  // 接受从子组件 <UploadToArweave /> 传来的 arId. 设置到父组件中.
  const [arId, setArId] = useState<string>("");  // 存储 upload 后的 nftId
  const [mintStatus, setMintStatus] = useState<string>("");  // 存储 upload 情况(一般是 minting...)

  // 子组件调用时, 会 call 这个传递 arId, onArweaveIdSet 函数传递 arId
  const handleArIdChange = (arId: string) => { // 
    setArId(arId);
  };
  const handleArNFTMint = (status: string) => { // Minting. if(mintStatus == "Minting") { .. }
    setMintStatus(status);
  }
  const { address } = useAccount()
  const { chain } = useNetwork()
  
  const [modalIsOpen, setIsOpen] = useState(false)

  const [goal, setGoal] = useState<string>()
  const [pledgement, setPledgement] = useState<number>()
  const _goal = useDebounce(goal, 500)
  const _pledgement = useDebounce(pledgement, 500)

  const [name, setName] = useState<string>()

  const nameRef = useRef<string | undefined>('');
  nameRef.current = name;

  const goalRef = useRef<string | undefined>('');
  goalRef.current = _goal;

  const pledgementRef = useRef<number | undefined>();
  pledgementRef.current = _pledgement;


  const { register, handleSubmit, watch, formState: { errors },} = useForm<Inputs>()

  useEffect(() => {
    setName(watch("name"));
    setGoal(watch("goal"));
    setPledgement(watch("pledgement"));
  }, [watch("name"), watch("goal"), watch("pledgement")]);


  // create function to put flag onChian.
  const { config } = usePrepareContractWrite({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    chainId: chain?.id,
    functionName: "create",
    args: [arId], // no need to ** 18
    value: parseEther("0.1"), // ethers.utils.parseEther("0.1"),
  })

  const { data: res, isLoading, write, error } = useContractWrite(config)

  const onSubmit: SubmitHandler<Inputs> = async (data, e) => {
    e?.preventDefault();
    try {
      await write?.();   //  "create(arId)"
    }
    catch (error) { 
      console.error("onSubmit async An error occurred:", error); 
    }
  }

  // useRef 是为了处理:在提交表单后异步事件处理的期间，你的 React 组件状态丢失的问题。这可能是因为页面刷新或者组件重新渲染造成的。在React中，当组件重新渲染时，它的状态会被重置
  // useRef常常被用来获取和保存不会因组件重新渲染而改变的变量。
  const postToBackendDatabase = async (flag_id: number) => {
    // if (_data) { // if (_data && onChain && typeof flagId !== "undefined") {
      console.log("postToBackendDatabase(), flag_id and others: ", flag_id, nameRef.current,address, goalRef.current , pledgementRef.current )
      const { error, data: res } = await supabase.from("flag").insert([
        {
          flagID: Number(flag_id), // whereas `TypeError: Do not know how to serialize a BigInt`
          name: name,
          address: address,
          goal: _goal,
          amt: _pledgement,
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


  // const handleUploadToArweave = async () => {
  //   if (!akord) { console.error('No akord!'); return; }
    
  //   try {
  //     const nfts = await akord.nft.listAll(vaultId);
  //     console.log("akord notes", nfts);

  //     const nftMetadata: NFTMetadata = {
  //       name: goal?.toString() || "",
  //       creator: name?.toString(),
  //       owner: name?.toString() || "",
  //       collection: "flagDAO",
  //       description: goal,
  //       type: "document",
  //       topics: [goalType || ""]
  //     };

  //     // 创建一个新的 Blob 对象，它是 File 接口的基础
  //     const blob = new Blob([goal || ""], { type: 'text/plain' });
  //     const file = new File([blob], "flag.txt", { type: 'text/plain' }); // 使用 Blob 对象创建一个 File 对象

  //     const response = await akord?.nft.mint(vaultId, file, nftMetadata);
  //     setNftId(response?.nftId || "");
  //     console.log('NFT minted with ID:', response?.nftId);
  //   } catch (error) {
  //     console.error('Error minting NFT:', error);
  //   }
  // };

  
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
        <div className="relative bg-slate-50 rounded-lg shadow-lg md:w-2/5 py-10 px-20">
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
          <form>
            {/* register your input into the hook by invoking the "register" function */}
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

            <input
              className="hidden"
              defaultValue={address}
              {...register("address")}
            />

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
            
            {}
            <>
              <UploadToArweave
                  ref={arweaveRef} 
                  name={name!} 
                  goal={goal!} 
                  onArweaveIdSet={handleArIdChange} 
                  onSetMintRes  ={handleArNFTMint}/>            
              {
                !arId &&
                  <button className="mt-4 w-full rounded-md bg-black    py-2 text-white border font-semibold text-md"
                    // 调用子组件的方法
                    onClick={(e) => { arweaveRef.current?.handleUploadToArweave(e) }}>
                    send to Arweave.
                  </button>
              }

              {
                arId && 
                  <>
                    <p>Success! Your <span className="fon font-bold">Arweave</span> NFT ID is: </p>
                    <p className="text-gray-500 text-sm ml-4">{arId}</p>
                  </>
              }
            </>
           </form>  {/* First form */}





          {/* Second form */}

          <form onSubmit={handleSubmit((e) => onSubmit(e))}>

          {arId && 
            <>
                <label className="text-gray-700 font-bold block mt-4">
                  * Pledge amount for the flag:
                </label>
                <input
                  className="border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700"
                  defaultValue={0}
                  type="number"
                  min={0}
                  placeholder="💰 your flag's pledge amount..."
                  autoFocus
                  {...register("pledgement", {
                    required: "Please enter your pledge amount.",
                  })}
                />
                {errors?.goal && (
                  <div className="mb-3 text-normal text-red-500">
                    {errors?.goal.message}
                  </div>
                )}
             
                <button
                  className="mt-4 w-full rounded-md bg-black text-center  py-2 text-white border font-semibold text-md"
                  type="submit"
                  name="Submit"
                  disabled={isLoading}>
                  Pledge onChain.
                </button>
                {
                  isLoading && (
                    <>
                      <span className="mt-4 w-full rounded-md bg-black text-center  py-2 text-white border font-semibold text-md">
                        Submitting...
                      </span>
                      <p className="text-sm text-slate-500">
                        uploading to blockchain... Please wait...
                      </p>
                    </>
                  )
                }
                {
                   Boolean(flagId) && (
                      <p className="text-sm text-slate-500">
                        Uploaded on the blockchain! the flag ID is {Number(flagId)},
                        press ESC to quit.
                      </p>
                )}
            </>
          }

          </form>
        </div>
      </Modal>
    </div>
  )
}


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