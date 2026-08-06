import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Backend Integration Later
    alert("Registration Successful!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-300 flex items-center justify-center">

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-6xl w-full grid md:grid-cols-2">

        {/* Left Side */}

        <div className="bg-blue-600 text-white p-10 flex flex-col justify-center">

          <h1 className="text-4xl font-bold">
            Join DecisionHub
          </h1>

          <p className="mt-6 text-lg">
            Create your account and collaborate with your team,
            participate in discussions, polls, and make
            smarter decisions.
          </p>

          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
            alt="Register"
            className="w-64 mt-10 mx-auto"
          />

        </div>

        {/* Right Side */}

        <div className="p-10">

          <h2 className="text-3xl font-bold text-center text-blue-600">
            Create Account
          </h2>

          <p className="text-center text-gray-500 mt-2">
            Register to continue
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 mt-8"
          >

            {/* Name */}

            <div>

              <label className="font-medium">
                Full Name
              </label>

              <div className="flex items-center border rounded-lg mt-2 px-3">

                <User size={20} className="text-gray-400" />

                <input
                  type="text"
                  placeholder="Enter Full Name"
                  className="w-full p-3 outline-none"
                  required
                />

              </div>

            </div>

            {/* Email */}

            <div>

              <label className="font-medium">
                Email
              </label>

              <div className="flex items-center border rounded-lg mt-2 px-3">

                <Mail size={20} className="text-gray-400" />

                <input
                  type="email"
                  placeholder="Enter Email"
                  className="w-full p-3 outline-none"
                  required
                />

              </div>

            </div>

            {/* Role */}

            <div>

              <label className="font-medium">
                Select Role
              </label>

              <div className="flex items-center border rounded-lg mt-2 px-3">

                <UserCheck size={20} className="text-gray-400" />

                <select
                  className="w-full p-3 outline-none"
                  required
                >
                  <option value="">Choose Role</option>
                  <option>Admin</option>
                  <option>Faculty</option>
                  <option>Student</option>
                  <option>Team Member</option>
                </select>

              </div>

            </div>

            {/* Password */}

            <div>

              <label className="font-medium">
                Password
              </label>

              <div className="flex items-center border rounded-lg mt-2 px-3">

                <Lock size={20} className="text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  className="w-full p-3 outline-none"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

            </div>

            {/* Confirm Password */}

            <div>

              <label className="font-medium">
                Confirm Password
              </label>

              <div className="flex items-center border rounded-lg mt-2 px-3">

                <Lock size={20} className="text-gray-400" />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full p-3 outline-none"
                  required
                />

              </div>

            </div>

            {/* Register Button */}

            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Register
            </button>

          </form>

          <p className="text-center mt-6">

            Already have an account?

            <Link
              to="/login"
              className="text-blue-600 font-semibold ml-2"
            >
              Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
};

export default Register;