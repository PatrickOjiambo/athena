"use server"

import { MyError } from "@/errors/type";
import { TransactionHistory, transactionHistoryResponseType } from "@/types/okx_types";
import getOKXSignatureAndTimestamp from "../sign_okx_request";
import axios from "axios";
import { Errors } from "@/errors/error_messages";

export default async function getTransactionHistory(user_address: string): Promise<TransactionHistory[]> {
    try {
        if (!process.env.OKX_API_URL || !process.env.OKX_API_KEY || !process.env.OKX_PASSPHRASE) {
            throw new MyError("Environment Variable Setup Error: Set OKX_API_URL and OKX_API_KEY and OKX_PASSPHRASE in env variables");
        }

        const requestPath = "/api/v5/dex/post-transaction/transactions-by-address";
        const params = {
            address: user_address,
            chains: 501
        }

        const { signature, timestamp } = getOKXSignatureAndTimestamp({
            timestamp: new Date(),
            http_method: "GET",
            requestPath,
            params
        });

        const apiResults = await axios.get(`${process.env.OKX_API_URL}${requestPath}`, {
            params,
            headers: {
                'OK-ACCESS-KEY': process.env.OKX_API_KEY,
                'OK-ACCESS-SIGN': signature,
                'OK-ACCESS-TIMESTAMP': timestamp,
                'OK-ACCESS-PASSPHRASE': process.env.OKX_PASSPHRASE,
            }
        });

        const parsed = transactionHistoryResponseType.safeParse(apiResults.data);
        if (parsed.success) {
            const data = parsed.data;
            const transactions: TransactionHistory[] = [];
            for (const resp of data.data) {
                if (resp.transactions) {
                    transactions.push(...resp.transactions);
                }
            }

            return transactions;
        } else {
            console.log("Received data", apiResults.data);
            console.error("Error parsing", parsed.error);
            throw new MyError(Errors.UNEXPECTED_RESPONSE);
        }
    } catch (err) {
        if (err instanceof MyError) {
            throw err;
        }

        console.error("Error getting transaction history", err);
        throw new MyError("Could not get transaction history");
    }
}