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
  const headers = {
    'Content-Type': 'application/json',
    ...customConfig.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers,
    credentials: 'include', // Include httpOnly cookies for refresh token if available
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${normalizeEndpoint(endpoint)}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    return await response.json();
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
    name: data.user?.name || 'Demo User',
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
 * Fetch decisions list from backend.
 */
export async function fetchDecisions(token) {
  const data = await request('/api/decisions', { token });
  if (Array.isArray(data)) {
    return data.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      status: d.visibility === 'PRIVATE' ? 'CLOSED' : 'OPEN',
      votesCount: d.polls?.[0]?.options?.reduce((s, o) => s + (o.voteCount || 0), 0) || 0,
      optionsCount: d.polls?.[0]?.options?.length || (d.polls?.[0]?.optionLabels?.length) || 0,
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
    }));
  }
  return [];
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
    status: d.visibility === 'PRIVATE' ? 'CLOSED' : 'OPEN',
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
  };
}

/**
 * Create a new decision (with optional embedded poll).
 */
export async function createDecisionApi(decisionData, token, currentUser) {
  const backendPayload = {
    title: decisionData.title,
    description: decisionData.description,
    visibility: decisionData.status === 'CLOSED' ? 'PRIVATE' : 'PUBLIC',
    pollType: decisionData.pollQuestion ? 'SINGLE_CHOICE' : null,
    pollQuestion: decisionData.pollQuestion || null,
    isAnonymous: false,
    optionLabels: decisionData.pollOptions || [],
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
    body: decisionData,
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
 * Cast a vote on a decision poll.
 */
export async function castVoteApi(voteData, token, extraData = {}) {
  await request('/api/votes', {
    method: 'POST',
    body: { pollId: voteData.pollId || voteData.decisionId, pollOptionId: voteData.optionId },
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
