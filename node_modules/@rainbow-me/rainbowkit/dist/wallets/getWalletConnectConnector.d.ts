import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { WalletConnectLegacyConnector } from 'wagmi/connectors/walletConnectLegacy';
import { Chain } from '../components/RainbowKitProvider/RainbowKitChainContext';
type WalletConnectConnectorConfig = ConstructorParameters<typeof WalletConnectConnector>[0];
export type WalletConnectConnectorOptions = WalletConnectConnectorConfig['options'];
type WalletConnectLegacyConnectorConfig = ConstructorParameters<typeof WalletConnectLegacyConnector>[0];
export type WalletConnectLegacyConnectorOptions = WalletConnectLegacyConnectorConfig['options'];
export declare function getWalletConnectConnector(config: {
    chains: Chain[];
    projectId?: string;
    options?: WalletConnectLegacyConnectorOptions;
}): WalletConnectLegacyConnector;
export declare function getWalletConnectConnector(config: {
    version: '1';
    chains: Chain[];
    options?: WalletConnectLegacyConnectorOptions;
}): WalletConnectLegacyConnector;
export declare function getWalletConnectConnector(config: {
    version: '2';
    chains: Chain[];
    projectId: string;
    options?: WalletConnectConnectorOptions;
}): WalletConnectConnector;
export {};
