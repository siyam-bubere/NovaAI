import nodemailer from "nodemailer";

const sendVerificationEmail = async (email, code) => {
    try {
        const smtpPort = parseInt(process.env.SMTP_PORT || "587");
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.ethereal.email",
            port: smtpPort,
            secure: smtpPort === 465, // true for 465, false for 587
            auth: {
                user: process.env.SMTP_USER || null,
                pass: process.env.SMTP_PASS || null
            }
        });

        // Log to console for debugging/testing fallback
        console.log(`\n=========================================`);
        console.log(`VERIFICATION CODE FOR ${email}: ${code}`);
        console.log(`=========================================\n`);

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            const mailOptions = {
                from: `"NovaAI Support" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "Verify your NovaAI Account",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #aa3bff; text-align: center;">NovaAI Email Verification</h2>
                        <p>Thank you for registering with NovaAI! Please use the following 6-digit verification code to complete your registration:</p>
                        <div style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 30px 0; color: #aa3bff; background-color: #f3f4f6; padding: 15px; border-radius: 5px;">
                            ${code}
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);
            console.log(`Sent verification email to ${email}`);
        }
    } catch (err) {
        console.error("Error sending verification email:", err);
    }
};

export default sendVerificationEmail;
