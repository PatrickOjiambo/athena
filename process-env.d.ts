declare global {
    namespace NodJS {
        interface ProcessEnv {
            ENVIRONMENT: string,
            NEWSDATAAPIKEY: string,
        }
    }
}