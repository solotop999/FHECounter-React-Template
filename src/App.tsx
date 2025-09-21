import { Routes, Route } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import DemoPage from "./pages/DemoPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="p-4 bg-black text-white flex justify-between items-center">
        <h1 className="text-xl font-bold">🔐 FHE Counter</h1>
        <ConnectButton />
      </header>

      <main className="p-6">
        <Routes>
          <Route path="/" element={<DemoPage />} />
        </Routes>
      </main>
    </div>
  );
}
