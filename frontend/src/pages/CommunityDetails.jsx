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
  fetchDecisions
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
  const [activeTab, setActiveTab] = useState('decisions'); // 'decisions' | 'members'
  
  const [membershipStatus, setMembershipStatus] = useState('NONE'); // 'NONE' | 'MEMBER' | 'OWNER' | 'ADMIN'
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Since backend is a stub, these might fail. We catch and use dummy/empty data.
        const commData = await getCommunityByIdApi(id, accessToken).catch(() => ({
          id,
          name: 'Community Name',
          description: 'This is a community description.',
          visibility: 'PUBLIC',
          memberCount: 0,
          owner: { id: 'usr_unknown', name: 'Unknown' }
        }));
        
        setCommunity(commData);
        
        const membersData = await getCommunityMembersApi(id, accessToken).catch(() => []);
        setMembers(membersData);
        
        // Determine role based on members list or owner
        if (commData.owner?.id === user?.id) {
          setMembershipStatus('OWNER');
        } else {
          const myMember = membersData.find(m => m.user?.id === user?.id);
          if (myMember) {
            setMembershipStatus(myMember.role || 'MEMBER');
          } else {
            setMembershipStatus('NONE');
          }
        }

        // Fetch decisions and filter for this community (assuming frontend filtering for now)
        const allDecisions = await fetchDecisions(accessToken).catch(() => []);
        setDecisions(allDecisions.filter(d => d.communityId === id));
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load community details.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, accessToken, user]);

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await joinCommunityApi(id, accessToken);
      setMembershipStatus('MEMBER');
      setCommunity(prev => prev ? { ...prev, memberCount: (prev.memberCount || 0) + 1 } : prev);
      // Re-fetch members
      const updatedMembers = await getCommunityMembersApi(id, accessToken).catch(() => []);
      setMembers(updatedMembers);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this community?')) return;
    setActionLoading(true);
    try {
      await leaveCommunityApi(id, accessToken);
      setMembershipStatus('NONE');
      setCommunity(prev => prev ? { ...prev, memberCount: Math.max(0, (prev.memberCount || 1) - 1) } : prev);
      const updatedMembers = await getCommunityMembersApi(id, accessToken).catch(() => []);
      setMembers(updatedMembers);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await removeCommunityMemberApi(id, memberId, accessToken);
      setMembers(members.filter(m => m.id !== memberId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRole = async (memberId, newRole) => {
    try {
      await updateCommunityMemberRoleApi(id, memberId, newRole, accessToken);
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    } catch (err) {
      console.error(err);
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

  const isPublic = community.visibility === 'PUBLIC' || community.visibility === 'Public';

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
                  
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {community.memberCount || members.length} member{(community.memberCount || members.length) !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Owner: {community.owner?.name || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {membershipStatus === 'NONE' ? (
                    <button
                      onClick={handleJoin}
                      disabled={actionLoading}
                      className="rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-app transition hover:bg-primary-hover disabled:opacity-70"
                    >
                      {actionLoading ? 'Joining...' : 'Join Community'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl border border-primary-soft bg-primary-soft px-3 py-1 text-xs font-bold text-primary uppercase tracking-wide">
                        {membershipStatus}
                      </span>
                      {membershipStatus !== 'OWNER' && (
                        <button
                          onClick={handleLeave}
                          disabled={actionLoading}
                          className="rounded-2xl border border-border-default bg-surface px-4 py-2.5 text-sm font-bold text-text-primary transition hover:bg-surface-alt disabled:opacity-70"
                        >
                          {actionLoading ? 'Leaving...' : 'Leave'}
                        </button>
                      )}
                    </div>
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
                Group Decisions
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`border-b-2 px-4 py-3 text-sm font-bold transition-all ${
                  activeTab === 'members'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:border-border-default hover:text-text-primary'
                }`}
              >
                Members
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'decisions' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-text-primary">Decisions</h2>
                  {(membershipStatus === 'MEMBER' || membershipStatus === 'ADMIN' || membershipStatus === 'OWNER') && (
                    <button
                      onClick={() => navigate('/decisions/create', { state: { communityId: id, communityName: community.name } })}
                      className="inline-flex items-center gap-2 rounded-xl bg-surface-alt px-4 py-2 text-sm font-bold text-text-primary transition hover:bg-border-default"
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
                    <p className="mb-4 text-secondary">No decisions have been created for this community yet.</p>
                    {(membershipStatus === 'MEMBER' || membershipStatus === 'ADMIN' || membershipStatus === 'OWNER') && (
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

            {activeTab === 'members' && (
              <div>
                <h2 className="mb-4 text-lg font-bold text-text-primary">Members</h2>
                {members.length > 0 ? (
                  <div className="rounded-2xl border border-border-default bg-surface overflow-hidden">
                    <ul className="divide-y divide-border-default">
                      {members.map((member) => (
                        <li key={member.id} className="flex items-center justify-between p-4 hover:bg-surface-alt transition">
                          <div className="flex items-center gap-3">
                            {member.user?.avatar ? (
                              <img src={member.user.avatar} alt="" className="h-10 w-10 rounded-full" />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary font-bold">
                                {member.user?.name?.charAt(0) || 'U'}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-text-primary">{member.user?.name || 'Unknown User'}</p>
                              <p className="text-xs text-muted">{member.role}</p>
                            </div>
                          </div>
                          
                          {(membershipStatus === 'OWNER' || membershipStatus === 'ADMIN') && member.user?.id !== user?.id && (
                            <div className="flex items-center gap-2">
                              {membershipStatus === 'OWNER' && member.role !== 'ADMIN' && (
                                <button
                                  onClick={() => handleChangeRole(member.id, 'ADMIN')}
                                  className="text-xs font-semibold text-primary hover:underline"
                                >
                                  Make Admin
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
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
    </div>
  );
}
