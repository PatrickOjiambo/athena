import {stringify} from "querystring";
import { createHmac } from "crypto";
import { MyError } from "@/errors/type";
import "../../envConfig";

interface GetOKXPassphrase {
    timestamp: Date, 
    http_method: "GET", 
    requestPath: string,
    params: Record<string, any>,
}  

export default function getOKXSignatureAndTimestamp(args: GetOKXPassphrase): {signature: string, timestamp: string} {
    if (!process.env.OKX_SECRET_KEY) {
        throw new MyError("Environment Variable Setup Error: Set OKX_SECRET_KEY in env variables");
    }

    const queryString = "?" + stringify(args.params);
    const timeStampString = args.timestamp.toISOString().slice(0, -5) + 'Z';
    const concatenated = timeStampString + args.http_method + args.requestPath + queryString;
    const hmac = createHmac('sha256', process.env.OKX_SECRET_KEY);
    hmac.update(concatenated);
    const signature = hmac.digest('base64');

    return {signature, timestamp: timeStampString};
}