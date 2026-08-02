import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import CreateDecision from "./pages/CreateDecision";
import MyDecisions from "./pages/MyDecisions";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/home" element={<Home />} />
        <Route path="/create-decision" element={<CreateDecision />} />
        <Route path="/decisions" element={<MyDecisions />} />

      </Routes>

    </BrowserRouter>

  );

}

export default App;