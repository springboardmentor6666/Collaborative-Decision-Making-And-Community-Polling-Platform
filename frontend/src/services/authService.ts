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
    if (!error.response) return "Network failure or server is unreachable.";
    const status = error.response.status;
    const backendMessage = error.response.data?.message;

    if (backendMessage) return backendMessage;

    switch (status) {
      case 400: return "Invalid input.";
      case 401: return "Invalid email or password.";
      case 403: return "Access denied.";
      case 404: return "User not found.";
      case 409: return "Email already exists.";
      case 500: return "Something went wrong on the server.";
      default: return "An unexpected error occurred.";
    }
  }
};
