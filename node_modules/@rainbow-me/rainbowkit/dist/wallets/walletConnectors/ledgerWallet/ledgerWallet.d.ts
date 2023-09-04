import { Chain } from '../../../components/RainbowKitProvider/RainbowKitChainContext';
import { Wallet } from '../../Wallet';
export interface LedgerWalletOptions {
    projectId?: string;
    chains: Chain[];
}
export declare const ledgerWallet: ({ chains, projectId, }: LedgerWalletOptions) => Wallet;
