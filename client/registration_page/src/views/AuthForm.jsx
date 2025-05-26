// src/views/AuthForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleLogin, handleSignup } from "../models/authModel";
import '../css/AuthForm.css';

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userName, setUserName] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const toggleForm = () => setIsLogin(!isLogin);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            handleLogin(email, password, navigate, setError);
        } else {
            handleSignup(userName, email, password, navigate, setMessage, setError); // Fixed the order of params here
        }
    };
    

    return ( 
        <div className="gradient-background">
             <button
            className="auth-btn-back"
            type="button"
            onClick={() => navigate("/home")}
          >
            Back
          </button>
        <div className="auth-container">
            <div className="auth-box">
                <h2 className="auth-title">{isLogin ? "Login" : "Signup"} Form</h2>

                <div className="auth-toggle">
                    <button onClick={() => setIsLogin(true)} className={isLogin ? "active" : ""}>Login</button>
                    <button onClick={() => setIsLogin(false)} className={!isLogin ? "active" : ""}>Signup</button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <input type="text" placeholder="Full Name" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                    )}

                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                    {error && <p className="error-message">{error}</p>}
                    {message && <p className="success-message">{message}</p>}

                    <button className="auth-button" type="submit">{isLogin ? "Login" : "Signup"}</button>
                </form>

                <p className="auth-footer">
                    {isLogin ? "Not a member?" : "Already have an account?"}{" "}
                    <span onClick={toggleForm} className="auth-toggle-link">
                        {isLogin ? "Signup now" : "Login here"}
                    </span>
                </p>
            </div>
        </div>
        </div>
    );
};

export default AuthForm;

