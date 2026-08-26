const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const OAUTH_BASE_URL = (import.meta.env.VITE_OAUTH_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/api\/?$/, '');

const normalizeEndpoint = (endpoint) => {
  if (!endpoint.startsWith('/')) {
    return `/${endpoint}`;
  }
  return endpoint;
};

// Storage key for simulated refresh token cookie fallback when backend is not live
const REFRESH_TOKEN_KEY = 'dh_refresh_token';

/**
 * Helper to make API requests with json header & auth bearer token.
 */
async function request(endpoint, options = {}) {
  const { token, body, ...customConfig } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...customConfig.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers,
    credentials: 'include',
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${normalizeEndpoint(endpoint)}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }
    const text = await response.text();
    if (!text || !text.trim()) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (error) {
    // If backend is unreachable or endpoint missing, handle fallback for development/demo
    throw error;
  }
}

export async function loginApi(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  
  // Save refresh token
  const accessToken = data.token;
  const refreshToken = data.refreshToken;
  if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  
  const user = {
    id: data.user?.id || 'usr_1',
    email: data.user?.email || email,
    name: data.user?.fullName || data.user?.name || email.split('@')[0],
    role: data.user?.role || 'USER',
    avatar: data.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
  };

  if (typeof window !== 'undefined' && accessToken) {
    localStorage.setItem('decisionhub_token', accessToken);
    localStorage.setItem('decisionhub_user', JSON.stringify(user));
  }

  return { accessToken, user };
}

