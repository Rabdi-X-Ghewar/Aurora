import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { PrivyProvider } from "@privy-io/react-auth";

import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import ErrorBoundary from "./ErrorBoundary.tsx";
import { Toaster } from "sonner";
import { OCConnect } from "@opencampus/ocid-connect-js";
import { BrowserRouter } from "react-router";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

const solanaConnectors = toSolanaWalletConnectors({
  // By default, shouldAutoConnect is enabled
  shouldAutoConnect: true,
});

const opts = {
  redirectUri: "http://localhost:5173/redirect",
  referralCode: "PARTNER6",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <PrivyProvider
        appId="cm7loig14030by9g896wob3gm"
        config={{
          externalWallets: {
            solana: {
              connectors: solanaConnectors,
            },
          },
          loginMethods: ["email"],
          appearance: {
            theme: "light",
            accentColor: "#676FFF",
            walletList: [
              "metamask",
              "coinbase_wallet",
              "rainbow",
              "wallet_connect",
              "phantom",
              "safe",
              "detected_wallets",
            ],
          },
        }}
      >
        <OCConnect opts={opts} sandboxMode={true}>
          <BrowserRouter>
            <AptosWalletAdapterProvider>
              <App />
            </AptosWalletAdapterProvider>

          </BrowserRouter>
        </OCConnect>

        <Toaster />
      </PrivyProvider>
    </ErrorBoundary>
  </StrictMode>
);
