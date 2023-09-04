import { Chain } from '../../../components/RainbowKitProvider/RainbowKitChainContext';
import { Wallet } from '../../Wallet';
export interface ArgentWalletOptions {
    projectId?: string;
    chains: Chain[];
}
export declare const argentWallet: ({ chains, projectId, }: ArgentWalletOptions) => Wallet;
