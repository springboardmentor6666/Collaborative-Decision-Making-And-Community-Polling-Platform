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
import "./index.css";
import LandingPage from "./pages/LandingPage";
function App() {

  return (

    <BrowserRouter>

      <Routes>

         <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/home" element={<Home />} />
        <Route path="/create-decision" element={<CreateDecision />} />
        <Route path="/decisions" element={<MyDecisions />} />
        <Route path="/polls" element={<Polls />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/profile" element={<Profile />} />



        <Route path="*" element={<NotFound/>}/>
      </Routes>

    </BrowserRouter>

  );

}

export default App;