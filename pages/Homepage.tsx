import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"

import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { supabaseKey, supabaseUrl } from "../utils/credentials"
import { contractABI, FLAGDAO_CONTRACT_ADDR,} from "../utils/constants"
import { createClient } from "@supabase/supabase-js"
import Logo from '../utils/Logo';
import Dropdown from "./Dropdown";
import ModalCreateFlag from './ModalCreateFlag';
import Link from "next/link";
import Card from './Card';

import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure} from "@nextui-org/react";
import { PageContext } from "../utils/context"

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

// import Modal from "react-modal"
// Modal.setAppElement("#root") // 这行代码应该在你的App根元素上
import {email, password} from "../utils/credentials";
import { Akord } from '@akord/akord-js';


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
  startDate: string
  endDate: string
  // bettors: Array<string>
  // other properties...
}

type Props = {
  searchParams: Record<string, string> | null | undefined;
  // akord : Akord
};

const Homepage = (props: Props) => {

  const { akord, supabase } = useContext(PageContext)
  // console.log("Homepage akord ", akord) // ✅

  const { chains, chain: chainId } = useNetwork()
  const { address, isConnected, status } = useAccount()

  const [curFromChild, setCurFromChild] = useState() // Flag 分类
  const [data, setData] = useState<{ [x: string]: any }[] | undefined>()
  const [darr, setDarr] = useState<{ [x: string]: any }[] | undefined>()


  /* ----- fetch from supabase  -------
  useEffect(() => {
    const fetch_flags = async () => {
      const { data, error } = await supabase.from("flag").select("*")
      if (error) {
        console.error(error)
        return
      }
      data.sort((a: any, b: any) => b.created_at.localeCompare(a.created_at))
      setData(data)
      setDarr(data)
    }

    fetch_flags()
  }, []) */

  /* ----- fetch from Contract  ------- */
  const { data: flags, isError, isLoading } = useContractRead({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI, 
    functionName: 'getFlagsPagination',
    cacheOnBlock: true,
    args: [0, 9],
    onSuccess(data) {
      console.log('Successfully fetch flags from solidity backend: \n', data)
      setData(data as any)
      setDarr(data as any)
    },
  })

  /* flag types */ 
  useEffect(() => {
    if (data && curFromChild) {
      let da: any = data.filter((item) => item.goalType === curFromChild)
      setDarr(da)
    }
    if (curFromChild === "all") {
      setDarr(data)
    }
  }, [data, curFromChild])

  function handleValueChange(value: any) {
    setCurFromChild(value)
  }

  return (
    <div className="w-full mx-auto md:w-8/12">
      <header className="h-auto mt-3">
        <div className="flex p-4 items-center justify-center">
          <div className="flex-1">
            <Logo />
          </div>
          <Dropdown onValueChange={handleValueChange} />
          <ConnectButton />
        </div>
        {/* <h1 className="text-3xl font-bold text-center mt-4">FlagDAO</h1> */}
        <ModalCreateFlag />
      </header>



      {darr &&
        darr.map((item, index) => (
          <Card
            key={index}
            goal={item.goal}
            address={item.flager}
            name={item.name}
            flagId={item.flagId}
            pledgement={item.amt}
            flagStatus={item.FlagStatus}
            onChain={item.onChain}
            created_at={item.created_at}
            startDate={item.startDate}
            endDate={item.endDate}
          />
        ))
      }
    </div>
  );
};

export default Homepage;


{/* 
        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.tsx</code>
        </p>

        <div className={styles.grid}>
          <a className={styles.card} href="https://rainbowkit.com">
            <h2>RainbowKit Documentation &rarr;</h2>
            <p>Learn how to customize your wallet connection flow.</p>
          </a>

          <a className={styles.card} href="https://wagmi.sh">
            <h2>wagmi Documentation &rarr;</h2>
            <p>Learn how to interact with Ethereum.</p>
          </a>

          <a
            className={styles.card}
            href="https://github.com/rainbow-me/rainbowkit/tree/main/examples"
          >
            <h2>RainbowKit Examples &rarr;</h2>
            <p>Discover boilerplate example RainbowKit projects.</p>
          </a>

          <a className={styles.card} href="https://nextjs.org/docs">
            <h2>Next.js Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a
            className={styles.card}
            href="https://github.com/vercel/next.js/tree/canary/examples"
          >
            <h2>Next.js Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            className={styles.card}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="https://rainbow.me" rel="noopener noreferrer" target="_blank">
          Made with ❤️ by your frens at 🌈
        </a>
      </footer>
    </div> */}