import { Chain } from '../../../components/RainbowKitProvider/RainbowKitChainContext';
import { Wallet } from '../../Wallet';
export interface ImTokenWalletOptions {
    projectId?: string;
    chains: Chain[];
}
export declare const imTokenWallet: ({ chains, projectId, }: ImTokenWalletOptions) => Wallet;
