import z from "zod";

export const tokenAssetsType = z.object({
    chainIndex: z.string(),
    tokenContractAddress: z.string(),
    symbol: z.string(),
    balance: z.string().transform((arg) => Number.parseFloat(arg)),
    tokenPrice: z.string().transform((arg) => Number.parseFloat(arg)),
    isRiskToken: z.boolean(),
    rawBalance: z.string(),
    address: z.string()
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
export const bridgeTokenType = z.object({
    decimals: z.string(),
    tokenContractAddress: z.string(),
    tokenLogoUrl: z.string(),
    tokenName: z.string(),
    tokenSymbol: z.string(),
})
export const getBridgeTokensResponseType = z.object({
    code: z.string(),
    msg: z.string(),
    data: z.array(bridgeTokenType)
});
export const swapDataResponse = z.array(swapDataType);
export type BridgeTokenPairs = z.infer<typeof bridgeTokenType>;
export type TokenAssets = z.infer<typeof tokenAssetsType>;