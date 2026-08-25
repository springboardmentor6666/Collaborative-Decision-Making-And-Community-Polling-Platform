import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";

const API = "http://localhost:8080";

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
      `}</style>
      <div className="community-workspace">
        <main className="workspace-panel">
          <div className="workspace-head"><div><h2>Community polls</h2><p>Vote on shared questions and discuss the outcome.</p></div><Link className="workspace-link" to={`/create-decision?communityId=${community.id}`}>+ Create poll</Link></div>
          {decisions.length === 0 && <div className="empty-copy">No polls yet. Start the first one for this community.</div>}
          {decisions.map((decision) => (
            <article className="poll-card" key={decision.id}>
              <h3>{decision.title}</h3><p>{decision.description}</p>
              <div className="poll-meta">{decision.totalVotes || 0} votes · {decision.status === "COMPLETED" ? "Poll closed" : "Open for voting"}{decision.deadline ? ` · closes ${decision.deadline}` : ""}</div>
              {decision.options?.map((option) => <button className={`poll-option ${option.selected ? "selected" : ""}`} disabled={decision.alreadyVoted || decision.status === "COMPLETED" || busy === `vote-${option.id}`} onClick={() => vote(decision.id, option.id)} key={option.id}><b>{option.optionText}</b><span>{option.voteCount || 0} votes</span></button>)}
              <details className="discussion" onToggle={(event) => event.currentTarget.open && loadComments(decision.id)}><summary>Discuss this poll ({comments[decision.id]?.length || 0})</summary>
                {(comments[decision.id] || []).map((comment) => <div className="comment" key={comment.id}><strong>{comment.userName}</strong>{comment.content}</div>)}
                <form className="comment-form" onSubmit={(event) => { event.preventDefault(); addComment(decision.id); }}><input value={commentText[decision.id] || ""} onChange={(event) => setCommentText((current) => ({ ...current, [decision.id]: event.target.value }))} placeholder="Add to the discussion" maxLength="1000" /><button type="submit">Post</button></form>
              </details>
            </article>
          ))}
        </main>
        <aside className="workspace-panel">
          <div className="workspace-head"><div><h2>Community chat</h2><p>Talk with everyone in the room.</p></div></div>
          <div className="chat-log">{messages.length === 0 && <div className="empty-copy">Start the conversation.</div>}{messages.map((item) => <div className="chat-message" key={item.id}><strong>{item.userName}</strong>{item.content}</div>)}</div>
          <form className="chat-form" onSubmit={sendMessage}><input value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="Write a message" maxLength="2000" /><button type="submit">Send</button></form>
          <h2 style={{ marginTop: 24 }}>Members · {community.memberCount}</h2><div className="member-list">{community.memberNames?.map((name) => <span className="member" key={name}>{name}</span>)}</div>
        </aside>
      </div>
    </DashboardLayout>
  );
}

export default CommunityDetail;
