/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { toast, Toaster } from "sonner";
import axios from "axios"
import { BASEHOST } from "@/integrations/basehost";
interface Props {
    toTokenSymbol: string;
    fromTokenSymbol: string;
    toTokenAddress: string;
    fromTokenAddress: string;
    amount: string;
}

export function Swap(props: Props) {

    return (
        <div className="w-full mt-2">
            <Toaster />
            <button
                // disabled={isLoading || !isConnected}
                className="w-[88%] mx-auto px-4 py-2 rounded-md bg-[var(--primary)] hover:bg-purple-500 text-[var(--primary-foreground)] font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {/* {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                    </>
                ) : (
                    <span>Copy {agentName}</span>
                )} */}
            </button>
        </div>
    );
}
