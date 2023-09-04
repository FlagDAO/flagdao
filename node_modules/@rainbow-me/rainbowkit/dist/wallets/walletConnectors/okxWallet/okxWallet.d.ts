import type { InjectedConnectorOptions } from '@wagmi/core/connectors/injected';
import { Chain } from '../../../components/RainbowKitProvider/RainbowKitChainContext';
import { Wallet } from '../../Wallet';
export interface OKXWalletOptions {
    projectId?: string;
    chains: Chain[];
}
export declare const okxWallet: ({ chains, projectId, ...options }: OKXWalletOptions & InjectedConnectorOptions) => Wallet;
