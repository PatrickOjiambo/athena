// types/wallet.ts
export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  account: any | null;
  isLoading: boolean;
  error: string | null;
}

export interface SolanaAccount {
  namespaces: {
    solana: {
      accounts: string[];
      methods: string[];
      events: string[];
    };
  };
}