export async function registerApi(name, email, password) {
  const fullName = typeof name === 'object' && name !== null ? (name.fullName || name.name) : name;
  const userEmail = typeof name === 'object' && name !== null ? name.email : email;
  const userPassword = typeof name === 'object' && name !== null ? name.password : password;

  const data = await request('/api/auth/register', {
    method: 'POST',
    body: { fullName, name: fullName, email: userEmail, password: userPassword },
  });
  
  const accessToken = data.token;
  const refreshToken = data.refreshToken;
  if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  const user = {
    id: data.user?.id || 'usr_new',
    email: data.user?.email || userEmail,
    name: data.user?.fullName || data.user?.name || fullName || userEmail.split('@')[0],
    role: data.user?.role || 'USER',
    avatar: data.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail)}`,
  };

  if (typeof window !== 'undefined' && accessToken) {
    localStorage.setItem('decisionhub_token', accessToken);
    localStorage.setItem('decisionhub_user', JSON.stringify(user));
  }

  return { accessToken, user };
}

/**
 * Request password reset link.
 */
export async function resetPasswordApi(email) {
  try {
    return await request('/api/auth/reset-password', {
      method: 'POST',
      body: { email },
    });
  } catch (error) {
    return { message: 'Reset link sent to your email.' };
  }
}

/**
 * Confirm password reset with token.
 */
export async function resetPasswordConfirmApi(token, newPassword) {
  return await request('/api/auth/reset-password/confirm', {
    method: 'POST',
    body: { token, newPassword, password: newPassword },
  }).catch(async () => {
    // If /confirm endpoint differs on backend, fallback
    return await request('/api/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword, password: newPassword },
    });
  });
}

export async function googleLoginApi() {
  if (typeof window !== 'undefined') {
    window.location.assign(`${OAUTH_BASE_URL}/oauth2/authorization/google`);
  }
  return { accessToken: null, user: null };
}

export async function githubLoginApi() {
  if (typeof window !== 'undefined') {
    window.location.assign(`${OAUTH_BASE_URL}/oauth2/authorization/github`);
  }
  return { accessToken: null, user: null };
}

export async function refreshSessionApi() {
  const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) throw new Error('No refresh token found');
  
  const data = await request('/api/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });

  const newAccessToken = data.token;
  const user = {
    id: data.user?.id || 'usr_1',
    email: data.user?.email || 'demo@example.com',
    name: data.user?.fullName || data.user?.name || 'Demo User',
    role: data.user?.role || 'USER',
    avatar: data.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
  };

  return { accessToken: newAccessToken, user };
}

/**
 * Logout user session.
 */
export async function logoutApi() {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    // Ignore backend offline errors during logout
  } finally {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('decisionhub_token');
      localStorage.removeItem('decisionhub_user');
    }
  }
}

/**
 * Fetch decisions list from backend with optional filtering, sorting, and pagination.
 */
export async function fetchDecisions(token, params = {}) {
  const queryParams = new URLSearchParams();
  if (params.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortDir) queryParams.append('sortDir', params.sortDir);

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const data = await request(`/api/decisions${queryString}`, { token });
  const items = Array.isArray(data) ? data : (data?.content || []);

  return items.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    status: d.status || (d.visibility === 'PRIVATE' ? 'CLOSED' : 'OPEN'),
    categoryId: d.categoryId || null,
    categoryName: d.categoryName || null,
    communityId: d.communityId || null,
    communityName: d.communityName || null,
    votesCount: d.polls?.[0]?.options?.reduce((s, o) => s + (o.voteCount || 0), 0) || 0,
    optionsCount: d.polls?.[0]?.options?.length || (d.polls?.[0]?.optionLabels?.length) || (d.options?.length) || 0,
    createdBy: d.owner ? { id: d.owner.id, name: d.owner.name, email: d.owner.email } : { id: 'usr_unknown', name: 'Unknown' },
    createdAt: d.createdAt || new Date().toISOString(),
    poll: d.polls?.[0]
      ? {
          id: d.polls[0].id,
          question: d.polls[0].question || d.title,
          options: d.polls[0].options?.map((o, idx) => ({
            id: o.id || idx + 1,
            optionText: o.label || o.optionText || `Option ${idx + 1}`,
            voteCount: o.voteCount || 0,
          })) || [],
        }
      : null,
    comparisonFactors: d.comparisonFactors || [],
    optionScores: d.optionScores || [],
    options: d.options || [],
  }));
}

/**
 * Fetch a decision by ID from backend.
 */
export async function fetchDecisionById(id, token) {
  const d = await request(`/api/decisions/${id}`, { token });
  return {
    id: d.id,
    title: d.title,
    description: d.description,
    status: d.status || (d.visibility === 'PRIVATE' ? 'CLOSED' : 'OPEN'),
    categoryId: d.categoryId || null,
    categoryName: d.categoryName || null,
    communityId: d.communityId || null,
    communityName: d.communityName || null,
    createdBy: d.owner ? { id: d.owner.id, name: d.owner.name, email: d.owner.email } : { id: 'usr_unknown', name: 'Unknown' },
    createdAt: d.createdAt || new Date().toISOString(),
    views: d.views || 0,
    reach: d.reach || 0,
    votesCount: d.polls?.[0]?.options?.reduce((s, o) => s + (o.voteCount || 0), 0) || 0,
    poll: d.polls?.[0]
      ? {
          id: d.polls[0].id,
          question: d.polls[0].question || d.title,
          options: d.polls[0].options?.map((o, idx) => ({
            id: o.id || idx + 1,
            optionText: o.label || o.optionText || `Option ${idx + 1}`,
            voteCount: o.voteCount || 0,
          })) || [],
        }
      : null,
    comparisonFactors: d.comparisonFactors || [],
    optionScores: d.optionScores || [],
    options: d.options || [],
  };
}

/**
 * Add an option to an existing decision.
 */
export async function addDecisionOptionApi(decisionId, optionData, token) {
  return await request(`/api/decisions/${decisionId}/options`, {
    method: 'POST',
    body: typeof optionData === 'string' ? { label: optionData } : optionData,
    token,
  });
}

/**
 * Close a decision manually.
 */
export async function closeDecisionApi(decisionId, token) {
  return await request(`/api/decisions/${decisionId}/close`, {
    method: 'PATCH',
    token,
  });
}

/**
 * Create a new decision (with optional embedded poll and MCDA factors).
 */
export async function createDecisionApi(decisionData, token, currentUser) {
  const pollTypeSelected = decisionData.pollType || (decisionData.pollQuestion ? 'SINGLE_CHOICE' : null);
  const backendPayload = {
    title: decisionData.title,
    description: decisionData.description,
    visibility: decisionData.visibility || (decisionData.status === 'CLOSED' ? 'PRIVATE' : 'PUBLIC'),
    status: decisionData.status || 'OPEN',
    categoryId: decisionData.categoryId || null,
    communityId: decisionData.communityId || null,
    pollType: pollTypeSelected,
    pollQuestion: decisionData.pollQuestion || null,
    isAnonymous: Boolean(decisionData.isAnonymous),
    optionLabels: decisionData.pollOptions || [],
    comparisonFactorNames: decisionData.comparisonFactorNames || [],
    optionScores: decisionData.optionScores || [],
  };
  return await request('/api/decisions', {
    method: 'POST',
    body: backendPayload,
    token,
  });
}

/**
 * Update an existing decision.
 */
export async function updateDecisionApi(id, decisionData, token) {
  return await request(`/api/decisions/${id}`, {
    method: 'PUT',
    body: {
      title: decisionData.title,
      description: decisionData.description,
      categoryId: decisionData.categoryId || null,
      status: decisionData.status || 'OPEN',
      visibility: decisionData.visibility || (decisionData.status === 'CLOSED' ? 'PRIVATE' : 'PUBLIC'),
    },
    token,
  });
}

/**
 * Delete a decision by ID.
 */
export async function deleteDecisionApi(id, token) {
  return await request(`/api/decisions/${id}`, {
    method: 'DELETE',
    token,
  });
}

/**
 * Cast a vote on a decision poll (supports Single choice, Multi-choice, Ratings, and Anonymous).
 */
export async function castVoteApi(voteData, token, extraData = {}) {
  // If array of votes (multi-select / multiple ratings)
  if (Array.isArray(voteData.votes) && voteData.votes.length > 0) {
    const results = await Promise.all(
      voteData.votes.map((v) =>
        request('/api/votes', {
          method: 'POST',
          body: {
            pollId: v.pollId || voteData.pollId || voteData.decisionId,
            pollOptionId: v.pollOptionId || v.optionId,
            rating: v.rating || null,
            isAnonymous: Boolean(voteData.isAnonymous || v.isAnonymous),
          },
          token,
        })
      )
    );
    return { success: true, count: results.length };
  }

  // Single vote
  await request('/api/votes', {
    method: 'POST',
    body: {
      pollId: voteData.pollId || voteData.decisionId,
      pollOptionId: voteData.pollOptionId || voteData.optionId,
      rating: voteData.rating || null,
      isAnonymous: Boolean(voteData.isAnonymous),
    },
    token,
  });
  return { success: true };
}

/**
 * Get voting results.
 */
export async function getVoteResultsApi(pollId, token) {
  return await request(`/api/votes/result/${pollId}`, { token });
}

/**
 * Get rating summary for RATING poll type.
 */
export async function getRatingSummaryApi(pollId, token) {
  return await request(`/api/votes/rating-summary/${pollId}`, { token });
}

/**
 * Get My Votes Analysis
 */
export async function getMyVotesAnalysisApi(token) {
  return await request('/api/analysis/my-votes', { token });
}

/**
 * Get Creator Analytics
 */
export async function getCreatorAnalyticsApi(token) {
  return await request('/api/analytics/my-decisions', { token });
}

/**
 * Record Impression
 */
export async function recordImpressionApi(decisionId, type = 'VIEW', token = null) {
  try {
    await request(`/api/decisions/${decisionId}/impressions`, {
      method: 'POST',
      body: { type },
      token,
    });
  } catch (e) {
    // Ignore impression failures
  }
}

/**
 * Get current authenticated user profile.
 */
export async function getCurrentUserApi(token) {
  return await request('/api/users/me', { token });
}

/**
 * User Interests Taxonomy APIs
 */
export async function getUserInterestsApi(token) {
  try {
    const data = await request('/api/users/me/interests', { token });
    return Array.isArray(data) ? data : (data?.interests || []);
  } catch {
    return [];
  }
}

export async function updateUserInterestsApi(categoryIds, token) {
  return await request('/api/users/me/interests', {
    method: 'POST',
    body: { categoryIds },
    token,
  });
}

/**
 * Update user profile (name, bio, avatar)
 */
export async function updateUserProfileApi(userId, profileData, token) {
  return await request(`/api/users/${userId}`, {
    method: 'PUT',
    body: {
      name: profileData.name || profileData.fullName,
      bio: profileData.bio || '',
      avatar: profileData.avatar || '',
    },
    token,
  });
}

/**
 * Saved Decisions / Bookmarks APIs
 */
export async function getSavedDecisionsApi(token) {
  try {
    const data = await request('/api/users/me/saved-decisions', { token });
    const items = Array.isArray(data) ? data : [];
    return items.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      status: d.status || 'OPEN',
      categoryName: d.categoryName || d.category?.name || null,
      communityName: d.communityName || d.community?.name || null,
      votesCount: d.votesCount || (d.polls?.[0]?.options?.reduce((s, o) => s + (o.voteCount || 0), 0)) || 0,
      optionsCount: d.optionsCount || d.options?.length || (d.polls?.[0]?.options?.length) || 0,
      createdAt: d.createdAt || new Date().toISOString(),
      comparisonFactors: d.comparisonFactors || [],
    }));
  } catch {
    return [];
  }
}

export async function saveDecisionApi(decisionId, token) {
  return await request('/api/users/me/saved-decisions', {
    method: 'POST',
    body: { decisionId: Number(decisionId) },
    token,
  });
}

export async function unsaveDecisionApi(decisionId, token) {
  return await request(`/api/users/me/saved-decisions/${decisionId}`, {
    method: 'DELETE',
    token,
  });
}

/**
 * Admin Management APIs
 */
export async function getAllUsersAdminApi(token) {
  const data = await request('/api/users', { token });
  return Array.isArray(data) ? data : [];
}

export async function banUserAdminApi(userId, token) {
  return await request(`/api/admin/users/${userId}/ban`, {
    method: 'POST',
    token,
  });
}

export async function unbanUserAdminApi(userId, token) {
  return await request(`/api/admin/users/${userId}/unban`, {
    method: 'POST',
    token,
  });
}

export async function updateUserRoleAdminApi(userId, role, token) {
  return await request(`/api/admin/users/${userId}/role`, {
    method: 'PUT',
    body: { role },
    token,
  });
}

export async function getAuditLogsAdminApi(token) {
  const data = await request('/api/admin/audit-logs', { token });
  return Array.isArray(data) ? data : [];
}

export async function getAdminSettingsApi(token) {
  const data = await request('/api/admin/settings', { token });
  return Array.isArray(data) ? data : [];
}

export async function updateAdminSettingApi(key, value, description, token) {
  return await request('/api/admin/settings', {
    method: 'PUT',
    body: { key, value, description },
    token,
  });
}

export async function getReportsAdminApi(token) {
  const data = await request('/api/reports', { token });
  return Array.isArray(data) ? data : [];
}

export async function resolveReportAdminApi(reportId, token) {
  return await request(`/api/reports/${reportId}/resolve`, {
    method: 'PUT',
    token,
  });
}

export async function getModerationFlagsApi(token) {
  const data = await request('/api/moderation/flags', { token });
  return Array.isArray(data) ? data : [];
}

export async function resolveModerationFlagApi(flagId, token) {
  return await request(`/api/moderation/flags/${flagId}/resolve`, {
    method: 'PUT',
    token,
  });
}

/**
 * Community API endpoints
 */
export async function getCommunitiesApi(search = '', token = null) {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const data = await request(`/api/communities${query}`, { token });
  return Array.isArray(data) ? data : [];
}

export async function getCommunityByIdApi(id, token = null) {
  return await request(`/api/communities/${id}`, { token });
}

export async function createCommunityApi(communityData, token) {
  return await request('/api/communities', {
    method: 'POST',
    body: communityData,
    token,
  });
}

export async function updateCommunityApi(id, communityData, token) {
  return await request(`/api/communities/${id}`, {
    method: 'PUT',
    body: communityData,
    token,
  });
}

export async function deleteCommunityApi(id, token) {
  return await request(`/api/communities/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function joinCommunityApi(id, token) {
  return await request(`/api/communities/${id}/join`, {
    method: 'POST',
    token,
  });
}

