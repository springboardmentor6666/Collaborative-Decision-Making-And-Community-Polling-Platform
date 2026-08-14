import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function OAuth2Success() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const token = params.get("token");
        const email = params.get("email");
        const role = params.get("role");

        console.log("Google OAuth token:", token);

        if (token) {
            localStorage.setItem("token", token);
        }

        if (email) {
            localStorage.setItem("userEmail", email);
        }

        if (role) {
            localStorage.setItem("role", role);
        }

        if (token) {
            navigate("/home");
        } else {
            navigate("/login");
        }
    }, [navigate]);

    return <div>Logging you in...</div>;
}

export default OAuth2Success;