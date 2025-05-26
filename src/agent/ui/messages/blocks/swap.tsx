import { useState } from "react";
import { Loader2, ArrowDown, ChevronDown, Info } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { BASEHOST } from "@/integrations/basehost";

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

interface Token {
    symbol: string;
    address: string;
    balance: string;
    logo?: string;
}

interface SwapProps {
    tokens: Token[];
    defaultFromToken?: Token;
    defaultToToken?: Token;
}

export function Swap({ tokens, defaultFromToken, defaultToToken }: SwapProps) {
    const [fromToken, setFromToken] = useState<Token>(defaultFromToken || tokens[0]);
    const [toToken, setToToken] = useState<Token>(defaultToToken || tokens[1]);
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [slippage, setSlippage] = useState(0.5);

    const handleSwapTokens = () => {
        const temp = fromToken;
        setFromToken(toToken);
        setToToken(temp);
    };

    const handleMaxAmount = () => {
        setAmount(fromToken.balance);
    };

    const handleSwap = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${BASEHOST}/swap`, {
                fromTokenAddress: fromToken.address,
                toTokenAddress: toToken.address,
                amount: amount,
            });
            toast.success("Swap executed successfully!");
            setOpenConfirm(false);
        } catch (error) {
            toast.error("Swap failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const estimatedAmount = amount ? (parseFloat(amount) * 0.99).toFixed(6) : "0"; // Mock calculation

    return (
        <div className="w-full max-w-md mx-auto bg-card rounded-xl shadow-sm border p-6">
            <div className="space-y-4">
                {/* From Token Section */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-muted-foreground">From</label>
                        <span className="text-sm text-muted-foreground">
                            Balance: {fromToken.balance}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                        <Input
                            type="number"
                            placeholder="0.0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
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
                            <Select
                                value={fromToken.symbol}
                                onValueChange={(value) =>
                                    setFromToken(tokens.find((t) => t.symbol === value) || fromToken)
                                }
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Select token" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tokens.map((token) => (
                                        <SelectItem key={token.symbol} value={token.symbol}>
                                            <div className="flex items-center gap-2">
                                                {token.logo && (
                                                    <img
                                                        src={token.logo}
                                                        alt={token.symbol}
                                                        className="w-5 h-5 rounded-full"
                                                    />
                                                )}
                                                {token.symbol}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSwapTokens}
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
                        <Select
                            value={toToken.symbol}
                            onValueChange={(value) =>
                                setToToken(tokens.find((t) => t.symbol === value) || toToken)
                            }
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Select token" />
                            </SelectTrigger>
                            <SelectContent>
                                {tokens.map((token) => (
                                    <SelectItem key={token.symbol} value={token.symbol}>
                                        <div className="flex items-center gap-2">
                                            {token.logo && (
                                                <img
                                                    src={token.logo}
                                                    alt={token.symbol}
                                                    className="w-5 h-5 rounded-full"
                                                />
                                            )}
                                            {token.symbol}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Swap Details */}
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                        <span>Exchange Rate</span>
                        <span>1 {fromToken.symbol} = 0.99 {toToken.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Price Impact</span>
                        <span className="text-green-500">0.1%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Minimum Received</span>
                        <span>{(parseFloat(amount) * 0.985).toFixed(6)} {toToken.symbol}</span>
                    </div>
                </div>

                {/* Swap Button */}
                <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
                    <DialogTrigger asChild>
                        <Button
                            size="lg"
                            className="w-full"
                            disabled={!amount || parseFloat(amount) <= 0}
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
                                    <span className="text-lg font-medium">{amount} {fromToken.symbol}</span>
                                    <div className="flex items-center gap-2">
                                        {fromToken.logo && (
                                            <img
                                                src={fromToken.logo}
                                                alt={fromToken.symbol}
                                                className="w-6 h-6 rounded-full"
                                            />
                                        )}
                                        <span>{fromToken.symbol}</span>
                                    </div>
                                </div>
                                <div className="flex justify-center my-2">
                                    <ArrowDown className="w-5 h-5" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-medium">{estimatedAmount} {toToken.symbol}</span>
                                    <div className="flex items-center gap-2">
                                        {toToken.logo && (
                                            <img
                                                src={toToken.logo}
                                                alt={toToken.symbol}
                                                className="w-6 h-6 rounded-full"
                                            />
                                        )}
                                        <span>{toToken.symbol}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Exchange Rate</span>
                                    <span>1 {fromToken.symbol} = 0.99 {toToken.symbol}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Price Impact</span>
                                    <span className="text-green-500">0.1%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Minimum Received</span>
                                    <span>{(parseFloat(amount) * 0.985).toFixed(6)} {toToken.symbol}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Slippage Tolerance</span>
                                    <span className="text-sm font-medium">{slippage}%</span>
                                </div>
                                <Slider
                                    value={[slippage]}
                                    max={5}
                                    step={0.1}
                                    onValueChange={(value) => setSlippage(value[0])}
                                />
                            </div>

                            <Button
                                size="lg"
                                className="w-full"
                                onClick={handleSwap}
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