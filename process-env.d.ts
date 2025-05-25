declare global {
    namespace NodeJS {
        interface ProcessEnv {
            OKX_API_URL: string;
            OKX_SECRET_KEY: string;
            OKX_API_KEY: string;
            OKX_PASSPHRASE: string;
            ENVIRONMENT: string;
            NEWSDATAAPIKEY: string;
            NEXT_PUBLIC_OPENAI_API_KEY: string;
        }
    }
}

export { }
