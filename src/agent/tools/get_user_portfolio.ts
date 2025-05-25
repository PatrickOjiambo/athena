"use server"
import axios from "axios";
import "../../../envConfig";
import getOKXSignatureAndTimestamp from "../sign_okx_request";
import { getUserPortfolioResponseType, TokenAssets } from "@/types/okx_types";
import { Errors } from "@/errors/error_messages";
import { MyError } from "@/errors/type";

export default async function getUserPortfolio(user_address: string): Promise<TokenAssets[]> {
    try {
        if (!process.env.OKX_API_URL || !process.env.OKX_API_KEY || !process.env.OKX_PASSPHRASE) {
            throw new MyError("Environment Variable Setup Error: Set OKX_API_URL and OKX_API_KEY and OKX_PASSPHRASE in env variables");
        }

        const requestPath = "/api/v5/dex/balance/all-token-balances-by-address";
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

        const parsed = getUserPortfolioResponseType.safeParse(apiResults.data);
        if (parsed.success) {
            const data = parsed.data;
            return data.data[0]?.tokenAssets ?? [];
        } else {
            console.log("Received data", apiResults.data);
            console.error("Error parsing", parsed.error);
            throw new MyError(Errors.UNEXPECTED_RESPONSE);
        }
    } catch (err) {
        if (err instanceof MyError) {
            throw err;
        }

        console.error(err);
        throw new Error("Could not get user's porfolio");
    }
}