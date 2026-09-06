import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Community from "./components/Community";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Decisions from "./components/Decisions";
import DecisionDetail from "./components/DecisionDetail";
import OptionComparison from "./components/OptionComparison";
import Reports from "./components/Reports";
import Profile from "./components/Profile";
import DatabaseOverview from "./components/DatabaseOverview";
import "./App.css";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Community />
      <Contact />
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/decisions" element={<Decisions />} />
        <Route path="/decisions/:id" element={<DecisionDetail />} />
        <Route path="/option-comparison" element={<OptionComparison />} />
        <Route path="/community" element={<><Navbar /><Community /><Footer /></>} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/database" element={<><Navbar /><DatabaseOverview /><Footer /></>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
