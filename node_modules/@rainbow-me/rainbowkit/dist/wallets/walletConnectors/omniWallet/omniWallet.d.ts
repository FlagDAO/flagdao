import { Chain } from '../../../components/RainbowKitProvider/RainbowKitChainContext';
import { Wallet } from '../../Wallet';
export interface OmniWalletOptions {
    projectId?: string;
    chains: Chain[];
}
export declare const omniWallet: ({ chains, projectId, }: OmniWalletOptions) => Wallet;
