import React, { useState, } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Navigate } from "react-router-dom"; // Import Navigate and useNavigate

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Added local loading state
  const [showPassword, setShowPassword] = useState(false);
  
  const { user, setUser, loading: authLoading } = useAuth();
  const navigate = useNavigate(); // Initialize navigate hook

  // 1. If user is already logged in (e.g. they refreshed), send them away from login page
  if (user && !authLoading) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "super_admin") return <Navigate to="/super-admin-dashboard" replace />;
    return <Navigate to="/student-dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if(!email || !password) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "http://localhost/sms/backend/controllers/login.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password })
        }
      );

      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error("Invalid JSON:", await res.text());
        alert("Server error: invalid response");
        return;
      }

      if (data.success) {
        // 2. Set the user in global state (includes department_id)
        setUser(data.user);
        toast.success("Login successful!");

        // 3. IMPORTANT: Use 'data.user' here, NOT the 'user' state variable
        // Also use navigate() function, NOT <Navigate /> component
        if (data.user.role === "super_admin") {
          navigate("/super-admin-dashboard");
        } else if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/student-dashboard");
        }
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Network error:", err);
      toast.error("Network error: cannot reach server");
    } finally {
      setLoading(false);
    }
  };
  return (

    <div className="flex items-center justify-center bg-white h-screen">
      {/* Login Card */}
      <div className="relative w-full max-w-md mx-4 mt-16">
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8 md:p-10 transition-all duration-300 hover:shadow-purple-500/20">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-center text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Student Management System
            </h2>
            <p className="text-center text-black text-sm mb-8">
              Sign in to access your dashboard
            </p>
                 <ToastContainer  position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light" />
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div className="relative">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-700" />
                  </div>
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-violet-600 rounded-lg bg-gray-100 text-violet-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-700" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-violet-600 rounded-lg bg-gray-100 text-violet-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                  {/* Show/Hide Password Icon */}
                  <div  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-700 ">
                    {showPassword ? (
                      <EyeSlashIcon
                        className="h-5 w-5"
                        onClick={() => {
                          setShowPassword(false);
                        }}
                      />
                    ) : (
                      <EyeIcon className="h-5 w-5" 
                      onClick={()=>{setShowPassword(true)}}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <a
                  href="#"
                  className="text-sm text-purple-400 hover:text-purple-300 hover:underline transition"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}