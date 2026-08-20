import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";

const API = "http://localhost:8080";

function Polls() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);
  const [openDiscussion, setOpenDiscussion] = useState(null);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const authHeaders = () => ({ Authorization: `Bearer ${sessionStorage.getItem("token")}` });
  const notify = (text, error = false) => { setIsError(error); setMessage(text); };

  const loadPolls = async () => {
    try {
      const response = await fetch(`${API}/api/decisions/active`, { headers: authHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load active polls.");
      setDecisions(Array.isArray(data) ? data : []);
    } catch (error) {
      setDecisions([]); notify(error.message || "Unable to load active polls.", true);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadPolls(); }, []);
  useEffect(() => { if (!message) return undefined; const timer = setTimeout(() => setMessage(""), 3500); return () => clearTimeout(timer); }, [message]);

  const vote = async (decisionId, optionId) => {
    setVotingId(optionId);
    try {
      const response = await fetch(`${API}/api/decisions/${decisionId}/vote/${optionId}`, { method: "POST", headers: authHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to submit your vote.");
      notify("Your vote has been recorded."); await loadPolls();
    } catch (error) { notify(error.message || "Unable to submit your vote.", true); }
    finally { setVotingId(null); }
  };

  const loadComments = async (decisionId) => {
    try {
      const response = await fetch(`${API}/api/decisions/${decisionId}/comments`, { headers: authHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load the discussion.");
      setComments(previous => ({ ...previous, [decisionId]: data }));
    } catch (error) { notify(error.message || "Unable to load the discussion.", true); }
  };
  const toggleDiscussion = decisionId => { const next = openDiscussion === decisionId ? null : decisionId; setOpenDiscussion(next); if (next) { setCommentText(""); loadComments(decisionId); } };
  const addComment = async decisionId => {
    const content = commentText.trim();
    if (!content) return notify("Write a comment before posting.", true);
    try {
      const response = await fetch(`${API}/api/decisions/${decisionId}/comments`, { method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to add your comment.");
      setComments(previous => ({ ...previous, [decisionId]: [...(previous[decisionId] || []), data] })); setCommentText(""); notify("Comment posted.");
    } catch (error) { notify(error.message || "Unable to add your comment.", true); }
  };
  const deleteComment = async (decisionId, commentId) => {
    try {
      const response = await fetch(`${API}/api/comments/${commentId}`, { method: "DELETE", headers: authHeaders() });
      if (!response.ok) { const data = await response.json(); throw new Error(data.message || "Unable to delete comment."); }
      setComments(previous => ({ ...previous, [decisionId]: previous[decisionId].filter(comment => comment.id !== commentId) })); notify("Comment deleted.");
    } catch (error) { notify(error.message || "Unable to delete comment.", true); }
  };

  return <DashboardLayout pageTitle="Active Polls" pageSubtitle="Vote, compare viewpoints, and discuss each decision with the community.">
    <Toast message={message} isError={isError} />
    <style>{`
      .polls-page { max-width: 1400px; margin: 0 auto; color: #f8fafc; padding: 4px 0 42px; }
      .polls-hero { position: relative; overflow: hidden; margin-bottom: 22px; padding: 27px 30px; border: 1px solid #31284a; border-radius: 18px; background: radial-gradient(circle at 86% 16%, rgba(79,70,229,.3), transparent 28%), linear-gradient(135deg, #1a1530, #100d1b); box-shadow: 0 18px 45px rgba(0,0,0,.2); }
      .polls-hero::after { content: ""; position: absolute; right: -42px; bottom: -70px; width: 210px; height: 210px; border: 1px solid rgba(167,139,250,.18); border-radius: 50%; }
      .polls-eyebrow { display: inline-flex; align-items: center; gap: 7px; color: #c4b5fd; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }.polls-live-dot { width: 7px; height: 7px; border-radius: 100%; background: #34d399; box-shadow: 0 0 10px #34d399; }
      .polls-hero h2 { margin: 10px 0 6px; font-size: clamp(24px, 3vw, 32px); letter-spacing: -.7px; }.polls-hero p { max-width: 580px; margin: 0; color: #9c95ad; font-size: 13px; line-height: 1.6; }.poll-count { position: absolute; right: 30px; top: 29px; display: flex; flex-direction: column; align-items: end; z-index: 1; }.poll-count strong { font-size: 30px; color: #f3edff; line-height: 1; }.poll-count span { color: #958ca6; font-size: 11px; margin-top: 5px; }
      .polls-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }.poll-card { min-width: 0; padding: 23px; border: 1px solid #2d263e; border-radius: 16px; background: linear-gradient(145deg, #181421, #12101a); transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease; }.poll-card:hover { transform: translateY(-3px); border-color: #574174; box-shadow: 0 16px 35px rgba(0,0,0,.22); }
      .poll-meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 16px; }.poll-tag, .poll-community { padding: 5px 9px; border-radius: 7px; font-size: 10px; font-weight: 700; }.poll-tag { border: 1px solid rgba(167,139,250,.28); background: rgba(124,58,237,.14); color: #c9b8ff; }.poll-community { color: #93c5fd; background: rgba(37,99,235,.12); border: 1px solid rgba(96,165,250,.17); }
      .poll-card h3 { margin: 0; color: #f7f3ff; font-size: 20px; line-height: 1.35; }.poll-description { min-height: 43px; margin: 9px 0 17px; color: #9c95ad; font-size: 13px; line-height: 1.6; }.poll-details { display: flex; gap: 14px; flex-wrap: wrap; padding: 12px 0; border-top: 1px solid #282233; border-bottom: 1px solid #282233; color: #898193; font-size: 11px; }
      .option-list { display: grid; gap: 9px; margin-top: 17px; }.poll-option { display: flex; align-items: center; gap: 11px; padding: 11px; border: 1px solid #2d263d; border-radius: 10px; background: rgba(255,255,255,.015); }.poll-option.is-voted { border-color: rgba(110,231,183,.38); background: rgba(16,80,57,.18); }.option-copy { min-width: 0; flex: 1; }.option-copy strong { display: block; color: #eae5f2; font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.option-copy span { color: #807888; font-size: 10px; }
      .vote-action, .discussion-action, .post-action { border: 0; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: 700; transition: .18s ease; }.vote-action { padding: 8px 11px; color: white; background: linear-gradient(135deg, #4f46e5, #7c3aed); }.vote-action:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); }.vote-action:disabled { cursor: default; opacity: .55; }.poll-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 17px; }.poll-footer span { color: #827a91; font-size: 11px; }.discussion-action { padding: 8px 10px; color: #d8ccff; background: #211a32; border: 1px solid #40305e; }.discussion-action:hover { background: #2a2140; }
      .discussion { margin-top: 18px; padding-top: 18px; border-top: 1px solid #302941; animation: reveal .2s ease-out; }.discussion-title { display: flex; justify-content: space-between; margin-bottom: 13px; color: #eee9f8; font-size: 13px; font-weight: 700; }.discussion-title span { color: #81798f; font-size: 10px; font-weight: 500; }.comment-list { display: grid; gap: 9px; max-height: 240px; overflow-y: auto; padding-right: 3px; }.comment { padding: 11px 12px; border-radius: 10px; background: #12101a; border: 1px solid #2a2438; }.comment-head { display: flex; align-items: center; gap: 8px; }.comment-avatar { display: flex; align-items: center; justify-content: center; width: 23px; height: 23px; border-radius: 50%; color: white; background: #4f46e5; font-size: 10px; font-weight: 800; }.comment-name { flex: 1; color: #dcd5ea; font-size: 11px; font-weight: 700; }.comment-time { color: #777083; font-size: 9px; }.delete-comment { border: 0; background: transparent; color: #fda4af; cursor: pointer; font-size: 10px; }.comment p { margin: 7px 0 0 31px; color: #aaa3b3; font-size: 12px; line-height: 1.5; }.comment-empty { padding: 13px; border: 1px dashed #3b314c; border-radius: 10px; color: #877f91; font-size: 11px; text-align: center; }
      .comment-compose { display: flex; gap: 9px; margin-top: 12px; }.comment-compose input { min-width: 0; flex: 1; border: 1px solid #332b43; border-radius: 9px; outline: none; background: #0e0c14; color: #f1ecfb; padding: 10px 11px; font-size: 12px; }.comment-compose input:focus { border-color: #7656ba; }.post-action { padding: 0 13px; background: #6d3dcc; color: white; }.post-action:hover { background: #7b49d9; }.poll-empty { padding: 55px 20px; border: 1px dashed #393046; border-radius: 16px; color: #91899e; text-align: center; background: rgba(255,255,255,.015); }.poll-empty strong { display: block; margin-bottom: 7px; color: #e6e0ef; font-size: 15px; } @keyframes reveal { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } } @media (max-width: 900px) { .polls-grid { grid-template-columns: 1fr; } } @media (max-width: 560px) { .polls-hero { padding: 23px 20px; }.poll-count { right: 20px; }.polls-hero p { max-width: 300px; }.poll-card { padding: 18px; }.poll-footer { align-items: flex-start; gap: 10px; flex-direction: column; } }
    `}</style>
    <div className="polls-page">
      <section className="polls-hero"><div className="polls-eyebrow"><span className="polls-live-dot" /> Live community decisions</div><h2>Have your say.</h2><p>Make a choice, see how the vote is shaping up, then add your perspective to the conversation.</p><div className="poll-count"><strong>{loading ? "—" : decisions.length}</strong><span>open polls</span></div></section>
      {loading ? <div className="poll-empty"><strong>Loading active polls…</strong>Please wait a moment.</div> : null}
      {!loading && decisions.length === 0 ? <div className="poll-empty"><strong>No active polls right now.</strong>Check back soon, or create a decision for your community.</div> : null}
      {!loading && decisions.length > 0 && <div className="polls-grid">{decisions.map(decision => {
        const discussionOpen = openDiscussion === decision.id; const pollComments = comments[decision.id] || [];
        return <article className="poll-card" key={decision.id}><div className="poll-meta"><span className="poll-tag">{decision.category || "General"}</span>{decision.communityName ? <span className="poll-community">{decision.communityName}</span> : null}</div><h3>{decision.title}</h3><p className="poll-description">{decision.description}</p><div className="poll-details"><span>{decision.deadline ? `Ends ${decision.deadline}` : "No closing date"}</span><span>{decision.totalVotes || 0} total votes</span><span>{decision.alreadyVoted ? "Vote submitted" : "Awaiting your vote"}</span></div><div className="option-list">{(decision.options || []).map(option => <div className={`poll-option ${option.selected ? "is-voted" : ""}`} key={option.id}><div className="option-copy"><strong>{option.optionText}</strong><span>{option.voteCount} {option.voteCount === 1 ? "vote" : "votes"}</span></div><button className="vote-action" disabled={decision.alreadyVoted || votingId === option.id} onClick={() => vote(decision.id, option.id)}>{option.selected ? "Voted" : votingId === option.id ? "Voting…" : "Vote"}</button></div>)}</div><div className="poll-footer"><span>{decision.alreadyVoted ? "Thanks for participating." : "Choose one option to participate."}</span><button className="discussion-action" onClick={() => toggleDiscussion(decision.id)}>{discussionOpen ? "Close discussion" : "Open discussion"}</button></div>
          {discussionOpen && <section className="discussion"><div className="discussion-title">Discussion <span>{pollComments.length} {pollComments.length === 1 ? "comment" : "comments"}</span></div>{pollComments.length === 0 ? <div className="comment-empty">No comments yet — start the conversation.</div> : <div className="comment-list">{pollComments.map(comment => <div className="comment" key={comment.id}><div className="comment-head"><span className="comment-avatar">{comment.userName?.charAt(0)?.toUpperCase() || "U"}</span><span className="comment-name">{comment.userName}</span><span className="comment-time">{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}</span>{comment.canDelete ? <button className="delete-comment" onClick={() => deleteComment(decision.id, comment.id)}>Delete</button> : null}</div><p>{comment.content}</p></div>)}</div>}<div className="comment-compose"><input value={commentText} onChange={event => setCommentText(event.target.value)} onKeyDown={event => { if (event.key === "Enter") addComment(decision.id); }} placeholder="Share your point of view…" maxLength="1000" /><button className="post-action" onClick={() => addComment(decision.id)}>Post</button></div></section>}
        </article>;
      })}</div>}
    </div>
  </DashboardLayout>;
}
export default Polls;
