"use server"
import getOKXSignatureAndTimestamp from "../sign_okx_request";
import "../../../envConfig";
import axios from "axios";
import { getBridgeTokensResponseType, BridgeTokenPairs } from "@/types/okx_types";
export async function getListOfTokens(): Promise<BridgeTokenPairs[]> {
    try {
        if (!process.env.OKX_API_URL || !process.env.OKX_API_KEY || !process.env.OKX_PASSPHRASE) {
            throw new Error("Environment Variable Setup Error: Set OKX_API_URL and OKX_API_KEY and OKX_PASSPHRASE in env variables");
        }
        const requestPath = "/api/v5/dex/aggregator/all-tokens";
        const { signature, timestamp } = getOKXSignatureAndTimestamp({
            timestamp: new Date(),
            http_method: "GET",
            requestPath,
            params: { chainIndex: 501 }
        });
        const response = await axios.get(`${process.env.OKX_API_URL}${requestPath}`, {
            params: {
                chainIndex: 501
            },
            headers: {
                'OK-ACCESS-KEY': process.env.OKX_API_KEY,
                'OK-ACCESS-SIGN': signature,
                'OK-ACCESS-TIMESTAMP': timestamp,
                'OK-ACCESS-PASSPHRASE': process.env.OKX_PASSPHRASE,
            }
        })
    const parsed = getBridgeTokensResponseType.safeParse(response.data);
    if (parsed.success) {
        const data = parsed.data;
        return data.data
    }
    else {
        console.error("Error parsing response data:", parsed.error);
        throw new Error("Unexpected response format from OKX API");
    }
}
    catch (error) {
    console.error("Error in getListOfTokens:", error);
    throw new Error("Could not get list of tokens");
}
}