import { useEffect, useState, useMemo } from 'react';
import {
  getCommunitiesApi,
  getCategoriesApi,
  getPendingCommunityInvitesApi,
  respondToCommunityInviteApi,
} from '../api/axiosClient';
import CommunityCard from '../components/CommunityCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import IconSidebar from '../components/IconSidebar';

export default function CommunitiesPage() {
  const { accessToken } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [respondingInviteId, setRespondingInviteId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInvites = async () => {
    if (accessToken) {
      try {
        const invites = await getPendingCommunityInvitesApi(accessToken);
        setPendingInvites(invites || []);
      } catch (e) {
        setPendingInvites([]);
      }
    }
  };

  const handleRespondInvite = async (inviteId, response) => {
    setRespondingInviteId(inviteId);
    try {
      await respondToCommunityInviteApi(inviteId, response, accessToken);
      await fetchInvites();
      // Refresh communities list
      const commData = await getCommunitiesApi(searchQuery, accessToken);
      setCommunities(Array.isArray(commData) ? commData : []);
    } catch (err) {
      alert(err.message || `Failed to ${response.toLowerCase()} invitation`);
    } finally {
      setRespondingInviteId(null);
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      Promise.all([
        getCommunitiesApi(searchQuery, accessToken),
        getCategoriesApi(accessToken).catch(() => []),
        accessToken ? getPendingCommunityInvitesApi(accessToken).catch(() => []) : Promise.resolve([]),
      ])
        .then(([commData, catData, invitesData]) => {
          if (isSubscribed) {
            setCommunities(Array.isArray(commData) ? commData : []);
            setCategories(Array.isArray(catData) ? catData : []);
            setPendingInvites(Array.isArray(invitesData) ? invitesData : []);
          }
        })
        .catch((err) => {
          if (isSubscribed) setError(err.message || 'Failed to load communities.');
        })
        .finally(() => {
          if (isSubscribed) setLoading(false);
        });
    }, 300);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [searchQuery, accessToken]);

  const filteredCommunities = useMemo(() => {
    return communities.filter((c) => {
      const catName = c.categoryName || c.category?.name;
      const matchesCat =
        selectedCategory === 'ALL' ||
        (catName && catName.toLowerCase() === selectedCategory.toLowerCase());
      return matchesCat;
    });
  }, [communities, selectedCategory]);

  return (
    <div className="page-shell min-h-screen flex flex-col sm:pr-[60px]">
      <Navbar />
      <IconSidebar />
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-primary">Communities</h1>
                <p className="mt-1 text-secondary">Discover and join groups that share your interests.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/communities/create"
                  className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-app transition hover:bg-primary-hover"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create Community
                </Link>
              </div>
            </div>

            {/* Pending Community Invitations Banner */}
            {pendingInvites.length > 0 && (
              <div className="mb-8 rounded-3xl border border-primary/30 bg-primary-soft/50 p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white text-sm">
                    ✉️
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-text-primary">
                      Pending Community Invitations ({pendingInvites.length})
                    </h3>
                    <p className="text-xs text-secondary">
                      You have been invited to collaborate in the following communities.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between rounded-2xl border border-border-default bg-surface p-4 shadow-xs"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="font-bold text-sm text-text-primary truncate">
                          {invite.communityName || invite.community?.name || 'Community Invite'}
                        </p>
                        <p className="text-xs text-muted">
                          Invited by <strong className="text-text-primary">{invite.invitedByName || invite.invitedBy?.name || 'Community Admin'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRespondInvite(invite.id, 'ACCEPT')}
                          disabled={respondingInviteId === invite.id}
                          className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition disabled:opacity-60"
                        >
                          {respondingInviteId === invite.id ? '...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleRespondInvite(invite.id, 'REJECT')}
                          disabled={respondingInviteId === invite.id}
                          className="rounded-xl border border-border-default bg-surface-alt px-3 py-1.5 text-xs font-bold text-muted hover:text-text-primary transition disabled:opacity-60"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter & Search Controls Side-by-Side */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text-primary">All Communities</h2>
                <span className="rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-bold text-muted">
                  {filteredCommunities.length}
                </span>
              </div>

              {/* Side-by-side Category Filter and Search */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                {/* Category Filter Dropdown */}
                <div className="relative min-w-[160px] sm:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="app-input w-full px-3 py-2 text-xs sm:text-sm font-medium cursor-pointer"
                  >
                    <option value="ALL">✨ All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Input */}
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="Search communities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="app-input w-full pl-9 pr-4 py-2 text-xs sm:text-sm"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-4 w-4 text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-2xl bg-red-50 p-4 border border-red-100 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredCommunities.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCommunities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border-default bg-surface p-12 text-center">
                <p className="mb-4 text-secondary">
                  {searchQuery || selectedCategory !== 'ALL'
                    ? 'No communities match your category or search query.'
                    : 'No communities found. Be the first to start a group!'}
                </p>
                <Link
                  to="/communities/create"
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-app transition hover:bg-primary-hover"
                >
                  Create Community
                </Link>
              </div>
            )}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
