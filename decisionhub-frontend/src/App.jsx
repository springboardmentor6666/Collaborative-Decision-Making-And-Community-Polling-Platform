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

      <Route path="/database" element={<><Navbar /><DatabaseOverview /></>} />

    </Routes>
  </BrowserRouter>
);
}

export default App;
