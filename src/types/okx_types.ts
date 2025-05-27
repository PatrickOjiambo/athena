import z from "zod";

export const tokenAssetsType = z.object({
    chainIndex: z.string(),
    tokenContractAddress: z.string(),
    symbol: z.string(),
    balance: z.string().transform((arg) => Number.parseFloat(arg)),
    tokenPrice: z.string().transform((arg) => Number.parseFloat(arg)),
    isRiskToken: z.boolean(),
    rawBalance: z.string(),
    address: z.string(),
    image: z.string(),
    chainName: z.string()
});

export const getUserPortfolioResponseType = z.object({
    code: z.string(),
    msg: z.string(),
    data: z.array(z.object({
        tokenAssets: z.array(tokenAssetsType).optional()
    }))
});

export const swapDataType = z.object({
    tx: z.object({
        data: z.string()
    })
});

export const swapDataResponse = z.array(swapDataType);

export type TokenAssets = z.infer<typeof tokenAssetsType>;