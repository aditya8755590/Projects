export const verificationEmailTemplate = (otp, name) => {
    return {
        subject: "Verify Your Email Address",
        text: `Hello ${name}, your OTP is ${otp}`, // Fallback for basic email clients
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; color: #333;">
            <div style="text-align: center; border-bottom: 1px solid #eeeeee; padding-bottom: 20px;">
                <h2 style="color: #4A90E2; margin: 0;">The Auth Project</h2>
            </div>
            <div style="padding: 20px; line-height: 1.6;">
                <p>Hello <strong>${name}</strong>,</p>
                <p>Thank you for registering! To complete your sign-up, please use the One-Time Password (OTP) below to verify your email address:</p>
                <div style="background-color: #f4f7ff; border: 1px dashed #4A90E2; border-radius: 6px; padding: 15px; text-align: center; margin: 25px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4A90E2;">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #666;">This code is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
            </div>
            <div style="text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eeeeee; padding-top: 20px;">
                <p>&copy; 2026 The Auth Project Team. All rights reserved.</p>
            </div>
        </div>
        `
    };
};

export const passwordResetTemplate = (resetLink, name) => {
    return {
        subject: "Reset Your Password",
        text: `Hello ${name},\n\nWe received a request to reset your password. Click the link below to choose a new one:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
        html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                <h2 style="color: #333; margin: 0;">Secure Password Reset</h2>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
                <p style="font-size: 16px; color: #555;">Hi <strong>${name}</strong>,</p>
                <p style="font-size: 16px; color: #555; line-height: 1.5;">
                    It happens to the best of us. We received a request to reset the password for your account. Click the button below to set a new password:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset My Password</a>
                </div>
                <p style="font-size: 14px; color: #888; border-top: 1px solid #eee; padding-top: 20px;">
                    If the button above doesn't work, copy and paste this link into your browser: <br>
                    <a href="${resetLink}" style="color: #007bff; word-break: break-all;">${resetLink}</a>
                </p>
                <p style="font-size: 13px; color: #999; margin-top: 20px;">
                    If you didn't request this change, you can safely ignore this email. Your password will remain unchanged.
                </p>
            </div>
            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #aaa;">
                Sent with ❤️ from The Auth Project Team
            </div>
        </div>
        `
    };
};