import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import "./index.css"; 
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import { WALLETCONNECT_PROJECT_ID } from "./config";

const config = getDefaultConfig({
  appName: "FHE Counter DApp",
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [sepolia],
  ssr: false,
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/*" element={<App />} />
            </Routes>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