export async function leaveCommunityApi(id, token) {
  return await request(`/api/communities/${id}/leave`, {
    method: 'POST',
    token,
  });
}

export async function getCommunityMembersApi(id, token = null) {
  const data = await request(`/api/communities/${id}/members`, { token });
  return Array.isArray(data) ? data : [];
}

export async function updateCommunityMemberRoleApi(communityId, userId, role, token) {
  return await request(`/api/communities/${communityId}/members/${userId}/role`, {
    method: 'PATCH',
    body: { role },
    token,
  });
}

export async function removeCommunityMemberApi(communityId, userId, token) {
  return await request(`/api/communities/${communityId}/members/${userId}`, {
    method: 'DELETE',
    token,
  });
}

export async function transferOwnershipApi(communityId, newOwnerUserId, token) {
  return await request(`/api/communities/${communityId}/transfer-ownership`, {
    method: 'POST',
    body: { newOwnerUserId },
    token,
  });
}

export async function getCommunityDecisionsApi(communityId, token = null) {
  const data = await request(`/api/communities/${communityId}/decisions`, { token });
  if (Array.isArray(data)) {
    return data.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      status: d.visibility === 'PRIVATE' ? 'CLOSED' : 'OPEN',
      votesCount: d.polls?.[0]?.options?.reduce((s, o) => s + (o.voteCount || 0), 0) || 0,
      optionsCount: d.polls?.[0]?.options?.length || 0,
      createdBy: d.owner ? { id: d.owner.id, name: d.owner.name, email: d.owner.email } : { id: 'usr_unknown', name: 'Unknown' },
      createdAt: d.createdAt || new Date().toISOString(),
      communityId: d.communityId,
      communityName: d.communityName,
      poll: d.polls?.[0]
        ? {
            id: d.polls[0].id,
            question: d.polls[0].question || d.title,
            options: d.polls[0].options?.map((o, idx) => ({
              id: o.id || idx + 1,
              optionText: o.label || o.optionText || `Option ${idx + 1}`,
              voteCount: o.voteCount || 0,
            })) || [],
          }
        : null,
    }));
  }
  return [];
}

