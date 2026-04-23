# Nexwork Article Exchange 
⬡ NexWork Protocol

A decentralized peer-to-peer exchange protocol built on Stellar. Deploy listings, claim services, and settle transactions using NXW tokens — all on-chain, no intermediaries.

Built with React · Stellar Soroban · Freighter Wallet

---

## Live Deployed Project

**https://nexwork-articles-exchange.netlify.app/**



---

## Demo Video

**https://youtu.be/C4TEanviwlE**



---



---

## 🖼️ Screenshots

### Test output — 11 tests passing
<img width="1178" height="228" alt="9" src="https://github.com/user-attachments/assets/ba01d390-0b74-4b6b-9c55-5896d8ffa5fc" />


### Contract Deployment
<img width="1333" height="278" alt="1" src="https://github.com/user-attachments/assets/ce478285-6d59-499b-8d1b-d7a679ef4faf" />



### Working of Nexwork D-App
<img width="1918" height="868" alt="2" src="https://github.com/user-attachments/assets/8c46d0d9-fd20-4e64-9a94-512b210d81e3" />
<img width="1918" height="871" alt="3" src="https://github.com/user-attachments/assets/536e361f-227a-4037-b45d-f50047017713" />
<img width="1918" height="872" alt="4" src="https://github.com/user-attachments/assets/9ab47df5-2861-4091-ad3e-dad889289a65" />
<img width="1918" height="873" alt="5" src="https://github.com/user-attachments/assets/877f8703-276c-48f1-a1a2-df374a6203bf" />
<img width="1917" height="867" alt="6" src="https://github.com/user-attachments/assets/be24b385-7475-45c5-9302-cf3dde1897a7" />



### Contract Invoke
<img width="1917" height="882" alt="7" src="https://github.com/user-attachments/assets/37ebfa74-84b9-405a-afbd-5f1b69f77eb8" />







---

## 🏗️ Architecture

```
orange-belt/
└── nex-work/
    ├── public/                        # Static assets
    ├── src/
    │   ├── assets/                    # Images, icons
    │   ├── components/
    │   │   ├── BalanceBadge.jsx       # Displays user TIME token balance
    │   │   ├── OfferForm.jsx          # Form to list a new service
    │   │   ├── ServiceBoard.jsx       # Active service listings grid
    │   │   └── WalletConnect.jsx      # Freighter wallet connect UI
    │   ├── context/
    │   │   └── WalletContext.jsx      # Global wallet state via React Context
    │   ├── hooks/
    │   │   └── useWallet.js           # Freighter wallet hook
    │   ├── tests/
    │   │   ├── balance.test.js        # 3 token balance tests
    │   │   ├── cache.test.js          # 5 cache utility tests
    │   │   ├── setup.js               # Vitest setup (jsdom + localStorage reset)
    │   │   └── wallet.test.js         # 3 wallet connection tests
    │   ├── utils/
    │   │   ├── cache.js               # localStorage cache with TTL + SWR helper
    │   │   └── contract.js            # Stellar SDK contract client
    │   ├── App.css
    │   ├── App.jsx                    # Root component & routing
    │   ├── index.css
    │   └── main.jsx                   # React entry point
    ├── screenshots/                   # Test output & UI screenshots for README
    ├── contract/            # Soroban smart contract (Rust)
    ├── .env                           # VITE_CONTRACT_ID (not committed)
    ├── .gitignore
    ├── contract-redeploy-steps.txt    # Steps to redeploy contract to Testnet
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    └── vite.config.js
```

### Tech stack

| Layer | Technology |
|---|---|
| Smart contract | Rust · Soroban SDK 21 |
| Blockchain | Stellar Testnet |
| Frontend | React 18 · Vite · Tailwind CSS |
| Wallet | Freighter (browser extension) |
| Testing | Vitest |
| Deployment | Vercel |

---

## ⚙️ Local Setup

### Prerequisites

