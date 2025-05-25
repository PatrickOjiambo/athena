"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IconWallet } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { useOKXWallet } from "@/hooks/useOKXWallet";

export const OKXWalletButton = () => {
  const { isConnected, connect, disconnect, publicKey, isLoading } =
    useOKXWallet();
  const prevConnectedRef = useRef(false);

  useEffect(() => {
    if (isConnected && !prevConnectedRef.current) {
      toast.success("Wallet connected");
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch {
      toast.error("Failed to connect");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success("Wallet disconnected");
    } catch (error) {
      toast.error("Failed to disconnect");
      console.error(error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {!isConnected ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleConnect}
        // disabled={isLoading}
        >
          <IconWallet className="mr-2 h-4 w-4" /> Connect OKX Wallet
        </Button>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            {publicKey?.slice(0, 4)}...
            {publicKey?.slice(-4)}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={isLoading}
          >
            <IconWallet className="mr-2 h-4 w-4" /> Disconnect
          </Button>
        </>
      )}
    </div>
  );
};
