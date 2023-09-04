import type { MetaMaskConnectorOptions } from '@wagmi/core/connectors/metaMask';
import { Chain } from '../../../components/RainbowKitProvider/RainbowKitChainContext';
import { Wallet } from '../../Wallet';
export interface MetaMaskWalletOptions {
    projectId?: string;
    chains: Chain[];
}
export declare const metaMaskWallet: ({ chains, projectId, ...options }: MetaMaskWalletOptions & MetaMaskConnectorOptions) => Wallet;
