declare global {
    namespace NodeJS {
        interface ProcessEnv {
            OKX_API_URL: string;
            OKX_SECRET_KEY: string;
            OKX_API_KEY: string;
            OKX_PASSPHRASE: string;
            SOLANA_RPC_URL: string;
            OKX_PROJECT_ID: string;
        }
    }
}

export {}