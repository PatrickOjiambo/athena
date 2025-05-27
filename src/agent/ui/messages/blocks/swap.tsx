import { useState, useEffect } from "react";
import { Loader2, ArrowDown, ChevronDown, Info } from "lucide-react";
import { toast } from "sonner";
import getUserPortfolio from "@/agent/tools/get_user_portfolio";
import { getListOfTokens } from "@/agent/tools/get_list_of_tokens";
import { useOKXWallet } from "@/hooks/useOKXWallet";
import CreateSwapTransaction from "@/agent/tools/create_swap_transaction";
import { VersionedTransaction, Transaction } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { set } from "date-fns";

interface SwapProps {
    fromTokenSymbol: string;
    toTokenSymbol: string;
}
interface BridgeTokenPairs {
    fromTokenSymbol: string;
    toTokenSymbol: string;
    fromTokenAddress: string;
    toTokenAddress: string;
    decimalsSold: string
}

//SOL "11111111111111111111111111111111"
//DECIMALS 9
export function Swap({ fromTokenSymbol, toTokenSymbol }: SwapProps) {
    console.log("[Swap] Initializing with props:", { fromTokenSymbol, toTokenSymbol });
    const [fromToken, setFromToken] = useState<string>()
    const [toToken, setToToken] = useState<string>();
    const [tokenPair, setTokenPair] = useState<BridgeTokenPairs>();
    const [isLoading, setIsLoading] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const { isConnected, connect, disconnect, publicKey, signAndSendTransaction } = useOKXWallet();
    const [amount, setAmount] = useState<number>();

    useEffect(() => {
        console.log("[Swap/useEffect] Running useEffect with isConnected:", isConnected, "publicKey:", publicKey);

        async function fetchDetails() {
            
            if (!publicKey) {
                console.log("[Swap/fetchDetails] No public key available, skipping fetch");
                return;
            }

            try {
                console.log("[Swap/fetchDetails] Fetching portfolio and tokens...");
                const portfolio = await getUserPortfolio(publicKey);
                const allTokens = await getListOfTokens();
                console.log("[Swap/fetchDetails] Portfolio:", portfolio, "All tokens:", allTokens);

                const tokenPair = allTokens.find(token =>
                    (token.tokenSymbol === toTokenSymbol)
                );

                console.log("[Swap/fetchDetails] Found token pair:", tokenPair);

                if (!portfolio || !allTokens) {
                    console.error("[Swap/fetchDetails] Missing portfolio or tokens data");
                    toast.error("Failed to fetch portfolio or tokens.");
                    return;
                }
                if (!tokenPair) {
                    console.error("[Swap/fetchDetails] Token pair not found");
                    toast.error("Token pair not found.");
                    return;
                }

                setTokenPair({
                    fromTokenSymbol: fromTokenSymbol,
                    toTokenSymbol: toTokenSymbol,
                    fromTokenAddress: allTokens.find(token => token.tokenSymbol === fromTokenSymbol)?.tokenContractAddress || "11111111111111111111111111111111",
                    toTokenAddress: tokenPair.tokenContractAddress || "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                    decimalsSold: allTokens.find(token => token.tokenSymbol === fromTokenSymbol)?.decimals.toString() || "9"
                })
                setToToken("USDC");
                setFromToken(fromTokenSymbol);
                setAmount(0.01);
            } catch (error) {
                console.error("[Swap/fetchDetails] Error fetching details:", error);
                toast.error("Failed to fetch token details.");
            }
        }
        fetchDetails();
    }, [publicKey, fromTokenSymbol, toTokenSymbol]);

    if (!publicKey) {
        console.log("[Swap] No public key - showing error and returning null");
        toast.error("Please connect your OKX wallet to swap tokens.");
        return null;
    }

    const handleMaxAmount = () => {
        console.log("[Swap/handleMaxAmount] Setting max amount to 100 (placeholder)");
        setAmount(amount);
    };

    const estimatedAmount = amount ? (amount * 0.99).toFixed(6) : "0";
    console.log("[Swap] Calculated estimatedAmount:", estimatedAmount);

    const handleSwapTokens = async () => {
        console.log("[Swap/handleSwapTokens] Starting swap process");

        try {
            if (!publicKey) {
                console.error("[Swap/handleSwapTokens] No public key available");
                toast.error("Please connect your OKX wallet to swap tokens.");
                return;
            }
            if (!fromToken || !toToken) {
                console.error("[Swap/handleSwapTokens] Missing tokens:", { fromToken, toToken });
                return;
            }
            if (!amount || isNaN(Number(amount))) {
                console.error("[Swap/handleSwapTokens] Invalid amount:", amount);
                return;
            }
            if (Number(amount) <= 0) {
                console.error("[Swap/handleSwapTokens] Amount too low:", amount);
                return;
            }
            if (!tokenPair) {
                console.error("[Swap/handleSwapTokens] Token pair not found");
                return;
            }

            console.log("[Swap/handleSwapTokens] Creating swap transaction with params:", {
                publicKey,
                amount,
                fromTokenAddress: tokenPair.fromTokenAddress,
                toTokenAddress: tokenPair.toTokenAddress,
                slippage: 0.01
            });

            const transaction = await CreateSwapTransaction(
                publicKey,
                amount * Math.pow(10, parseInt(tokenPair.decimalsSold)),
                tokenPair.fromTokenAddress,
                tokenPair.toTokenAddress,
                0.01
            );

            if (!transaction) {
                console.error("[Swap/handleSwapTokens] Failed to create transaction");
                toast.error("Failed to create swap transaction. Please try again.");
                return;
            }

            console.log("[Swap/handleSwapTokens] Transaction created:", transaction);
            setIsLoading(true);
            console.log("[Swap/handleSwapTokens] Set loading to true");

            if (transaction.transaction instanceof Transaction) {
                console.log("[Swap/handleSwapTokens] Handling legacy Transaction");
                const signedTransaction = await signAndSendTransaction(transaction.transaction);

                if (!signedTransaction) {
                    console.error("[Swap/handleSwapTokens] Failed to sign transaction");
                    toast.error("Failed to sign transaction. Please try again.");
                    setIsLoading(false);
                    return;
                }

                console.log("[Swap/handleSwapTokens] Transaction signed and sent:", signedTransaction);
                toast.success("Swap completed successfully!");
            } else {
                console.log("[Swap/handleSwapTokens] Handling VersionedTransaction");
                // TODO: Implement VersionedTransaction handling
                console.warn("VersionedTransaction handling not yet implemented");
                toast.warning("Versioned transactions not yet supported");
            }
        } catch (error) {
            console.error("[Swap/handleSwapTokens] Error during swap:", error);
            toast.error("An error occurred while processing the swap. Please try again.");
        } finally {
            setIsLoading(false);
            console.log("[Swap/handleSwapTokens] Set loading to false");
            setOpenConfirm(false);
            console.log("[Swap/handleSwapTokens] Closed confirmation dialog");
        }
    };

    console.log("[Swap] Rendering component with state:", {
        fromToken,
        toToken,
        tokenPair,
        isLoading,
        openConfirm,
        amount,
        estimatedAmount,
        isConnected,
        publicKey
    });

    return (
        <div className="w-full max-w-md mx-auto bg-card rounded-xl shadow-sm border p-6">
            <div className="space-y-4">
                {/* From Token Section */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-muted-foreground">From</label>
                        <span className="text-sm text-muted-foreground">
                            Balance: {/* Add balance display here if available */}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                        <Input
                            type="number"
                            placeholder="0.0"
                            value={amount || ""}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="border-0 bg-transparent text-lg font-medium flex-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleMaxAmount}
                                className="h-8"
                            >
                                Max
                            </Button>
                            <div className="w-[120px] px-3 py-2 bg-background rounded-md text-sm font-medium">
                                {fromToken || fromTokenSymbol}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            const temp = fromToken;
                            setFromToken(toToken);
                            setToToken(temp);
                        }}
                        className="rounded-full w-10 h-10"
                    >
                        <ArrowDown className="w-4 h-4" />
                    </Button>
                </div>

                {/* To Token Section */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">To</label>
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                        <Input
                            type="text"
                            placeholder="0.0"
                            value={estimatedAmount}
                            readOnly
                            className="border-0 bg-transparent text-lg font-medium flex-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <div className="w-[120px] px-3 py-2 bg-background rounded-md text-sm font-medium">
                            {toToken || toTokenSymbol}
                        </div>
                    </div>
                </div>

                {/* Swap Button */}
                <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
                    <DialogTrigger asChild>
                        <Button
                            size="lg"
                            className="w-full"
                            disabled={!amount || amount <= 0}
                        >
                            Swap
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Swap</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="bg-muted/50 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-medium">{amount} {fromToken || fromTokenSymbol}</span>
                                    <div className="flex items-center gap-2">
                                        <span>{fromToken || fromTokenSymbol}</span>
                                    </div>
                                </div>
                                <div className="flex justify-center my-2">
                                    <ArrowDown className="w-5 h-5" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-medium">{estimatedAmount} {toToken || toTokenSymbol}</span>
                                    <div className="flex items-center gap-2">
                                        <span>{toToken || toTokenSymbol}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Exchange Rate</span>
                                    <span>1 {fromToken || fromTokenSymbol} ≈ 0.99 {toToken || toTokenSymbol}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Minimum Received</span>
                                    <span>{(amount ? amount : 0 * 0.985).toFixed(6)} {toToken || toTokenSymbol}</span>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className="w-full"
                                onClick={handleSwapTokens}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing Swap...
                                    </>
                                ) : (
                                    "Confirm Swap"
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}