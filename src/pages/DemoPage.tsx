import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

// SDK từ CDN (global script)
import {
  initSDK,
  createInstance,
  SepoliaConfig,
} from "https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js";

import FHECounterArtifact from "../contracts/FHECounter.json";
import { CONTRACT_ADDRESS } from "../config";

const ABI = FHECounterArtifact.abi;

// Helper rút gọn hash
function shortenHash(hash: string, start = 8, end = 8) {
  if (!hash) return "";
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

export default function DemoPage() {
  const { isConnected } = useAccount();
  const [instance, setInstance] = useState<any>(null);
  const [countHandle, setCountHandle] = useState<any>(null);
  const [clearCount, setClearCount] = useState<any>(null);
  const [msg, setMsg] = useState("⏳ Initializing SDK, please wait...");
  const [loading, setLoading] = useState("");

  // Init SDK
  useEffect(() => {
    (async () => {
      if (!isConnected || !window.ethereum) return;
      try {
        setMsg("⏳ Initializing SDK, please wait...");
        await initSDK();
        const inst = await createInstance({
          ...SepoliaConfig,
          network: window.ethereum,
        });
        setInstance(inst);
        setMsg("✅ SDK ready!");
      } catch (err) {
        console.error("SDK init failed", err);
        setMsg("❌ SDK init failed");
      }
    })();
  }, [isConnected]);

  async function getContract(signerOrProvider: any) {
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signerOrProvider);
  }

  // Fetch count handle
  const handleRefreshCount = async () => {
    if (!instance) return;
    try {
      setLoading("refresh");
      setMsg("⏳ Refreshing...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = await getContract(provider);
      const encryptedHandle = await contract.getCount();
      setCountHandle(encryptedHandle);
      setClearCount(null);
      setMsg("✅ Got count handle, decrypt to see value");
    } catch (e) {
      console.error(e);
      setMsg("❌ Refresh failed");
    } finally {
      setLoading("");
    }
  };

  // Auto fetch count handle khi instance sẵn sàng
  useEffect(() => {
    if (instance) {
      handleRefreshCount();
    }
  }, [instance]);

  const handleDecrypt = async () => {
    if (!instance) {
      setMsg("❌ SDK instance not ready yet.");
      return;
    }
    try {
      setLoading("decrypt");
      setMsg("⏳ Fetching handle & decrypting...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = await getContract(provider);
      const encryptedHandle = await contract.getCount();
      setCountHandle(encryptedHandle);

      const signer = await provider.getSigner();

      const keypair = instance.generateKeypair();

      const handleContractPairs = [
        { handle: encryptedHandle, contractAddress: CONTRACT_ADDRESS },
      ];
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "10";
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays
      );

      const signature = await signer.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification:
            eip712.types.UserDecryptRequestVerification,
        },
        eip712.message
      );

      setMsg("🔑 Decryption signature obtained, calling userDecrypt...");

      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace("0x", ""),
        contractAddresses,
        signer.address,
        startTimeStamp,
        durationDays
      );

      const decryptedValue = result[encryptedHandle];
      setClearCount(decryptedValue.toString());
      setMsg(`✅ Decrypted successfully: ${decryptedValue.toString()}`);
    } catch (e: any) {
      console.error(e);
      if (e.code === "ACTION_REJECTED") {
        setMsg("❌ User rejected decryption signature");
      } else {
        setMsg("❌ Decrypt failed: " + (e.message || e));
      }
    } finally {
      setLoading("");
    }
  };

  const handleTx = async (action: "increment" | "decrement") => {
    if (!instance) {
      setMsg("❌ SDK instance not ready yet.");
      return;
    }
    try {
      setLoading(action);
      setMsg(`⏳ ${action === "increment" ? "Incrementing" : "Decrementing"}...`);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = await getContract(signer);

      const inputEnc = instance.createEncryptedInput(
        CONTRACT_ADDRESS,
        signer.address
      );
      inputEnc.add32(1);
      const ciphertexts = await inputEnc.encrypt();

      setMsg("✍️ Please sign in MetaMask...");

      const tx =
        action === "increment"
          ? await contract.increment(
              ciphertexts.handles[0],
              ciphertexts.inputProof
            )
          : await contract.decrement(
              ciphertexts.handles[0],
              ciphertexts.inputProof
            );

      setMsg(`⏳ Waiting for confirmation.. Hash: ${tx.hash}`);
      await tx.wait();

      await handleRefreshCount();

      setMsg(
        `✅ Updated countHandle: ${countHandle} <br/>` +
          `✅ Transaction success: <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">https://sepolia.etherscan.io/tx/${shortenHash(
            tx.hash
          )}</a>`
      );
    } catch (e: any) {
      console.error(e);
      if (e.code === "ACTION_REJECTED") {
        setMsg("❌ User rejected transaction");
      } else {
        setMsg(
          `❌ ${action === "increment" ? "Increment" : "Decrement"} failed`
        );
      }
    } finally {
      setLoading("");
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <h1 className="text-2xl font-semibold">
          👉 Please connect wallet to continue...
        </h1>
      </div>
    );
  }

  return (
    <div className="py-10 px-6 text-black max-w-2xl mx-auto bg-[#ffd200]">
      <h1 className="text-2xl font-bold mb-6">🔒 Hello FHEVM Counter</h1>

      {/* Count Handle */}
      <div className="bg-white text-black rounded-lg p-4 mb-6 border-2 border-black shadow-md">
        <p className="font-semibold">Count Handle</p>
        <p className="text-xs break-all">
          countHandle: {countHandle || "null"}
        </p>
        <p className="text-xs">
          clear countHandle: {clearCount ?? "Not decrypted"}
        </p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => handleTx("increment")}
          disabled={loading === "increment" || !instance}
          className={`px-4 py-2 rounded bg-black text-white hover:bg-gray-800 transition-colors duration-200 ${
            loading === "increment" || !instance
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {loading === "increment" ? "Encrypting data.." : "Increment Counter"}
        </button>

        <button
          onClick={() => handleTx("decrement")}
          disabled={loading === "decrement" || !instance}
          className={`px-4 py-2 rounded bg-black text-white hover:bg-gray-800 transition-colors duration-200 ${
            loading === "decrement" || !instance
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {loading === "decrement" ? "Encrypting data.." : "Decrement Counter"}
        </button>
      </div>

      {/* Decrypt button */}
      <div className="mb-6">
        <button
          onClick={handleDecrypt}
          disabled={loading === "decrypt" || !instance}
          className={`w-full px-4 py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-colors duration-200 ${
            loading === "decrypt" || !instance
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {loading === "decrypt" ? "Encrypting data.." : "🔑 Decrypt"}
        </button>
      </div>

      {/* Logs */}
      <div className="bg-white text-black rounded-lg p-6 border-2 border-black shadow-md">
        <p className="font-semibold mb-2">Logs: </p>
        {msg ? (
          <div
            className="text-sm text-gray-800 whitespace-pre-wrap break-all"
            dangerouslySetInnerHTML={{ __html: msg }}
          />
        ) : (
          <p className="text-sm text-gray-500">...</p>
        )}
      </div>
    </div>
  );
}
