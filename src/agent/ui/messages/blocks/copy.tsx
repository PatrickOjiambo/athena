/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
    type HederaSignerType,
    type HWBridgeSigner,
    useAccountId,
    useWallet,
} from "@buidlerlabs/hashgraph-react-wallets";
import { TransferTransaction, Hbar } from "@hashgraph/sdk";
import { toast, Toaster } from "sonner";
import axios from "axios"
import { BASEHOST } from "@/integrations/basehost";
interface Props {
    agentName: string;
    strategy: number;
    agentAddress: string;
}

export function Copy(props: Props) {
    console.log("Copy component", props);
    const [isLoading, setIsLoading] = useState(false);
    const { agentName, agentAddress } = props;
    const { data: accountId } = useAccountId();
    console.log("Copy component props", props);

    const { isConnected, signer } = useWallet();
    function isHederaSigner(signer: HWBridgeSigner): signer is HederaSignerType {
        // Check based on properties that are unique to HederaSignerType
        return (signer as HederaSignerType).topic !== undefined;
    }
    const handleCopy = async () => {
        if (!isConnected) {
            toast.error("Please connect your wallet first");
            return;
        }
        if (!signer) {
            toast.error("Wallet not connected");
            return;
        }
        if (!isHederaSigner(signer)) {
            toast.error("Invalid signer");
            return;
        }
        try {
            const response = await axios.post(`${BASEHOST}/api/v1/users/follow`, {
                user_hedera_account: accountId,
                agent_hedera_account: agentAddress
            })
            if ((response.status === 201 || response.status === 200)) {
                const amountResponse = await axios.get(`${BASEHOST}/api/v1/agents/address/${agentAddress}`);

                if ((amountResponse.status === 201 || amountResponse.status === 200)) {
                    const amount = amountResponse.data?.subscription_fee;
                    console.log("|AccountId=> ", accountId);
                    const transferTokenTx = new TransferTransaction()
                        .addHbarTransfer(accountId, new Hbar(-1))
                        .addHbarTransfer("0.0.5805516", new Hbar(1))
                    console.log("transfer hbra tx=>", transferTokenTx);
                    const signedTx = await transferTokenTx.freezeWithSigner(signer);
                    const result = await signedTx.executeWithSigner(signer);
                    console.log("Transfer of coinst transaction executed =>", result.transactionId.toString());
                    toast.success("Agent copied successfully");
                    setIsLoading(false);
                    return;
                }
                else {
                    toast.error("Error occured while copying");
                    setIsLoading(false);
                    return;
                }
            } else {
                toast.error("Error occured while copying");
                setIsLoading(false);
                return;
            }
        }
        catch (error) {
            console.log("Error occured while copying: ", error);
            toast.error("Error occured while copying");
            setIsLoading(false);
        }
        setIsLoading(false);
        return;
    };

    return (
        <div className="w-full mt-2">
            <Toaster />
            <button
                onClick={handleCopy}
                disabled={isLoading || !isConnected}
                className="w-[88%] mx-auto px-4 py-2 rounded-md bg-[var(--primary)] hover:bg-purple-500 text-[var(--primary-foreground)] font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                    </>
                ) : (
                    <span>Copy {agentName}</span>
                )}
            </button>
        </div>
    );
}
