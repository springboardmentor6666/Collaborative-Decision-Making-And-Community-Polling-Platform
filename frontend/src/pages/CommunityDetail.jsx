import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";

const API = "http://localhost:8080";

// ==========================================
// WINNER / RESULT CALCULATION
// Finds the option(s) with max(voteCount).
// Handles ties: multiple options sharing the
// top vote count are all marked as winners.
// ==========================================
function getWinnerInfo(options) {
  const list = options || [];
  const totalVotes = list.reduce((sum, o) => sum + (o.voteCount || 0), 0);

  if (list.length === 0 || totalVotes === 0) {
    return { winnerIds: new Set(), isTie: false, maxVotes: 0, totalVotes: 0 };
  }

  const maxVotes = Math.max(...list.map((o) => o.voteCount || 0));
  const winners = list.filter((o) => (o.voteCount || 0) === maxVotes);

  return {
    winnerIds: new Set(winners.map((o) => o.id)),
    isTie: winners.length > 1,
    maxVotes,
    totalVotes,
  };
}

function CommunityDetail() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
    const [busy, setBusy] = useState(null);
    const [reportDecision, setReportDecision] = useState(null);
  const [revealedResults, setRevealedResults] = useState({});

  const toggleReveal = (decisionId) => {
    setRevealedResults((current) => ({
      ...current,
      [decisionId]: !current[decisionId],
    }));
  };

  const headers = () => ({ Authorization: `Bearer ${sessionStorage.getItem("token")}` });
  const notify = (text, error = false) => { setIsError(error); setMessage(text); };

  const request = async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Something went wrong.");
    return data;
  };

  const load = async () => {
    try {
      const [communityData, decisionsData, messagesData] = await Promise.all([
        request(`/api/communities/${communityId}`),
        request(`/api/communities/${communityId}/decisions`),
        request(`/api/communities/${communityId}/messages`),
      ]);
      if (!communityData.joined) { navigate("/communities"); return; }
      setCommunity(communityData);
      setDecisions(Array.isArray(decisionsData) ? decisionsData : []);
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      notify(error.message || "Unable to load this community.", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [communityId]);
  useEffect(() => { if (!message) return undefined; const timer = setTimeout(() => setMessage(""), 3500); return () => clearTimeout(timer); }, [message]);

  const vote = async (decisionId, optionId) => {
    setBusy(`vote-${optionId}`);
    try { await request(`/api/decisions/${decisionId}/vote/${optionId}`, { method: "POST" }); notify("Your vote has been recorded."); await load(); }
    catch (error) { notify(error.message, true); } finally { setBusy(null); }
  };

  const loadComments = async (decisionId) => {
    try {
      const loaded = await request(`/api/decisions/${decisionId}/comments`);
      setComments((current) => ({ ...current, [decisionId]: loaded }));
    }
    catch (error) { notify(error.message, true); }
  };

  const addComment = async (decisionId) => {
    const content = (commentText[decisionId] || "").trim();
    if (!content) return notify("Write a comment before posting.", true);
    try {
      const added = await request(`/api/decisions/${decisionId}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
      setComments((current) => ({ ...current, [decisionId]: [...(current[decisionId] || []), added] }));
      setCommentText((current) => ({ ...current, [decisionId]: "" }));
      notify("Comment posted.");
    } catch (error) { notify(error.message, true); }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const content = chatText.trim();
    if (!content) return;
    try {
      const added = await request(`/api/communities/${communityId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
      setMessages((current) => [...current, added]); setChatText("");
    } catch (error) { notify(error.message, true); }
  };

  if (loading) return <DashboardLayout pageTitle="Community" pageSubtitle="Loading your community space."><div className="community-workspace-loading">Loading community...</div></DashboardLayout>;
  if (!community) return <DashboardLayout pageTitle="Community" pageSubtitle=""><div className="community-workspace-loading">This community could not be loaded.</div></DashboardLayout>;

  return (
    <DashboardLayout pageTitle={community.communityName} pageSubtitle={community.description || "A shared space for conversation and decisions."}>
      <Toast message={message} isError={isError} />
      <style>{`
        .community-workspace { display:grid; grid-template-columns:minmax(0,1.5fr) minmax(260px,.7fr); gap:20px; max-width:1200px; }
        .workspace-panel { background:var(--app-card); border:1px solid var(--app-border); border-radius:14px; padding:20px; }
        .workspace-panel h2 { color:var(--app-text); font-size:18px; margin:0 0 5px; }
        .workspace-panel > p { color:var(--app-secondary-text); font-size:12px; margin:0 0 18px; }
        .workspace-head { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:18px; }
        .workspace-link { color:#8b5cf6; font-size:12px; font-weight:700; text-decoration:none; }
        .poll-card { border-top:1px solid var(--app-border); padding:18px 0 4px; }
        .poll-card:first-of-type { border-top:0; padding-top:0; }
        .poll-card h3 { color:var(--app-text); font-size:16px; margin:0 0 5px; }
        .poll-card p, .poll-meta { color:var(--app-secondary-text); font-size:12px; line-height:1.5; }
        .poll-meta { margin:8px 0 12px; }
        .poll-option { display:flex; justify-content:space-between; align-items:center; width:100%; padding:10px 12px; margin:7px 0; border:1px solid var(--app-border); border-radius:8px; background:var(--app-card-2); color:var(--app-text); cursor:pointer; text-align:left; }
        .poll-option:disabled { cursor:default; opacity:.82; }
        .poll-option.selected { border-color:#8b5cf6; background:rgba(139,92,246,.12); }
        .poll-option span { color:var(--app-secondary-text); font-size:11px; }
                .poll-option.is-leading { border-color:#22c55e; background:rgba(34,197,94,.10); box-shadow:0 0 0 1px rgba(34,197,94,.25); }
        .poll-option-copy { flex:1; min-width:0; margin-right:10px; }
        .leading-badge, .tie-badge { display:inline-block; margin-left:8px; padding:2px 7px; border-radius:20px; font-size:9px; font-weight:700; vertical-align:middle; }
        .leading-badge { color:#15803d; background:rgba(34,197,94,.16); border:1px solid rgba(34,197,94,.35); }
        .tie-badge { color:#b45309; background:rgba(245,158,11,.16); border:1px solid rgba(245,158,11,.35); }
                .result-banner { margin-bottom:10px; padding:12px 14px; border-radius:10px; font-size:13px; font-weight:600; text-align:center; line-height:1.5; }
        .result-banner-empty { border:1px dashed var(--app-border); background:var(--app-card-2); color:var(--app-secondary-text); }
                .result-banner-leading { border:1px solid rgba(34,197,94,.4); background:rgba(34,197,94,.12); color:#15803d; }
        .result-banner-final { border:1px solid rgba(22,163,74,.4); background:rgba(22,163,74,.12); color:#15803d; }
        .result-banner-tie { border:1px dashed rgba(245,158,11,.4); background:rgba(245,158,11,.10); color:#b45309; }
        .option-bar-track { margin-top:6px; width:100%; height:5px; border-radius:4px; background:var(--app-border); overflow:hidden; }
        .option-bar-fill { height:100%; border-radius:4px; background:linear-gradient(135deg,#4f46e5,#7c3aed); transition:width .4s ease; }
          .option-bar-fill.is-leading { background:linear-gradient(135deg,#22c55e,#16a34a); }
        .discussion { margin-top:14px; border-top:1px solid var(--app-border); padding-top:12px; }
        .discussion summary { color:#8b5cf6; cursor:pointer; font-size:12px; font-weight:700; }
        .comment { padding:9px 0; border-bottom:1px solid var(--app-border); color:var(--app-secondary-text); font-size:12px; }
        .comment strong { color:var(--app-text); margin-right:7px; }
        .comment-form, .chat-form { display:flex; gap:8px; margin-top:10px; }
        .comment-form input, .chat-form input { min-width:0; flex:1; border:1px solid var(--app-border); border-radius:7px; background:var(--app-card-2); color:var(--app-text); padding:9px 10px; }
        .comment-form button, .chat-form button, .primary-action { border:0; border-radius:7px; background:#6840be; color:#fff; padding:9px 12px; font-weight:700; cursor:pointer; }
        .chat-log { max-height:380px; overflow:auto; }
        .chat-message { padding:10px 0; border-bottom:1px solid var(--app-border); color:var(--app-secondary-text); font-size:12px; line-height:1.45; }
        .chat-message strong { display:block; color:var(--app-text); margin-bottom:3px; }
        .member-list { display:flex; flex-wrap:wrap; gap:7px; margin-top:15px; }
        .member { border:1px solid var(--app-border); border-radius:20px; color:var(--app-secondary-text); padding:6px 9px; font-size:11px; }
        .empty-copy { color:var(--app-secondary-text); font-size:12px; }
                @media (max-width:800px) { .community-workspace { grid-template-columns:1fr; } }

        .poll-card-title-row { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
        .report-action { padding:6px 9px; border:1px solid rgba(34,197,94,.3); border-radius:8px; background:rgba(34,197,94,.08); color:#15803d; font-size:10px; font-weight:700; cursor:pointer; white-space:nowrap; }
        .report-action:hover { background:rgba(34,197,94,.16); }
        .reveal-result-btn { width:100%; margin-bottom:6px; padding:10px; border:1px dashed rgba(139,92,246,.4); border-radius:10px; background:rgba(139,92,246,.08); color:#8b5cf6; font-size:12px; font-weight:700; cursor:pointer; }
        .reveal-result-btn:hover { background:rgba(139,92,246,.16); }
        .hide-result-btn { display:block; margin:-4px 0 6px auto; border:0; background:transparent; color:var(--app-secondary-text); font-size:10px; text-decoration:underline; cursor:pointer; }

        .report-overlay { position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; }
        .report-modal { width:100%; max-width:560px; max-height:86vh; overflow-y:auto; background:var(--app-card); border:1px solid var(--app-border); border-radius:16px; box-shadow:0 25px 60px rgba(0,0,0,.35); }
        .report-modal-head { display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid var(--app-border); }
        .report-modal-head h3 { margin:0; font-size:14px; color:var(--app-secondary-text); text-transform:uppercase; letter-spacing:.06em; }
        .report-close { border:0; background:transparent; color:var(--app-secondary-text); font-size:16px; cursor:pointer; }
        .report-body { padding:20px; }
        .report-body h2 { margin:0 0 6px; color:var(--app-text); font-size:20px; }
        .report-desc { margin:0 0 16px; color:var(--app-secondary-text); font-size:12px; line-height:1.6; }
        .report-meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; padding:12px; border:1px solid var(--app-border); border-radius:10px; background:var(--app-card-2); }
        .report-meta-grid div { display:flex; flex-direction:column; gap:2px; }
        .report-meta-grid span { color:var(--app-secondary-text); font-size:10px; text-transform:uppercase; }
        .report-meta-grid strong { color:var(--app-text); font-size:12px; }
        .report-winner-line { margin-bottom:16px; padding:12px 14px; border-radius:10px; font-size:13px; font-weight:700; text-align:center; }
        .report-winner-line.win { background:rgba(34,197,94,.12); color:#15803d; border:1px solid rgba(34,197,94,.35); }
        .report-winner-line.tie { background:rgba(245,158,11,.12); color:#b45309; border:1px dashed rgba(245,158,11,.4); }
        .report-winner-line.empty { background:var(--app-card-2); color:var(--app-secondary-text); border:1px dashed var(--app-border); }
        .report-table { width:100%; border-collapse:collapse; font-size:12px; }
        .report-table th, .report-table td { text-align:left; padding:8px 10px; border-bottom:1px solid var(--app-border); color:var(--app-text); }
        .report-table th { color:var(--app-secondary-text); font-size:10px; text-transform:uppercase; }
        .report-actions { display:flex; gap:10px; padding:16px 20px; border-top:1px solid var(--app-border); }
        .report-btn-primary, .report-btn-secondary { flex:1; padding:10px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; border:1px solid var(--app-border); }
        .report-btn-primary { background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; border:none; }
        .report-btn-secondary { background:var(--app-card-2); color:var(--app-text); }

        @media print {
          body > *:not(#report-print-root) { display: none !important; }
          #report-print-root { display: block !important; position: static !important; background: none !important; padding: 0 !important; }
          .report-modal { max-width: 100% !important; max-height: none !important; overflow: visible !important; box-shadow: none !important; border: none !important; }
          .report-modal-head, .report-actions { display: none !important; }
        }
      `}</style>
      <div className="community-workspace">
        <main className="workspace-panel">
          <div className="workspace-head"><div><h2>Community polls</h2><p>Vote on shared questions and discuss the outcome.</p></div><Link className="workspace-link" to={`/create-decision?communityId=${community.id}`}>+ Create poll</Link></div>
          {decisions.length === 0 && <div className="empty-copy">No polls yet. Start the first one for this community.</div>}
          {decisions.map((decision) => {
            const { winnerIds, winners, isTie, totalVotes } = getWinnerInfo(decision.options);
            const isRevealed = !!revealedResults[decision.id];
            return (
                <article className="poll-card" key={decision.id}>
                <div className="poll-card-title-row">
                  <h3>{decision.title}</h3>
                  <button className="report-action" onClick={() => setReportDecision(decision)}>📊 Report</button>
                </div>
                <p>{decision.description}</p>
                <div className="poll-meta">{decision.totalVotes || 0} votes · {decision.status === "COMPLETED" ? "Poll closed" : "Open for voting"}{decision.deadline ? ` · closes ${decision.deadline}` : ""}</div>

                                                {!isRevealed ? (
                  <button className="reveal-result-btn" onClick={() => toggleReveal(decision.id)}>
                    🏁 Show Final Result
                  </button>
                ) : (
                  <>
                    <div className={`result-banner ${totalVotes === 0 ? "result-banner-empty" : isTie ? "result-banner-tie" : decision.status === "COMPLETED" ? "result-banner-final" : "result-banner-leading"}`}>
                      {totalVotes === 0 && "🗳️ No votes yet — be the first to vote!"}
                      {totalVotes > 0 && isTie && (<>🤝 It's a tie between <strong>{winners.map((w) => w.optionText).join(" & ")}</strong></>)}
                      {totalVotes > 0 && !isTie && (<>{decision.status === "COMPLETED" ? "✅ Final Result: " : "🏆 Currently Leading: "}<strong>{winners[0].optionText}</strong> — {winners[0].voteCount} votes ({Math.round((winners[0].voteCount / totalVotes) * 100)}%)</>)}
                    </div>
                    <button className="hide-result-btn" onClick={() => toggleReveal(decision.id)}>Hide result</button>
                  </>
                )}

                {decision.options?.map((option) => {
                  const isLeading = isRevealed && !isTie && winnerIds.has(option.id) && totalVotes > 0;
                  const isTiedLeader = isRevealed && isTie && winnerIds.has(option.id);
                  const percent = totalVotes > 0 ? Math.round(((option.voteCount || 0) / totalVotes) * 100) : 0;

                  return (
                    <button
                      className={`poll-option ${option.selected ? "selected" : ""} ${isLeading || isTiedLeader ? "is-leading" : ""}`}
                      disabled={decision.alreadyVoted || decision.status === "COMPLETED" || busy === `vote-${option.id}`}
                      onClick={() => vote(decision.id, option.id)}
                      key={option.id}
                    >
                      <div className="poll-option-copy">
                        <b>
                          {option.optionText}
                          {isLeading && <span className="leading-badge">🏆 Leading</span>}
                        </b>
                        {isRevealed && (
                          <div className="option-bar-track">
                            <div className={`option-bar-fill ${isLeading || isTiedLeader ? "is-leading" : ""}`} style={{ width: `${percent}%` }} />
                          </div>
                        )}
                      </div>
                      <span>{option.voteCount || 0} votes{isRevealed && totalVotes > 0 ? ` · ${percent}%` : ""}</span>
                    </button>
                  );
                })}

                <details className="discussion" onToggle={(event) => event.currentTarget.open && loadComments(decision.id)}><summary>Discuss this poll ({comments[decision.id]?.length || 0})</summary>
                  {(comments[decision.id] || []).map((comment) => <div className="comment" key={comment.id}><strong>{comment.userName}</strong>{comment.content}</div>)}
                  <form className="comment-form" onSubmit={(event) => { event.preventDefault(); addComment(decision.id); }}><input value={commentText[decision.id] || ""} onChange={(event) => setCommentText((current) => ({ ...current, [decision.id]: event.target.value }))} placeholder="Add to the discussion" maxLength="1000" /><button type="submit">Post</button></form>
                </details>
              </article>
            );
          })}
        </main>
        <aside className="workspace-panel">
          <div className="workspace-head"><div><h2>Community chat</h2><p>Talk with everyone in the room.</p></div></div>
          <div className="chat-log">{messages.length === 0 && <div className="empty-copy">Start the conversation.</div>}{messages.map((item) => <div className="chat-message" key={item.id}><strong>{item.userName}</strong>{item.content}</div>)}</div>
          <form className="chat-form" onSubmit={sendMessage}><input value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="Write a message" maxLength="2000" /><button type="submit">Send</button></form>
          <h2 style={{ marginTop: 24 }}>Members · {community.memberCount}</h2><div className="member-list">{community.memberNames?.map((name) => <span className="member" key={name}>{name}</span>)}</div>
        </aside>
            </div>

            {reportDecision && (() => {
        const report = buildReportData(reportDecision);
        return createPortal(
          <div id="report-print-root" className="report-overlay" onClick={() => setReportDecision(null)}>
            <div className="report-modal" onClick={(e) => e.stopPropagation()}>
              <div className="report-modal-head">
                <h3>Results Report</h3>
                <button className="report-close" onClick={() => setReportDecision(null)}>✕</button>
              </div>
              <div className="report-body">
                <h2>{report.title}</h2>
                <p className="report-desc">{report.description}</p>
                <div className="report-meta-grid">
                  <div><span>Category</span><strong>{report.category}</strong></div>
                  <div><span>Community</span><strong>{report.community}</strong></div>
                  <div><span>Status</span><strong>{report.status}</strong></div>
                  <div><span>Deadline</span><strong>{report.deadline}</strong></div>
                  <div><span>Total Votes</span><strong>{report.totalVotes}</strong></div>
                  <div><span>Generated</span><strong>{report.generatedAt}</strong></div>
                </div>
                <div className={`report-winner-line ${report.totalVotes === 0 ? "empty" : report.isTie ? "tie" : "win"}`}>
                  {report.totalVotes === 0 ? "🗳️ " : report.isTie ? "🤝 " : "🏆 "}
                  {report.winnerText}
                </div>
                <table className="report-table">
                  <thead><tr><th>Option</th><th>Votes</th><th>Share</th></tr></thead>
                  <tbody>
                    {report.options.map((o) => (
                      <tr key={o.text}><td>{o.text}</td><td>{o.votes}</td><td>{o.percent}%</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
                            <div className="report-actions">
                <button className="report-btn-secondary" onClick={() => downloadCSV(reportDecision)}>⬇ Download CSV</button>
                <button className="report-btn-primary" onClick={() => window.print()}>🖨 Print / Save as PDF</button>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

    </DashboardLayout>
  );
}

export default CommunityDetail;