import type { InjectedConnectorOptions } from '@wagmi/core/connectors/injected';
import { Chain } from '../../../components/RainbowKitProvider/RainbowKitChainContext';
import { Wallet } from '../../Wallet';
declare global {
    interface Window {
        trustwallet: Window['ethereum'];
    }
}
export interface TrustWalletOptions {
    projectId?: string;
    chains: Chain[];
}
export declare const trustWallet: ({ chains, projectId, ...options }: TrustWalletOptions & InjectedConnectorOptions) => Wallet;
