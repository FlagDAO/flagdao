import "./App.css" // 导入你的 CSS 文件，包括自定义的样式类
import { ConnectButton } from "@rainbow-me/rainbowkit"
// import Card from
import Logo from "./components/Logo"
import { supabaseKey, supabaseUrl } from "./utils/credentials"
import { createClient } from "@supabase/supabase-js"

import Modal from "react-modal"
import {ModalCreateFlag} from "./ModalCreateFlag"
// import { ethers, BigNumber } from "ethers"

import { useState, useEffect, lazy } from "react"
// const Card = lazy(() => import("./Card"));
import Card from "./Card";

import {
  useAccount,
  useBalance,
  useConnect,
  useContractRead,
  useContractWrite,
  useNetwork,
  useWaitForTransaction,
  usePrepareContractWrite,
} from "wagmi"
import {
  contractABI,
  FLAGDAO_CONTRACT_ADDR,
} from "./utils/constants"
import Dropdown from "./components/Dropdown"

Modal.setAppElement("#root") // 这行代码应该在你的App根元素上



type FormData = {
  goal: string
  self_pledged: number
}

export interface CardProps {
  goal: string
  address: string
  name: string
  flagId: number
  pledgement: number
  flagStatus: string
  onChain: boolean
  created_at: string
  startAt: string
  endAt: string
  // bettors: Array<string>
  // other properties...
}



const App = () => {
  const { chains, chain: chainId } = useNetwork()
  const { address, isConnected, status } = useAccount()
  const [curFromChild, setCurFromChild] = useState() // Flag 分类
  const [data, setData] = useState<{ [x: string]: any }[] | undefined>()
  const [darr, setDarr] = useState<{ [x: string]: any }[] | undefined>()
  const [flagId, setFlagId] = useState(0)

  const supabase = createClient(supabaseUrl, supabaseKey)
  // console.log("supabaseKey, supabaseUrl", supabaseKey, supabaseUrl);

  const fetchFlags = async () => {
    const { data: res, error } = await supabase.from("flag").select("*")
    if (error) {
      console.error(error)
      return
    }
    res.sort((a, b) => b.created_at.localeCompare(a.created_at))
    setData(res)
    setDarr(res)
  }

  useEffect(() => {
    fetchFlags()
  }, [])

  useEffect(() => {
    if (data && curFromChild) {
      let da: any = data.filter((item) => item.goalType === curFromChild)
      setDarr(da)
    }
    if (curFromChild === "all") {
      setDarr(data)
    }
  }, [data, curFromChild])

  // const { connector } = useAccount(); // Metamask
  // console.log("chainId, address", chainId, address)
  // console.log("data", data)
  // console.log("curFromChild", curFromChild)
  // console.log("darr", darr)

  /*
  取数据暂时不从 Contract 拿了, 从后端拿
  const { data: res, isError, isLoading, refetch, isFetching ,error} = useContractRead({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    functionName: 'getAllFlags',
    chainId: Number(REACT_APP_CHAIN_ID)
  })
  */

  function handleValueChange(value: any) {
    setCurFromChild(value)
  }

  return (
    <div className="w-full mx-auto md:w-7/12 bg-white">
      <header className="bg-white h-auto mt-3">
        <div className="flex p-4 items-center justify-center">
          <div className="flex-1 bg-white">
            <Logo />
          </div>
          <Dropdown onValueChange={handleValueChange} />
          <ConnectButton />
        </div>
        {/* <h1 className="text-3xl font-bold text-center mt-4">FlagDAO</h1> */}

        <ModalCreateFlag
          flagId={flagId}
          setFlagId={setFlagId}
          fetchFlags={fetchFlags}
        />
      </header>

      {darr &&
        darr.map((item, index) => (
          <Card
            key={index}
            goal={item.goal}
            address={item.address}
            name={item.name}
            flagId={item.flagId}
            pledgement={item.pledgement}
            flagStatus={item.flagStatus}
            onChain={item.onChain}
            created_at={item.created_at}
            startAt={item.startAt}
            endAt={item.endAt}
          />
        ))}
      {/* { (data as { goal: string, flager: string ,flag_id: Number, self_pledged: Number}[]) &&
        (data as { goal: string, flager: string ,flag_id: Number, self_pledged: Number}[]).map(
            (item: CardProps, index: number) => 
              <Card key={index} goal={item.goal} flager={item.flager} flag_id={item.flag_id} self_pledged={item.self_pledged}/>
          )
      } */}
    </div>
  )
}

export default App
