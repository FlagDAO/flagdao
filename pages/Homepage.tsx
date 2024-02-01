import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState, useEffect, lazy } from "react"
import { supabaseKey, supabaseUrl } from "../utils/credentials"
import { contractABI, FLAGDAO_CONTRACT_ADDR,} from "../utils/constants"
import { createClient } from "@supabase/supabase-js"
import Logo from '../utils/Logo';
import ModalCreateFlag from './ModalCreateFlag';
import Link from "next/link";
import Card from './Card';

import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure} from "@nextui-org/react";


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

type Props = {
  searchParams: Record<string, string> | null | undefined;
};

const Homepage = ({ searchParams }: Props) => {
  // next.js Modal.

  const { chains, chain: chainId } = useNetwork()
  const { address, isConnected, status } = useAccount()
  const [curFromChild, setCurFromChild] = useState() // Flag 分类
  const [data, setData] = useState<{ [x: string]: any }[] | undefined>()
  const [darr, setDarr] = useState<{ [x: string]: any }[] | undefined>()
  const [flagId, setFlagId] = useState(0)

  const supabase = createClient(supabaseUrl, supabaseKey)

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

  function handleValueChange(value: any) {
    setCurFromChild(value)
  }

  return (
    <div className="w-full mx-auto md:w-7/12 bg-blue">
      <header className="bg-white h-auto mt-3">
        <div className="flex p-4 items-center justify-center">
          <div className="flex-1 bg-white">
            <Logo />
          </div>
          {/* <Dropdown onValueChange={handleValueChange} /> */}
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