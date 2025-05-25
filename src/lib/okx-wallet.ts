import { OKXUniversalConnectUI, THEME } from "@okxconnect/ui";

const universalUi = await OKXUniversalConnectUI.init({
  dappMetaData: {
    icon: "https://your-domain.com/icon.png",
    name: "Your Solana DApp",
  },
  actionsConfiguration: {
    returnStrategy: "none",
    modals: "all",
    tmaReturnUrl: "back",
  },
  language: "en_US",
  uiPreferences: {
    theme: THEME.LIGHT,
  },
});

export { universalUi };
