import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {

  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async () => {

    setMessage("");

    try {

      const response = await fetch("http://localhost:8080/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
      });

      const result = await response.json();

      if (result.success) {

        setIsError(false);
        setMessage(result.message);

        localStorage.setItem("token", result.token);
        localStorage.setItem("role", result.role);
        localStorage.setItem("userEmail", loginData.email);

        setTimeout(() => {
          navigate("/home");
        }, 1000);

      } else {

        setIsError(true);
        setMessage(result.message);

      }

    } catch (error) {

      setIsError(true);
      setMessage("Server Error");

    }

  };
  return (
    <>
      <style>{`
      *{
        margin:0;
        padding:0;
        box-sizing:border-box;
        font-family:Arial;
      }

      body{
        background:linear-gradient(135deg,#2563eb,#7c3aed);
      }

      .container{
        height:100vh;
        display:flex;
        justify-content:center;
        align-items:center;
      }

      .card{
        width:360px;
        background:rgba(255,255,255,.15);
        backdrop-filter:blur(12px);
        padding:35px;
        border-radius:18px;
        color:white;
      }

      input{
        width:100%;
        padding:12px;
        margin:10px 0;
        border:none;
        border-radius:8px;
      }

      button{
        width:100%;
        padding:12px;
        margin-top:15px;
        background:#2563eb;
        color:white;
        border:none;
        border-radius:8px;
        cursor:pointer;
      }

      .bottom{
        margin-top:20px;
        text-align:center;
      }

      .bottom a{
        color:white;
      }
      `}</style>

      <div className="container">
        <div className="card">

          <h1>DecisionHub</h1>
          <p>Login to continue</p>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={loginData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={loginData.password}
            onChange={handleChange}
          />

          <button onClick={handleLogin}>
            Login
          </button>

          {message && (
            <p
              style={{
                color: isError ? "#ff4d4d" : "#7CFC00",
                textAlign: "center",
                marginTop: "12px",
                fontWeight: "bold"
              }}
            >
              {message}
            </p>
          )}

          <div className="bottom">
            Don't have an account? <Link to="/signup">Signup</Link>
          </div>

        </div>
      </div>
    </>
  );
}

export default Login;