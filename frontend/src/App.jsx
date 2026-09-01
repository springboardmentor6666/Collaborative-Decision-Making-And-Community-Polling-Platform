import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import CreateDecision from "./pages/CreateDecision";
import MyDecisions from "./pages/MyDecisions";
import Polls from "./pages/Polls";
import Communities from "./pages/Communities";
import AnalyticsPage from "./pages/AnalyticsPage";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import OAuth2Success from "./pages/OAuth2Success";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import LandingPage from "./pages/LandingPage";
import CommunityDetail from "./pages/CommunityDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminDecisions from "./pages/AdminDecisions";
import AdminCommunities from "./pages/AdminCommunities";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminActivity from "./pages/AdminActivity";

function App() {

  return (
    <ThemeProvider>

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/home" element={<Home />} />
        <Route path="/create-decision" element={<CreateDecision />} />
        <Route path="/decisions" element={<MyDecisions />} />
        <Route path="/oauth2/success" element={<OAuth2Success />} />
        <Route path="/polls" element={<Polls />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/communities/:communityId" element={<CommunityDetail />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/create-decision" element={<CreateDecision />} />
        <Route path="/admin/my-decisions" element={<MyDecisions />} />
        <Route path="/admin/polls" element={<Polls />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/decisions" element={<AdminDecisions />} />
        <Route path="/admin/communities" element={<AdminCommunities />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/activity" element={<AdminActivity />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

    </BrowserRouter>
    </ThemeProvider>

  );

}

export default App;