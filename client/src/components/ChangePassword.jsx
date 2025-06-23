import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/modules/auth/AuthForm.css';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate passwords
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to change password');
            }

            toast.success('Password changed successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                theme: "colored"
            });

            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message);
            toast.error(err.message, {
                position: "top-right",
                autoClose: 3000,
                theme: "colored"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 className="auth-title">Change Password</h2>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="password-input-container">
                        <input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="password-toggle"
                        >
                            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <div className="password-input-container">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="password-toggle"
                        >
                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <div className="password-input-container">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="password-toggle"
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button
                        className="auth-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Changing Password..." : "Change Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword; 