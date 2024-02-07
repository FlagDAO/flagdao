import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import React, {useState, useEffect, forwardRef, useRef, useImperativeHandle} from "react";
import { PageContext } from "../utils/context"
import {NextUIProvider} from "@nextui-org/react";
import {
  arbitrum,
  goerli,
  mainnet,
  optimism,
  polygon,
  base,
  zora,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';

/* supabase */
import { createClient } from "@supabase/supabase-js"
import { supabaseKey, supabaseUrl } from "../utils/credentials"

export const supabase = createClient(supabaseUrl, supabaseKey)

/* Akord (Arweave) */
import { email, password, auth_token } from "../utils/credentials"
import { Akord, Auth, NFTMetadata } from "@akord/akord-js";
const vaultId: string = "MVCubhFGdWwrlRq_p_yvYOHvCCcs0agMl0Cc1oFPMY8"
export {vaultId};

/* Wallet config */
const projectId = 'b7be756b405935a67c4130e662fa2e69';
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    goerli,
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    zora,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [goerli] : []),
  ],
  [publicProvider()]
);

const connectors = connectorsForWallets([
  {
    groupName: 'Suggested',
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ projectId, chains }),
      rainbowWallet({ projectId, chains }),
      coinbaseWallet({ chains, appName: 'My RainbowKit App' }),
      walletConnectWallet({ projectId, chains }),
    ],
  },
]);

// const { connectors: wagmi_connectors } = getDefaultWallets({
//   appName: 'flagspace.',
//   projectId,
//   chains,
// });

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  const [akord, setAkord] = useState<Akord | null>(null);
  console.log("Akord in _app.js", akord)

  useEffect(() => {
    async function signInAndInit() {
        try {
            const { wallet } = await Auth.signIn(email, password);
            const akord = await Akord.init(wallet);
            setAkord(akord)
            console.log("set akord", akord);
        } catch (error) {
            // 这里处理任何可能发生的错误
            console.error(error);
        }
    }
    signInAndInit();
  }, []); // 空数组表示这个 effect 只在组件挂载时运行一次

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider modalSize="compact" locale='en' chains={chains}>
        <NextUIProvider>
          <PageContext.Provider
            value={{akord, supabase}}
          >
            <Component {...pageProps} akord={akord}/>
          </PageContext.Provider>
        </NextUIProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
