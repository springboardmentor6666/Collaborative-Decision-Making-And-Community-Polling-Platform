import { Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Stats from "./components/Stats";
import Footer from "./components/Footer";
import Community from "./components/Community";
import HowItWorks from "./components/HowItWorks";
import Contact from "./components/Contact";
import Login from "./components/Login";
import OptionComparison from "./components/OptionComparison";

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
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
       <Route path="/option-comparison" element={<OptionComparison />} />
       <Route path="/community"element={<Community />}/>
    </Routes>
  );
}
export default App;