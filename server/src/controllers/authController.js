import jwt from 'jsonwebtoken';
import { getUserByEmail, getUserById, updateUserPassword } from '../models/userModel.js';
import { generateToken, generateHashedPassword } from '../services/authServices.js';

// Refresh token controller
export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    console.log('🔄 Refresh token request received');

    if (!refreshToken) {
        console.log('❌ No refresh token provided');
        return res.status(401).json({ message: 'Refresh token is required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log('✅ Refresh token decoded:', { userId: decoded.userId });
        
        const users = await getUserById(decoded.userId);
        console.log('🔍 Users found:', users ? users.length : 0);

        if (!users || users.length === 0) {
            console.log('❌ User not found for ID:', decoded.userId);
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0]; // Get the first user from the array
        console.log('✅ User found:', { userId: user.user_id, email: user.email });

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = await generateToken(user);
        console.log('✅ New tokens generated successfully');

        res.status(200).json({
            message: 'Token refreshed successfully',
            accessToken: accessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error('❌ Refresh token error:', error);
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
};

// Verify email controller
export const verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
        const users = await getUserById(decoded.userId);

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0]; // Get the first user from the array

        // Update user's email verification status
        await updateUserVerificationStatus(user.id, true);

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        const users = await getUserByEmail(email);
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0]; // Get the first user from the array

        // Generate password reset token
        const resetToken = jwt.sign(
            { userId: user.user_id },
            process.env.PASSWORD_RESET_SECRET,
            { expiresIn: '1h' }
        );

        // TODO: Send email with reset token
        // For now, we'll just return the token
        res.status(200).json({
            message: 'Password reset instructions sent to your email',
            resetToken // Remove this in production
        });
    } catch (error) {
        res.status(500).json({ message: 'Error processing password reset request' });
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.PASSWORD_RESET_SECRET);
        const users = await getUserById(decoded.userId);

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0]; // Get the first user from the array

        // Update user's password
        const hashedPassword = await generateHashedPassword(newPassword);
        await updateUserPassword(user.user_id, hashedPassword);

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired reset token' });
    }
}; 