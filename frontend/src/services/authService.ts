import { authApi } from "../api/authApi";

export const authService = {
  login: async (usernameOrEmail: string, password: string): Promise<any> => {
    try {
      const response = await authApi.login({ usernameOrEmail, password });
      
      const { accessToken, user } = response.data.data;
      
      if (accessToken) {
        localStorage.setItem("decisionhub_token", accessToken);
      }
      if (user) {
        localStorage.setItem("decisionhub_user", JSON.stringify(user));
      }
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (fullName: string, username: string, email: string, password: string): Promise<any> => {
    try {
      const response = await authApi.register({ fullName, username, email, password });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      try {
        await authApi.logout();
      } catch (err) {
        console.warn("Backend logout failed, proceeding with local logout");
      }
    } finally {
      localStorage.removeItem("decisionhub_token");
      localStorage.removeItem("decisionhub_user");
    }
  },

  getErrorMessage: (error: any) => {
    if (!error.response) return "Network failure or server is unreachable. Please check your connection.";
    const status = error.response.status;
    const backendMessage = error.response.data?.message;

    // Filter out raw SQL or statement errors if any ever leaked
    if (backendMessage && 
        !backendMessage.includes("could not execute statement") && 
        !backendMessage.includes("insert into") && 
        !backendMessage.includes("SQL [") &&
        !backendMessage.includes("returning user_id")) {
      return backendMessage;
    }

    if (error.response.data?.validationErrors) {
      const firstVal = Object.values(error.response.data.validationErrors)[0];
      if (typeof firstVal === 'string') return firstVal;
    }

    switch (status) {
      case 400: return "Invalid input. Please check your entries.";
      case 401: return "Invalid email or password.";
      case 403: return "Access denied.";
      case 404: return "User not found.";
      case 409: return "An account with this email or username already exists. Please sign in or use different details.";
      case 500: return "An unexpected server error occurred. Please try again.";
      default: return "An unexpected error occurred. Please try again.";
    }
  }
};
