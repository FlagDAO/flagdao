import { Chain } from '../../../components/RainbowKitProvider/RainbowKitChainContext';
import { Wallet } from '../../Wallet';
import type { WalletConnectConnectorOptions, WalletConnectLegacyConnectorOptions } from '../../getWalletConnectConnector';
export interface WalletConnectWalletOptions {
    projectId?: string;
    chains: Chain[];
    options?: WalletConnectLegacyConnectorOptions | WalletConnectConnectorOptions;
}
export declare const walletConnectWallet: ({ chains, options, projectId, }: WalletConnectWalletOptions) => Wallet;
