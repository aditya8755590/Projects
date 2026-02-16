import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
   host: 'smtp-relay.brevo.com',
   port: 587,
   auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
   }

});
export default transporter;
// 	1.	SMTP (Simple Mail Transfer Protocol) is used by servers to send emails over the internet.
// 	2.	In email verification, SMTP sends a verification link to the user’s email address.
// 	3.	The backend connects to an SMTP server (like Gmail, Outlook, SendGrid).
// 	4.	SMTP requires host, port, username, and password (app password).
//5.	Without SMTP, a backend application cannot send verification emails.