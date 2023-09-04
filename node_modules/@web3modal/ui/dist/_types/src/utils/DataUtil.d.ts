export declare const DataUtil: {
    externalWallets(): import("@wagmi/connectors/dist/base-269cc543").C<any, any>[];
    manualWallets(): {
        id: string;
        name: string;
        mobile: {
            universal: string;
            native?: string | undefined;
        };
        links: {
            universal: string;
            native?: string | undefined;
        };
    }[] | {
        id: string;
        name: string;
        desktop: {
            universal: string;
            native?: string | undefined;
        };
        links: {
            universal: string;
            native?: string | undefined;
        };
    }[];
    installedInjectedWallets(): import("@web3modal/core").Listing[] | {
        name: string;
        id: string;
        image_id: undefined;
    }[];
    injectedWallets(): import("@web3modal/core").Listing[];
    recentWallet(): import("@web3modal/core").WalletData | undefined;
    recomendedWallets(skipRecent?: boolean): import("@web3modal/core").Listing[];
};
