/**
 * Utility for converting technical application & API errors into clean,
 * friendly messages without exposing raw status codes, JSON dumps, or stack traces.
 */

export function extractStatusCode(error) {
  if (!error) return null;
  if (typeof error.status === 'number') return error.status;
  if (error.response && typeof error.response.status === 'number') return error.response.status;

  // Check if message matches "status XXX" pattern (e.g., from fetch)
  if (typeof error.message === 'string') {
    const match = error.message.match(/\b(?:status|code)\s*[:=]?\s*(\d{3})\b/i);
    if (match) {
      const code = parseInt(match[1], 10);
      if (!isNaN(code)) return code;
    }
  }

  return null;
}

export function isNetworkError(error) {
  if (!error) return false;
  if (error.name === 'TypeError' && typeof error.message === 'string' && error.message.toLowerCase().includes('fetch')) {
    return true;
  }
  if (typeof error.message === 'string') {
    const msg = error.message.toLowerCase();
    if (
      msg.includes('network error') ||
      msg.includes('failed to fetch') ||
      msg.includes('network request failed') ||
      msg.includes('load failed') ||
      msg.includes('connection refused')
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Maps any error object or string to a friendly { title, message } object.
 * Sanitizes technical details so HTTP status codes and raw stack traces are never shown.
 */
export function getUserFriendlyError(error, customFallback) {
  const defaultTitle = 'Something went wrong';

  if (!error) {
    return {
      title: defaultTitle,
      message: customFallback || 'Something went wrong. Please try again later.',
    };
  }

  // Network / Offline errors
  if (isNetworkError(error)) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
    };
  }

  const statusCode = extractStatusCode(error);

  if (statusCode) {
    switch (statusCode) {
      case 400:
      case 422:
        return {
          title: 'Invalid Request',
          message: 'Please check the information you entered.',
        };
      case 401:
        return {
          title: 'Session Expired',
          message: 'Your session has expired. Please log in again.',
        };
      case 403:
        return {
          title: 'Access Denied',
          message: "You don't have permission to perform this action.",
        };
      case 404:
        return {
          title: 'Not Found',
          message: 'The requested information could not be found.',
        };
      case 409:
        return {
          title: 'Conflict',
          message: 'This action conflicts with an existing record. Please try again.',
        };
      case 429:
        return {
          title: 'Too Many Requests',
          message: 'You have made too many requests. Please wait a moment and try again.',
        };
      case 500:
      case 502:
      case 503:
      case 504:
      default:
        return {
          title: defaultTitle,
          message: customFallback || 'Something went wrong. Please try again later.',
        };
    }
  }

  // If a string or standard error message exists, sanitize it if safe and friendly
  const rawMessage = typeof error === 'string' ? error : error?.message;

  if (typeof rawMessage === 'string' && rawMessage.trim()) {
    const trimmed = rawMessage.trim();
    // If it looks like technical output (e.g. contains status code, JSON, stack trace, or SQL/syntax error)
    const isTechnical =
      /\b\d{3}\b/.test(trimmed) ||
      trimmed.startsWith('{') ||
      trimmed.startsWith('[') ||
      trimmed.toLowerCase().includes('syntaxerror') ||
      trimmed.toLowerCase().includes('typeerror') ||
      trimmed.toLowerCase().includes('uncaught') ||
      trimmed.toLowerCase().includes('internal server error') ||
      trimmed.toLowerCase().includes('sql') ||
      trimmed.toLowerCase().includes('exception');

    if (!isTechnical && trimmed.length < 160) {
      return {
        title: defaultTitle,
        message: trimmed,
      };
    }
  }

  return {
    title: defaultTitle,
    message: customFallback || 'Something went wrong. Please try again.',
  };
}
