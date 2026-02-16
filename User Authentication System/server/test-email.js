import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendTestEmail = async () => {
    try {
        console.log(`Attempting to send email with user: ${process.env.SMTP_USER}`);
        const info = await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: process.env.SENDER_EMAIL, // Send to self for testing
            subject: 'Test Email from Debug Script',
            text: 'If you receive this, SMTP is working correctly!'
        });
        console.log('✅ Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
};

sendTestEmail();
