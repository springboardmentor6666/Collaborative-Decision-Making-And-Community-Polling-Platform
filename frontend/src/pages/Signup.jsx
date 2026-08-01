import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Signup() {

  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async () => {

    setMessage("");

    if (user.password !== confirmPassword) {

      setIsError(true);
      setMessage("Passwords do not match");

      return;
    }

    try {

      const response = await fetch("http://localhost:8080/users/signup", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(user)

      });

      const result = await response.json();

      if (result.success) {

        setIsError(false);
        setMessage(result.message);

        setTimeout(() => {
          navigate("/");
        }, 1000);

      } else {

        setIsError(true);
        setMessage(result.message);

      }

    } catch (err) {

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
        width:380px;
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
        background:#22c55e;
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
          <p>Create your account</p>

          <input
            type="text"
            name="name"
            placeholder="Name"
            value={user.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={user.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={user.password}
            onChange={handleChange}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button onClick={handleSignup}>
            Create Account
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
            Already have an account? <Link to="/">Login</Link>
          </div>

        </div>
      </div>
    </>
  );
}

export default Signup;