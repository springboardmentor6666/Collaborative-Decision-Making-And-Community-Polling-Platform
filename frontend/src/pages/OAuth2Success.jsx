import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function OAuth2Success() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const token = params.get("token");
        const email = params.get("email");
        const role = params.get("role");

        console.log("OAuth2 Success URL:", window.location.href);
        console.log("Google OAuth token:", token);
        console.log("Google OAuth email:", email);
        console.log("Google OAuth role:", role);

        // If OAuth data is not present, check whether
        // we already have a logged-in user.
        if (!token) {
            const existingToken = sessionStorage.getItem("token");

            if (existingToken) {
                navigate("/home", { replace: true });
            }

            return;
        }

        // Save Google authentication data
        sessionStorage.setItem("token", token);

        if (email) {
            sessionStorage.setItem("userEmail", email);
        }

        if (role) {
            sessionStorage.setItem("role", role);
        }

        console.log("Google login successful!");
        console.log("Redirecting to Home...");

        navigate("/home", { replace: true });

    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
            <p>Logging you in...</p>
        </div>
    );
}

export default OAuth2Success;