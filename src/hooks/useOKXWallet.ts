"use client";

import { useState, useEffect, useCallback } from "react";
import { OKXUniversalConnectUI, THEME } from "@okxconnect/ui";
import { OKXSolanaProvider } from "@okxconnect/solana-provider";
import { Transaction } from "@solana/web3.js";

const SOLANA_TESTNET_CHAIN =
  "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1LrZCuF3gMQ8";

export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  account: any;
  isLoading: boolean;
  error: string | null;
}

export const useOKXWallet = () => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    publicKey: null,
    account: null,
    isLoading: false,
    error: null,
  });

  const [universalUi, setUniversalUi] = useState<any>(null);
  const [solanaProvider, setSolanaProvider] = useState<any>(null);

  // Init on mount
  useEffect(() => {
    const init = async () => {
      try {
        const ui = await OKXUniversalConnectUI.init({
          dappMetaData: {
            name: "Athena",
            icon: "https://your-dapp-icon-url.com/icon.png",
          },
          actionsConfiguration: {
            modals: "all",
            returnStrategy: "none",
          },
          language: "en_US",
          uiPreferences: {
            theme: THEME.LIGHT,
          },
        });

        setUniversalUi(ui);
        setSolanaProvider(new OKXSolanaProvider(ui));
      } catch (error) {
        console.error("Init error:", error);
      }
    };

    init();
  }, []);

  // Restore connection
  useEffect(() => {
    const restoreSession = async () => {
      const shouldReconnect =
        localStorage.getItem("okx-wallet-connected") === "true";
      if (!universalUi || !solanaProvider || !shouldReconnect) return;

      try {
        const accountInfo =
          await solanaProvider.getAccount(SOLANA_TESTNET_CHAIN);
        setState({
          isConnected: true,
          publicKey: accountInfo.address,
          account: accountInfo,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Session restore error:", error);
        localStorage.removeItem("okx-wallet-connected");
      }
    };

    restoreSession();
  }, [universalUi, solanaProvider]);

  const connect = useCallback(async () => {
    if (!universalUi) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const session = await universalUi.openModal({
        namespaces: {
          solana: {
            chains: [SOLANA_TESTNET_CHAIN],
            methods: [
              "solana_getAccounts",
              "solana_signMessage",
              "solana_signTransaction",
              "solana_signAndSendTransaction",
            ],
            events: ["accountsChanged", "chainChanged"],
          },
        },
      });

      if (session?.namespaces?.solana?.accounts?.length) {
        const pubKey = session.namespaces.solana.accounts[0].split(":")[2];
        localStorage.setItem("okx-wallet-connected", "true");

        setState((prev) => ({
          ...prev,
          isConnected: true,
          account: session,
          publicKey: pubKey,
        }));
      }
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err.message || "Connection failed",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [universalUi]);

  const disconnect = useCallback(async () => {
    if (!universalUi) return;

    try {
      await universalUi.disconnect();
    } catch (err) {
      console.error("Disconnect error:", err);
    }

    localStorage.removeItem("okx-wallet-connected");
    setState({
      isConnected: false,
      publicKey: null,
      account: null,
      isLoading: false,
      error: null,
    });
  }, [universalUi]);

  const signMessage = useCallback(
    async (message: string) => {
      if (!solanaProvider || !state.publicKey)
        throw new Error("Wallet not connected");
      return solanaProvider.signMessage(message, SOLANA_TESTNET_CHAIN);
    },
    [solanaProvider, state.publicKey],
  );

  const signTransaction = useCallback(
    async (transaction: Transaction) => {
      if (!solanaProvider || !state.publicKey)
        throw new Error("Wallet not connected");
      return solanaProvider.signTransaction(transaction, SOLANA_TESTNET_CHAIN);
    },
    [solanaProvider, state.publicKey],
  );

  const signAndSendTransaction = useCallback(
    async (transaction: Transaction) => {
      if (!solanaProvider || !state.publicKey)
        throw new Error("Wallet not connected");
      return solanaProvider.signAndSendTransaction(
        transaction,
        SOLANA_TESTNET_CHAIN,
      );
    },
    [solanaProvider, state.publicKey],
  );

  return {
    ...state,
    connect,
    disconnect,
    signMessage,
    signTransaction,
    signAndSendTransaction,
  };
};
