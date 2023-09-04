import type { ClientCtrlState } from '../types/controllerTypes';
export declare const ClientCtrl: {
    ethereumClient: undefined;
    setEthereumClient(ethereumClient: ClientCtrlState['ethereumClient']): void;
    client(): import("chains/ethereum").EthereumClient;
};
