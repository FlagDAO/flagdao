import type { InjectedConnectorOptions } from '@wagmi/core/connectors/injected';
import { Chain } from '../../../components/RainbowKitProvider/RainbowKitChainContext';
import { Wallet } from '../../Wallet';
export interface ZerionWalletOptions {
    projectId?: string;
    chains: Chain[];
}
export declare const zerionWallet: ({ chains, projectId, ...options }: ZerionWalletOptions & InjectedConnectorOptions) => Wallet;
