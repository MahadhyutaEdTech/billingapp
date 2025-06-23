// src/views/AuthForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleLogin, handleSignup } from "../models/authModel";
import { toast, ToastContainer } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userName, setUserName] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [authCode, setAuthCode] = useState("");
    const navigate = useNavigate();

    const clearForm = () => {
        setPassword("");
        setUserName("");
        setEmail("");
        setError("");
        setMessage("");
        setShowPassword(false);
        setAuthCode("");
    };

    const toggleForm = () => {
        clearForm();
        toast.dismiss();
        setTimeout(() => {
            setIsLogin(!isLogin);
        }, 0);
    };

    const verifyAuthData = () => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('authToken');
        return userId && token;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            if (isLogin) {
                const success = await handleLogin(email, password, navigate, setError, setLoading);
                if (!success || !verifyAuthData()) {
                    throw new Error('Login failed or missing auth data');
                }
                toast.success('🎉 Successfully logged in!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    theme: "colored"
                });
            } else {
                const success = await handleSignup(userName, email, password, authCode, navigate, setMessage, setError);
                if (success) {
                    clearForm();
                    setIsLogin(true);
                    toast.success('✨ Account created successfully! Please login.', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        theme: "colored"
                    });
                }
            }
        } catch (err) {
            toast.error(err?.message || "Authentication failed", {
                position: "top-right",
                autoClose: 3000,
                theme: "colored"
            });
            setError(err?.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-pink-100">
            <ToastContainer />
            <button
                className="absolute top-6 left-6 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
                type="button"
                onClick={() => navigate("/home")}
            >
                Back
            </button>
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-6 text-blue-700">{isLogin ? "Login" : "Signup"} Form</h2>
                <div className="flex w-full mb-6 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 gap-2">
                    <button
                        onClick={toggleForm}
                        className={`flex-1 py-2 font-semibold transition ${isLogin ? "bg-blue-500 text-white" : "text-blue-700 hover:bg-blue-100"}`}
                        type="button"
                        disabled={isLogin}
                    >
                        Login
                    </button>
                    <button
                        onClick={toggleForm}
                        className={`flex-1 py-2 font-semibold transition ${!isLogin ? "bg-blue-500 text-white" : "text-blue-700 hover:bg-blue-100"}`}
                        type="button"
                        disabled={!isLogin}
                    >
                        Signup
                    </button>
                </div>
                <form className="w-full" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                required
                                className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <input
                                type="text"
                                placeholder="Authentication Code"
                                value={authCode}
                                onChange={e => setAuthCode(e.target.value)}
                                autoComplete="off"
                                required
                                className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </>
                    )}
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <div className="relative mb-4">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 bg-transparent border-none shadow-none p-0 m-0 focus:outline-none hover:bg-transparent active:bg-transparent"
                            tabIndex={-1}
                        >
                            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                    </div>
                    {error && <p className="text-red-600 text-sm mb-2 text-center">{error}</p>}
                    {message && <p className="text-green-600 text-sm mb-2 text-center">{message}</p>}
                    <button
                        className="w-full py-3 mt-2 bg-blue-500 text-white font-bold rounded-lg shadow hover:bg-blue-600 transition disabled:opacity-60"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : isLogin ? "Login" : "Signup"}
                    </button>
                </form>
                <p className="mt-6 text-gray-600 text-sm">
                    {isLogin ? "Not a member?" : "Already have an account?"} {" "}
                    <span
                        onClick={toggleForm}
                        className="text-blue-500 font-semibold cursor-pointer hover:underline"
                    >
                        {isLogin ? "Signup now" : "Login here"}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default AuthForm;

