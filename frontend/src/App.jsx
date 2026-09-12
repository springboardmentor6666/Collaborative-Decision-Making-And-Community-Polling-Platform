import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import DatabaseOverview from "./components/DatabaseOverview";
import Dashboard from "./components/Dashboard";
import DecisionList from "./components/DecisionList";
import CreateDecision from "./components/CreateDecision";
import DecisionDetail from "./components/DecisionDetail";
import CommunityList from "./components/CommunityList";
import UserProfile from "./components/UserProfile";
import AnalyticsView from "./components/AnalyticsView";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Hero />
              <About />
              <Services />
              <Contact />
              <Footer />
            </>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={<><Navbar /><Dashboard /><Footer /></>} />
        <Route path="/decisions" element={<><Navbar /><DecisionList /><Footer /></>} />
        <Route path="/decisions/create" element={<><Navbar /><CreateDecision /><Footer /></>} />
        <Route path="/decisions/:id" element={<><Navbar /><DecisionDetail /><Footer /></>} />
        <Route path="/communities" element={<><Navbar /><CommunityList /><Footer /></>} />
        <Route path="/profile" element={<><Navbar /><UserProfile /><Footer /></>} />
        <Route path="/analytics" element={<><Navbar /><AnalyticsView /><Footer /></>} />
        <Route path="/database" element={<><Navbar /><DatabaseOverview /><Footer /></>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
