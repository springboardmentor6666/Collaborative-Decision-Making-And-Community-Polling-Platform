import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getCommunityByIdApi, 
  joinCommunityApi, 
  leaveCommunityApi, 
  getCommunityMembersApi,
  removeCommunityMemberApi,
  updateCommunityMemberRoleApi,
  updateCommunityApi,
  deleteCommunityApi,
  transferOwnershipApi,
  getCommunityDecisionsApi
} from '../api/axiosClient';
import DecisionCard from '../components/DecisionCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import IconSidebar from '../components/IconSidebar';

export default function CommunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [activeTab, setActiveTab] = useState('decisions'); // 'decisions' | 'members'
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', description: '', visibility: 'PUBLIC' });
  const [editError, setEditError] = useState(null);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedNewOwner, setSelectedNewOwner] = useState('');
  const [transferError, setTransferError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setIsAccessDenied(false);
    try {
      const commData = await getCommunityByIdApi(id, accessToken);
      setCommunity(commData);
      setEditFormData({
        name: commData.name || '',
        description: commData.description || '',
        visibility: commData.visibility || 'PUBLIC'
      });

      // If user has access, fetch members & group decisions
      try {
        const membersData = await getCommunityMembersApi(id, accessToken);
        setMembers(membersData);
      } catch (e) {
        // Members list may be empty or protected
        setMembers([]);
      }

      try {
        const groupDecisions = await getCommunityDecisionsApi(id, accessToken);
        setDecisions(groupDecisions);
      } catch (e) {
        setDecisions([]);
      }

    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('denied')) {
        setIsAccessDenied(true);
      } else {
        setError(err.message || 'Failed to load community details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, accessToken]);

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await joinCommunityApi(id, accessToken);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to join community.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this community?')) return;
    setActionLoading(true);
    try {
      await leaveCommunityApi(id, accessToken);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to leave community.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCommunity = async (e) => {
    e.preventDefault();
    setEditError(null);
    try {
      await updateCommunityApi(id, editFormData, accessToken);
      setShowEditModal(false);
      await fetchData();
    } catch (err) {
      setEditError(err.message || 'Failed to update community.');
    }
  };

  const handleDeleteCommunity = async () => {
    setActionLoading(true);
    try {
      await deleteCommunityApi(id, accessToken);
      navigate('/communities');
    } catch (err) {
      alert(err.message || 'Failed to delete community.');
      setActionLoading(false);
    }
  };

  const handleTransferOwnership = async (e) => {
    e.preventDefault();
    if (!selectedNewOwner) {
      setTransferError('Please select a member to transfer ownership to.');
      return;
    }
    setTransferError(null);
    try {
      await transferOwnershipApi(id, Number(selectedNewOwner), accessToken);
      setShowTransferModal(false);
      await fetchData();
    } catch (err) {
      setTransferError(err.message || 'Failed to transfer ownership.');
    }
  };

  const handleRemoveMember = async (targetUserId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await removeCommunityMemberApi(id, targetUserId, accessToken);
      setMembers(members.filter(m => m.user?.id !== targetUserId));
      setCommunity(prev => prev ? { ...prev, memberCount: Math.max(0, (prev.memberCount || 1) - 1) } : prev);
    } catch (err) {
      alert(err.message || 'Failed to remove member.');
    }
  };

  const handleChangeRole = async (targetUserId, newRole) => {
    try {
      await updateCommunityMemberRoleApi(id, targetUserId, newRole, accessToken);
      setMembers(members.map(m => m.user?.id === targetUserId ? { ...m, role: newRole } : m));
    } catch (err) {
      alert(err.message || 'Failed to update member role.');
    }
  };

  if (loading) {
    return (
      <div className="page-shell min-h-screen flex flex-col sm:pr-[60px]">
        <Navbar />
        <IconSidebar />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (isAccessDenied) {
    return (
      <div className="page-shell min-h-screen flex flex-col sm:pr-[60px]">
        <Navbar />
        <IconSidebar />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl border border-border-default bg-surface p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h2>
            <p className="text-secondary text-sm mb-6">
              This is a private community. You must be an invited member to view its details and decisions.
            </p>
            <Link to="/communities" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-app transition hover:bg-primary-hover">
              Back to Communities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="page-shell min-h-screen flex flex-col sm:pr-[60px]">
        <Navbar />
        <IconSidebar />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Community Not Found</h2>
            <p className="text-muted mb-6">{error || "The community you're looking for doesn't exist."}</p>
            <Link to="/communities" className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover">
              Back to Communities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPublic = community.visibility === 'PUBLIC';
  const isMember = community.isMember;
  const userRole = community.currentUserRole; // 'OWNER', 'ADMIN', 'MEMBER', or null
  const isOwner = userRole === 'OWNER';
  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="page-shell min-h-screen flex flex-col sm:pr-[60px]">
      <Navbar />
      <IconSidebar />
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
            
            {/* Header */}
            <div className="mb-8 rounded-3xl border border-border-default bg-surface p-6 shadow-sm md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-black text-text-primary tracking-tight">{community.name}</h1>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: isPublic ? 'var(--status-open-bg)' : 'var(--status-closed-bg)',
                        color: isPublic ? 'var(--status-open-text)' : 'var(--status-closed-text)',
                      }}
                    >
                      {isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <p className="text-secondary max-w-2xl">{community.description}</p>
                  
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {community.memberCount} member{community.memberCount !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {community.decisionCount} decision{community.decisionCount !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Owner: {community.createdBy?.fullName || community.createdBy?.name || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Membership & Owner Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  {!isMember && isPublic && (
                    <button
                      onClick={handleJoin}
                      disabled={actionLoading}
                      className="rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-app transition hover:bg-primary-hover disabled:opacity-70"
                    >
                      {actionLoading ? 'Joining...' : 'Join Community'}
                    </button>
                  )}

                  {isMember && (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-xl border border-primary-soft bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary uppercase tracking-wide">
                        {userRole}
                      </span>
                      <button
                        onClick={handleLeave}
                        disabled={actionLoading}
                        className="rounded-2xl border border-border-default bg-surface px-4 py-2.5 text-sm font-bold text-text-primary transition hover:bg-surface-alt disabled:opacity-70"
                      >
                        {actionLoading ? 'Leaving...' : 'Leave'}
                      </button>
                    </div>
                  )}

                  {(isOwner || isAdmin) && (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="rounded-2xl border border-border-default bg-surface px-4 py-2.5 text-sm font-bold text-text-primary transition hover:bg-surface-alt"
                    >
                      Edit Info
                    </button>
                  )}

                  {isOwner && (
                    <>
                      <button
                        onClick={() => setShowTransferModal(true)}
                        className="rounded-2xl border border-border-default bg-surface px-4 py-2.5 text-sm font-bold text-text-primary transition hover:bg-surface-alt"
                      >
                        Transfer Owner
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-2 border-b border-border-default pb-px">
              <button
                onClick={() => setActiveTab('decisions')}
                className={`border-b-2 px-4 py-3 text-sm font-bold transition-all ${
                  activeTab === 'decisions'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:border-border-default hover:text-text-primary'
                }`}
              >
                Group Decisions ({decisions.length})
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`border-b-2 px-4 py-3 text-sm font-bold transition-all ${
                  activeTab === 'members'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:border-border-default hover:text-text-primary'
                }`}
              >
                Members ({members.length})
              </button>
            </div>

            {/* Tab Content: Decisions */}
            {activeTab === 'decisions' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-text-primary">Decisions</h2>
                  {isMember && (
                    <button
                      onClick={() => navigate('/decisions/create', { state: { communityId: id, communityName: community.name } })}
                      className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-app transition hover:bg-primary-hover"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Create Decision
                    </button>
                  )}
                </div>
                
                {decisions.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {decisions.map((decision) => (
                      <DecisionCard key={decision.id} decision={decision} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-border-default bg-surface p-12 text-center">
                    <p className="mb-4 text-secondary">No decisions have been created in this community yet.</p>
                    {isMember && (
                      <button
                        onClick={() => navigate('/decisions/create', { state: { communityId: id, communityName: community.name } })}
                        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-app transition hover:bg-primary-hover"
                      >
                        Create the First Decision
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab Content: Members */}
            {activeTab === 'members' && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-text-primary">Members ({members.length})</h2>
                {members.length > 0 ? (
                  <div className="rounded-2xl border border-border-default bg-surface overflow-hidden">
                    <ul className="divide-y divide-border-default">
                      {members.map((m) => {
                        const mUser = m.user || {};
                        const mUserId = mUser.id;
                        const isSelf = user?.email === mUser.email || user?.id === mUserId;
                        return (
                          <li key={m.id} className="flex flex-wrap items-center justify-between p-4 hover:bg-surface-alt transition gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary font-bold">
                                {(mUser.fullName || mUser.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-text-primary">
                                  {mUser.fullName || mUser.name || 'User'} {isSelf && <span className="text-xs text-muted font-normal">(You)</span>}
                                </p>
                                <p className="text-xs text-muted">{mUser.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                                m.role === 'OWNER' ? 'bg-amber-100 text-amber-800' :
                                m.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {m.role}
                              </span>

                              {/* Actions for OWNER / ADMIN */}
                              {!isSelf && (
                                <div className="flex items-center gap-2">
                                  {/* OWNER can promote/demote */}
                                  {isOwner && m.role === 'MEMBER' && (
                                    <button
                                      onClick={() => handleChangeRole(mUserId, 'ADMIN')}
                                      className="text-xs font-semibold text-primary hover:underline"
                                    >
                                      Make Admin
                                    </button>
                                  )}

                                  {isOwner && m.role === 'ADMIN' && (
                                    <button
                                      onClick={() => handleChangeRole(mUserId, 'MEMBER')}
                                      className="text-xs font-semibold text-muted hover:underline"
                                    >
                                      Demote
                                    </button>
                                  )}

                                  {/* OWNER can remove anyone (except owner); ADMIN can remove MEMBER */}
                                  {((isOwner && m.role !== 'OWNER') || (isAdmin && m.role === 'MEMBER')) && (
                                    <button
                                      onClick={() => handleRemoveMember(mUserId)}
                                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border-default bg-surface p-8 text-center text-secondary">
                    No members found.
                  </div>
                )}
              </div>
            )}
          </div>
          <Footer />
        </main>
      </div>

      {/* Edit Community Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border-default bg-surface p-6 shadow-xl">
            <h2 className="text-xl font-bold text-text-primary mb-4">Edit Community</h2>
            {editError && <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-800">{editError}</div>}
            <form onSubmit={handleUpdateCommunity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full rounded-2xl border border-border-default bg-surface p-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full rounded-2xl border border-border-default bg-surface p-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Visibility</label>
                <select
                  value={editFormData.visibility}
                  onChange={(e) => setEditFormData({ ...editFormData, visibility: e.target.value })}
                  className="w-full rounded-2xl border border-border-default bg-surface p-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="PUBLIC">PUBLIC — Anyone can view</option>
                  <option value="PRIVATE">PRIVATE — Members only</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-border-default bg-surface px-4 py-2 text-sm font-bold text-muted hover:bg-surface-alt"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-app hover:bg-primary-hover"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border-default bg-surface p-6 shadow-xl">
            <h2 className="text-xl font-bold text-text-primary mb-2">Transfer Ownership</h2>
            <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-2xl border border-amber-200 mb-4">
              Warning: Transferring ownership will change your role from OWNER to ADMIN. You will no longer be able to delete the group or transfer ownership.
            </p>
            {transferError && <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-800">{transferError}</div>}
            <form onSubmit={handleTransferOwnership} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">Select New Owner</label>
                <select
                  value={selectedNewOwner}
                  onChange={(e) => setSelectedNewOwner(e.target.value)}
                  className="w-full rounded-2xl border border-border-default bg-surface p-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                  required
                >
                  <option value="">-- Select Member --</option>
                  {members
                    .filter(m => m.role !== 'OWNER')
                    .map(m => (
                      <option key={m.user?.id} value={m.user?.id}>
                        {m.user?.fullName || m.user?.name || m.user?.email} ({m.role})
                      </option>
                    ))
                  }
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="rounded-xl border border-border-default bg-surface px-4 py-2 text-sm font-bold text-muted hover:bg-surface-alt"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-amber-600 px-5 py-2 text-sm font-bold text-white shadow-app hover:bg-amber-700"
                >
                  Transfer Ownership
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-border-default bg-surface p-6 shadow-xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Delete Community?</h2>
            <p className="text-sm text-secondary mb-6">
              Are you sure you want to delete <span className="font-bold">{community.name}</span>? This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-border-default bg-surface px-5 py-2.5 text-sm font-bold text-muted hover:bg-surface-alt"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCommunity}
                disabled={actionLoading}
                className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-app hover:bg-red-700 disabled:opacity-70"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
