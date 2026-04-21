import { useState, useEffect } from "react";
import { useWallet } from "./context/WalletContext";
import WalletConnect from "./components/WalletConnect";
import ServiceBoard from "./components/ServiceBoard";
import OfferForm from "./components/OfferForm";
import { registerUser, getBalance, offerService, requestService } from "./utils/contract";
import "./App.css";

function truncate(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "···" + addr.slice(-4);
}

export default function App() {
  const { publicKey, disconnect } = useWallet();
  const [view, setView] = useState("marketplace");
  const [txStatus, setTxStatus] = useState(null);
  const [txMessage, setTxMessage] = useState("");
  const [lastTxHash, setLastTxHash] = useState(null);
  const [refreshOffers, setRefreshOffers] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [balance, setBalance] = useState(null);
  const [deployedCount, setDeployedCount] = useState(0);
  const [claimedCount, setClaimedCount] = useState(0);
  const [activityLog, setActivityLog] = useState([
    { text: "Awaiting vault connection…", live: false },
  ]);

  const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || "";

  function pushLog(text, live = false) {
    setActivityLog(prev => [{ text, live }, ...prev].slice(0, 10));
  }

  async function refreshBalance() {
    if (!publicKey) return;
    try {
      const bal = await getBalance(publicKey);
      setBalance(bal);
    } catch (e) {
      console.error("Balance fetch failed", e);
    }
  }

  useEffect(() => {
    if (!publicKey) {
      setIsRegistered(false);
      setBalance(null);
      setActivityLog([{ text: "Awaiting vault connection…", live: false }]);
      return;
    }
    pushLog(`Vault linked · ${truncate(publicKey)}`, false);
    refreshBalance();
    if (balance !== null) setIsRegistered(true);
  }, [publicKey]);

  async function handleRegister() {
    setRegistering(true);
    pushLog("Provisioning vault on-chain…", true);
    try {
      await registerUser(publicKey);
      setIsRegistered(true);
      setRefreshOffers(n => n + 1);
      await refreshBalance();
      pushLog("Vault provisioned · 5 tokens minted", true);
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("Error(Contract, #1)") || msg.includes("already registered")) {
        setIsRegistered(true);
        refreshBalance();
        pushLog("Vault exists · tokens active", false);
      } else {
        pushLog("Provision failed · " + msg.slice(0, 40), false);
      }
    } finally {
      setRegistering(false);
    }
  }

  async function handleOffer(data) {
    setTxStatus("loading");
    setTxMessage("Deploying listing…");
    pushLog("Listing tx · awaiting sign…", true);
    try {
      await offerService(publicKey, data.description, data.hours);
      setTxStatus("success");
      setTxMessage("Listing deployed.");
      setDeployedCount(n => n + 1);
      setRefreshOffers(n => n + 1);
      await refreshBalance();
      pushLog(`Listing live · "${data.description}"`, true);
      setView("marketplace");
    } catch (err) {
      setTxStatus("error");
      setTxMessage(err.message || "Deploy failed");
      pushLog("Deploy failed · " + (err.message || "").slice(0, 40), false);
    } finally {
      setTimeout(() => setTxStatus(null), 5000);
    }
  }

  async function handleClaim(offer) {
    setTxStatus("loading");
    setTxMessage(`Claiming "${offer.description}"…`);
    pushLog(`Initiating claim on "${offer.description}"…`, true);
    try {
      const result = await requestService(publicKey, offer.id);
      const hash = result?.hash || result?.id || null;
      setLastTxHash(hash);
      setTxStatus("success");
      setTxMessage(`${offer.hours} token${offer.hours !== 1 ? "s" : ""} escrowed.`);
      setClaimedCount(n => n + 1);
      setRefreshOffers(n => n + 1);
      await refreshBalance();
      pushLog(
        `Escrowed ${offer.hours} token${offer.hours !== 1 ? "s" : ""} → ${truncate(offer.provider)} · settled`,
        true
      );
    } catch (err) {
      setTxStatus("error");
      setTxMessage(err.message || "Claim failed");
      pushLog("Claim failed · " + (err.message || "").slice(0, 40), false);
    } finally {
      setTimeout(() => setTxStatus(null), 5000);
    }
  }

  return (
    <div className="root">

      {/* ── Top Bar ── */}
      <div className="topbar">
        <div className="topbar-left">
          <span className="logo-mark">◈</span>
          <span className="logo-name">NEXWORK</span>
          <span className="logo-tag">PROTOCOL</span>
        </div>

        <nav className="topbar-nav">
          <button className={`nav-item ${view === "marketplace" ? "active" : ""}`} onClick={() => setView("marketplace")}>
            Exchange
          </button>
          <button className={`nav-item ${view === "deploy" ? "active" : ""}`} onClick={() => setView("deploy")}>
            Deploy
          </button>
          <button className={`nav-item ${view === "activity" ? "active" : ""}`} onClick={() => setView("activity")}>
            Activity
          </button>
        </nav>

        <div className="topbar-right">
          {publicKey ? (
            <>
              <div className="net-badge">
                <span className="net-dot" />
                TESTNET
              </div>
              <div className="vault-id">
                {truncate(publicKey)}
              </div>
              <button className="exit-btn" onClick={disconnect}>EXIT</button>
            </>
          ) : (
            <WalletConnect />
          )}
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="layout">

        {/* ── LEFT SIDEBAR: Vault ── */}
        <aside className="sidebar">
          <div className="vault-card">
            <div className="vault-header">
              <span className="vault-label">VAULT</span>
              {publicKey && <span className="vault-status-dot" />}
            </div>

            <div className="token-display">
              <div className="token-big">{balance ?? "—"}</div>
              <div className="token-unit">NXW</div>
            </div>

            <div className="vault-meta">
              <div className="meta-line">
                <span>CHAIN</span>
                <span className="meta-val green">Stellar Testnet</span>
              </div>
              <div className="meta-line">
                <span>ADDRESS</span>
                <span className="meta-val">{publicKey ? truncate(publicKey) : "—"}</span>
              </div>
              <div className="meta-line">
                <span>CLIENT</span>
                <span className="meta-val">{publicKey ? "Freighter" : "—"}</span>
              </div>
            </div>

            {!publicKey && (
              <div className="connect-prompt">
                <p>Connect your vault to begin trading on the NexWork protocol.</p>
                <WalletConnect />
              </div>
            )}

            {publicKey && !isRegistered && (
              <div className="provision-block">
                <p>Vault unprovisioned. Mint <strong>5 NXW tokens</strong> to start.</p>
                <button className="btn-provision" onClick={handleRegister} disabled={registering}>
                  {registering ? <><span className="spin" /> Provisioning…</> : "Provision Vault"}
                </button>
              </div>
            )}
          </div>

          {/* Counters */}
          <div className="counter-grid">
            <div className="counter-cell">
              <div className="counter-num">{deployedCount}</div>
              <div className="counter-label">Deployed</div>
            </div>
            <div className="counter-cell">
              <div className="counter-num">{claimedCount}</div>
              <div className="counter-label">Claimed</div>
            </div>
          </div>

          {/* Contract */}
          {CONTRACT_ID && (
            <div className="contract-card">
              <div className="contract-head">CONTRACT</div>
              <div className="contract-addr">{CONTRACT_ID}</div>
              <a
                className="contract-link"
                href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
                target="_blank"
                rel="noreferrer"
              >
                Inspect on explorer ↗
              </a>
            </div>
          )}
        </aside>

        {/* ── CENTER: Main Content ── */}
        <main className="main-content">

          {view === "marketplace" && (
            <div className="section">
              <div className="section-header">
                <h2 className="section-title">Exchange Articles</h2>
                <span className="section-sub">Browse & claim available listings</span>
              </div>
              <ServiceBoard onRequest={handleClaim} refreshKey={refreshOffers} />
            </div>
          )}

          {view === "deploy" && (
            <div className="section">
              <div className="section-header">
                <h2 className="section-title">Submit Article</h2>
                <span className="section-sub">Broadcast a new offering to the protocol</span>
              </div>
              <div className="deploy-wrap">
                <OfferForm onSubmit={handleOffer} />
              </div>
            </div>
          )}

          {view === "activity" && (
            <div className="section">
              <div className="section-header">
                <h2 className="section-title">Activity</h2>
                <span className="section-sub">On-chain event stream</span>
              </div>

              <div className="activity-stream">
                {activityLog.filter(l => l.live).length === 0 ? (
                  <div className="empty-stream">No live events yet</div>
                ) : (
                  activityLog.filter(l => l.live).map((item, i) => (
                    <div className="stream-row" key={i}>
                      <div className="stream-indicator" />
                      <div className="stream-text">{item.text}</div>
                      {lastTxHash && i === 0 && (
                        <a
                          className="stream-hash"
                          href={`https://stellar.expert/explorer/testnet/tx/${lastTxHash}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {lastTxHash.slice(0, 8)}… ↗
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Full log */}
              <div className="log-panel">
                <div className="log-panel-head">FULL LOG</div>
                {activityLog.map((item, i) => (
                  <div className="log-row" key={i}>
                    <span className={`log-pip ${item.live ? "live" : ""}`} />
                    <span className="log-msg">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toast */}
          {txStatus && (
            <div className={`toast toast--${txStatus}`}>
              {txStatus === "loading" && <span className="spin" />}
              {txStatus === "success" && <span className="toast-icon">✓</span>}
              {txStatus === "error" && <span className="toast-icon">✕</span>}
              <span>{txMessage}</span>
            </div>
          )}
        </main>

        {/* ── RIGHT RAIL: Last Settlement ── */}
        <aside className="rail">
          <div className="rail-section">
            <div className="rail-head">LAST SETTLEMENT</div>
            {lastTxHash ? (
              <div className="settlement-card">
                <div className="settlement-status">
                  <span className="s-dot" />
                  CONFIRMED
                </div>
                <div className="settlement-hash">{lastTxHash}</div>
                <a
                  className="settlement-link"
                  href={`https://stellar.expert/explorer/testnet/tx/${lastTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View ledger ↗
                </a>
              </div>
            ) : (
              <div className="no-settlement">No settlements yet</div>
            )}
          </div>

          <div className="rail-section">
            <div className="rail-head">PROTOCOL FEED</div>
            <div className="feed-list">
              {activityLog.map((item, i) => (
                <div className="feed-item" key={i}>
                  <div className={`feed-dot ${item.live ? "live" : ""}`} />
                  <span className="feed-text">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}