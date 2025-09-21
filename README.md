# 🔒 FHECounter React Template

A simple frontend dApp template for interacting with the **FHECounter** contract on FHEVM (Sepolia testnet).  
This project is built with **React + Vite + RainbowKit + Wagmi + TailwindCSS**.

![Frontend Screenshot](public/frontend.png)

---

## 🚀 Features

- Connect wallet with **RainbowKit**.
- Interact with `FHECounter` contract:
  - Increment / Decrement counter (encrypted).
  - Decrypt counter value with user’s keypair.
- Styled with **TailwindCSS**.
- Ready-to-use setup with Vite.

---

## 📦 Requirements

- **Node.js** ≥ 18.x (LTS recommended).
- **npm** ≥ 9.x or **pnpm** / **yarn**.
- A Web3 wallet (e.g. MetaMask) connected to **Sepolia**.

---

## ⚙️ Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/solotop999/FHECounter-React-Template.git
cd FHECounter-react-template
npm install
```

- Rename `env_example` to `.env`
- Fill `VITE_CONTRACT_ADDRESS` and `VITE_WALLETCONNECT_PROJECT_ID` in `.env`
- `VITE_CONTRACT_ADDRESS`: Your FHECounter contract address
- `VITE_WALLETCONNECT_PROJECT_ID`: [ Register Free ](https://dashboard.reown.com/)

## ▶️ Run the project

Start development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Build for production:
```bash
npm run preview
```
Now, open <http://localhost:5173/> in your browser. 🚀

---

# 🎉 **Happy coding!**