/**
 * Category API endpoints
 */
export async function getCategoriesApi(token = null) {
  try {
    const data = await request('/api/categories', { token });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [
      { id: 1, name: 'Career' },
      { id: 2, name: 'Education' },
      { id: 3, name: 'Technology' },
      { id: 4, name: 'Travel' },
      { id: 5, name: 'Finance' },
      { id: 6, name: 'Lifestyle' },
    ];
  }
}

export async function createCategoryApi(name, token = null) {
  return await request('/api/categories', {
    method: 'POST',
    body: { name },
    token,
  });
}

/**
 * Threaded Comment API endpoints
 */
export async function getCommentsByDecisionApi(decisionId, token = null) {
  try {
    const data = await request(`/api/comments/decision/${decisionId}`, { token });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

export async function createCommentApi(commentData, token) {
  return await request('/api/comments', {
    method: 'POST',
    body: commentData,
    token,
  });
}

export async function replyToCommentApi(parentCommentId, commentData, token) {
  return await request(`/api/comments/${parentCommentId}/reply`, {
    method: 'POST',
    body: commentData,
    token,
  });
}

export async function updateCommentApi(commentId, commentData, token) {
  return await request(`/api/comments/${commentId}`, {
    method: 'PUT',
    body: commentData,
    token,
  });
}

export async function deleteCommentApi(commentId, token) {
  return await request(`/api/comments/${commentId}`, {
    method: 'DELETE',
    token,
  });
}

/**
 * Suggestions API endpoints
 */
export async function getSuggestionsApi(decisionId, token = null) {
  try {
    const data = await request(`/api/suggestions/decision/${decisionId}`, { token });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

export async function createSuggestionApi(suggestionData, token) {
  return await request('/api/suggestions', {
    method: 'POST',
    body: {
      decisionId: Number(suggestionData.decisionId),
      content: suggestionData.content,
    },
    token,
  });
}

/**
 * Expert Recommendations API endpoints
 */
export async function getRecommendationsApi(decisionId, token = null) {
  try {
    const data = await request(`/api/recommendations/decision/${decisionId}`, { token });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

export async function createRecommendationApi(recommendationData, token) {
  return await request('/api/recommendations', {
    method: 'POST',
    body: {
      decisionId: Number(recommendationData.decisionId),
      recommendedOptionId: Number(recommendationData.recommendedOptionId),
      justification: recommendationData.justification,
    },
    token,
  });
}

/**
 * Notification API endpoints (Real Backend)
 */
export async function getNotificationsApi(token) {
  try {
    const data = await request('/api/notifications', { token });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

export async function getUnreadNotificationsApi(token) {
  try {
    const data = await request('/api/notifications/unread', { token });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

export async function getUnreadNotificationCountApi(token) {
  try {
    const data = await request('/api/notifications/count', { token });
    return data?.unreadCount || 0;
  } catch (e) {
    return 0;
  }
}

export async function markNotificationAsReadApi(id, token) {
  return await request(`/api/notifications/${id}/read`, {
    method: 'PUT',
    token,
  });
}

export async function markAllNotificationsAsReadApi(token) {
  return await request('/api/notifications/read-all', {
    method: 'PUT',
    token,
  });
}

export async function deleteNotificationApi(id, token) {
  return await request(`/api/notifications/${id}`, {
    method: 'DELETE',
    token,
  });
}

/**
 * Analytics Trends, Categories, and Community API endpoints
 */
export async function getDecisionTrendsApi(token = null) {
  try {
    const data = await request('/api/analytics/trends', { token });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

export async function getPopularCategoriesApi(token = null) {
  try {
    const data = await request('/api/analytics/categories', { token });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

export async function getCommunityAnalyticsApi(communityId, token = null) {
  return await request(`/api/analytics/communities/${communityId}`, { token });
}

export async function exportReportBackendApi(format = 'csv', token) {
  return await request(`/api/analytics/reports/export?format=${encodeURIComponent(format)}`, { token });
}

/**
 * File & Media Attachments API
 */
export async function uploadDecisionFileApi(decisionId, file, token) {
  const formData = new FormData();
  formData.append('file', file);
  return await request(`/api/files/upload/decision/${decisionId}`, {
    method: 'POST',
    body: formData,
    token,
  });
}

export async function uploadCommentFileApi(commentId, file, token) {
  const formData = new FormData();
  formData.append('file', file);
  return await request(`/api/files/upload/comment/${commentId}`, {
    method: 'POST',
    body: formData,
    token,
  });
}

export async function getDecisionFilesApi(decisionId, token = null) {
  try {
    const data = await request(`/api/files/decision/${decisionId}`, { token });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

export async function getCommentFilesApi(commentId, token = null) {
  try {
    const data = await request(`/api/files/comment/${commentId}`, { token });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

export async function deleteAttachmentFileApi(fileId, token) {
  return await request(`/api/files/${fileId}`, {
    method: 'DELETE',
    token,
  });
}

/**
 * Community Invitations API
 */
export async function inviteUserToCommunityApi(communityId, inviteeEmail, token) {
  return await request(`/api/communities/${communityId}/invite`, {
    method: 'POST',
    body: { inviteeEmail },
    token,
  });
}

export async function getPendingCommunityInvitesApi(token) {
  try {
    const data = await request('/api/communities/invites/pending', { token });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

export async function respondToCommunityInviteApi(inviteId, response, token) {
  return await request(`/api/communities/invites/${inviteId}/respond`, {
    method: 'POST',
    body: { response: response.toUpperCase() },
    token,
  });
}

/**
 * User Content Moderation Flagging API
 */
export async function flagContentApi(targetType, targetId, reason, token) {
  return await request('/api/moderation/flag', {
    method: 'POST',
    body: {
      targetType: targetType.toUpperCase(),
      targetId: Number(targetId),
      reason,
    },
    token,
  });
}