- [Rust](https://rustup.rs/) with `wasm32-unknown-unknown` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli) (`cargo install stellar-cli`)
- [Node.js](https://nodejs.org/) v18+
- [Freighter wallet](https://freighter.app/) browser extension

---

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/nexwork.git
cd nexwork
```

---

### 2. Build & deploy the contract

```bash
cd contract

# Add the WASM compilation target (first time only)
rustup target add wasm32-unknown-unknown

# Build
stellar contract build

# Deploy to Testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/time_bank.wasm \
  --source YOUR_STELLAR_ACCOUNT \
  --network testnet

# Copy the printed contract ID — you'll need it in step 4
```

---

### 3. Run contract tests

```bash
cd contract
cargo test
```

Expected output:

```
running 6 tests
test tests::test_join_gives_initial_balance      ... ok
test tests::test_cannot_join_twice               ... ok
test tests::test_list_service_increments_id      ... ok
test tests::test_book_and_confirm_transfers_tokens ... ok
test tests::test_cannot_book_without_enough_tokens ... ok
test tests::test_cannot_book_own_service         ... ok

test result: ok. 6 passed; 0 failed
```

---

### 4. Configure the frontend

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_CONTRACT_ID=CB3PCU4L2WPAUXIDR5EBBMMXOMJDYHAGJDYOVXTVC2VY43ANHEURAENU
```

---

### 5. Install dependencies & run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

### 6. Run frontend tests

```bash
npm test
```

Expected output:

```
 RUN  v4.1.4 D:/Sanket/Stellar/orange-belt/community-timebank

 ✓ src/tests/wallet.test.js  (3 tests) 4ms
 ✓ src/tests/balance.test.js (3 tests) 4ms
 ✓ src/tests/cache.test.js   (5 tests) 108ms

 Test Files  3 passed (3)
      Tests  11 passed (11)
   Start at  05:47:57
   Duration  2.33s (transform 119ms, setup 537ms, import 98ms, tests 116ms, environment 5.43s)
```

---

## 🧪 Test Coverage

### Contract tests (`cargo test`) — 6 tests

| Test | What it verifies |
|---|---|
| `test_join_gives_initial_balance` | New member receives exactly 5 TIME tokens |
| `test_cannot_join_twice` | Duplicate join panics with correct message |
| `test_list_service_increments_id` | Service IDs auto-increment correctly |
| `test_book_and_confirm_transfers_tokens` | Full escrow flow produces correct balances |
| `test_cannot_book_without_enough_tokens` | Underfunded booking is rejected |
| `test_cannot_book_own_service` | Self-booking is rejected |

### Frontend tests (`npm test`) — 11 tests across 3 files

**`wallet.test.js`** — 3 tests covering:
- Wallet connects successfully via Freighter
- Disconnected state resets address to null
- Error state set when Freighter is not installed

**`balance.test.js`** — 3 tests covering:
- Balance returns correct value from cache on hit
- Balance fetches fresh value on cache miss
- Balance returns 0 for a non-member address

**`cache.test.js`** — 5 tests covering:
- Store and retrieve a value within TTL
- Expired entries return `null`
- Missing keys return `null`
- `invalidate` removes a specific key
- `clear` removes all `tb_` prefixed keys only

---

## 🔑 Key Implementation Details

### Loading states
Every on-chain write (join, list, book, confirm) shows a spinner and disables the button while the transaction confirms. The `Spinner` component is reused across all interactive elements.

### Caching
Contract reads use a two-layer cache:

```
getActiveServices()  →  cache.get('active_services')
                         └─ HIT:  return immediately, revalidate in background (SWR)
                         └─ MISS: fetch from RPC, populate cache, call onUpdate()
```

TTLs: balances = 20 s · service listings = 30 s. Cache is invalidated on every write that would change the data (booking, listing, confirming).

### Escrow flow
Tokens leave the requester's balance at booking time and only reach the provider after `confirm_completion` is called. The contract never holds tokens itself — the balance map is the source of truth.

---

## 🌐 Deployment

The frontend is deployed to Vercel automatically on push to `main`.

```bash
# Manual deploy
npm run build
vercel --prod
```

Set `VITE_CONTRACT_ID` as an environment variable in your Vercel project settings.

---

## 📝 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `VITE_CONTRACT_ID` | Deployed Soroban contract address | Yes |

Copy `.env.example` to `.env` for local development.

---



---

## 🛣️ Future Improvements

- [ ] Dispute resolution — third-party arbitration for contested bookings
- [ ] Service categories and search/filter
- [ ] Reputation scores based on completed bookings
- [ ] Mobile-responsive PWA with push notifications
- [ ] Multi-session bookings (recurring services)

---

## 📄 License

MIT © 2025 — built for the Stellar Journey to Mastery Orange Belt challenge.
