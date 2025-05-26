import { Errors } from "@/errors/error_messages";
import { MyError } from "@/errors/type";
import base58 from "bs58";
import "../../../envConfig";
import getOKXSignatureAndTimestamp from "../sign_okx_request";
import axios from "axios";
import { swapDataResponse } from "@/types/okx_types";
import { Connection, VersionedTransaction, Transaction } from "@solana/web3.js";

export default async function (user_wallet: string, amount: number, fromTokenAddress: string, toTokenAddress: string, slippage: number): Promise<PreparedTransaction> {
    try {
        if (slippage > 1 || slippage < 0) {
            throw new MyError("Invalid slippage value");
        }
        const swapData = await getSwapDetails(user_wallet, amount, fromTokenAddress, toTokenAddress, slippage.toString());
        return prepareTransaction(swapData);
    } catch(err) {
        if (err instanceof MyError) {
            throw err;
        }

        console.error("Error creating swap transaction", err);
        throw new MyError(Errors.NOT_CREATE_SWAP);
    }
}

async function getSwapDetails(user_wallet: string, amount: number, fromTokenAddress: string, toTokenAddress: string, slippage: string): Promise<string> {
    try {
        if (!process.env.OKX_API_URL || !process.env.OKX_API_KEY || !process.env.OKX_PASSPHRASE || !process.env.OKX_PROJECT_ID) {
            throw new MyError("Environment Variable Setup Error: Set OKX_API_URL and OKX_API_KEY and OKX_PASSPHRASE and OKX_PROJECT_ID in env variables");
        }
        const requestPath = "/api/v5/dex/aggregator/swap";
        const params = {
            amount: amount,
            chainId: "501",
            fromTokenAddress: fromTokenAddress,
            toTokenAddress: toTokenAddress,
            userWalletAddress: user_wallet,
            slippage: slippage
        };
        const { signature, timestamp } = getOKXSignatureAndTimestamp({
            timestamp: new Date(),
            http_method: "GET",
            requestPath,
            params
        });
        const response = await axios.get(`${process.env.OKX_API_URL}${requestPath}`, {
            params,
            headers: {
                "OK-ACCESS-KEY": process.env.OKX_API_KEY,
                "OK-ACCESS-SIGN": signature,
                "OK-ACCESS-TIMESTAMP": timestamp,
                "OK-ACCESS-PASSPHRASE": process.env.OKX_PASSPHRASE,
                "OK-ACCESS-PROJECT": process.env.OKX_PROJECT_ID,
            }
        });

        if (response.data.code !== "0" || !response.data.data?.[0]) {
            console.error(response.data);
            throw new MyError(response.data.msg);
        }

        const parsed = swapDataResponse.safeParse(response.data.data);
        if (parsed.success) {
            const data = parsed.data;
            return data[0].tx.data;
        } else {
            const errors = parsed.error;
            console.error("Errors =>", errors);
            throw new MyError(Errors.UNEXPECTED_RESPONSE);
        }
    } catch (err) {
        if (err instanceof MyError) {
            throw err;
        }

        console.error("Error creating swap transaction", err);
        throw new MyError(Errors.NOT_GET_SWAP_DATA);
    }
}

interface PreparedTransaction {
    transaction: Transaction | VersionedTransaction, 
    recentBlockHash: {
        blockhash: string,
        lastValidBlockHeight: number
    }
}

async function prepareTransaction(callData: string): Promise<PreparedTransaction> {
    try {
        if(!process.env.SOLANA_RPC_URL) {
            throw new MyError("Environment Variable Setup Error: Set SOLANA_RPC_URL in env variables")
        }

        // Initialize Solana connection
        const connection = new Connection(`${process.env.SOLANA_RPC_URL}`, {
            confirmTransactionInitialTimeout: 5000
        });

        // Decode the base58 encoded transaction data
        const decodedTransaction = base58.decode(callData);

        // Get the latest blockhash
        const recentBlockHash = await connection.getLatestBlockhash();
        console.log("Got blockhash:", recentBlockHash.blockhash);

        let tx;

        // Try to deserialize as a versioned transaction first
        try {
            tx = VersionedTransaction.deserialize(decodedTransaction);
            console.log("Successfully created versioned transaction");
            tx.message.recentBlockhash = recentBlockHash.blockhash;
        } catch (e) {
            // Fall back to legacy transaction if versioned fails
            console.log("Versioned transaction failed, trying legacy:", e);
            tx = Transaction.from(decodedTransaction);
            console.log("Successfully created legacy transaction");
            tx.recentBlockhash = recentBlockHash.blockhash;
        }

        return {
            transaction: tx,
            recentBlockHash
        };
    } catch (error) {
        if (error instanceof MyError) {
            throw error;
        }
        console.error("Error preparing transaction:", error);
        throw new MyError(Errors.NOT_PREPARE_SWAP_TRANSACTION);
    }
}