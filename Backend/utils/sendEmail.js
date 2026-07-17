
const sendVerificationEmail = async (email, code) => {
    try {
        // Log to console for debugging/testing fallback
        console.log(`\n=========================================`);
        console.log(`VERIFICATION CODE FOR ${email}: ${code}`);
        console.log(`=========================================\n`);

        if (process.env.RESEND_API_KEY) {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: "NovaAI <onboarding@resend.dev>",
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
                })
            });

            if (response.ok) {
                console.log(`Sent verification email to ${email} via Resend API successfully.`);
            } else {
                const errData = await response.json();
                console.error("Resend API Error:", errData);
            }
        } else {
            console.log("RESEND_API_KEY not configured. Running in developer fallback mode.");
        }
    } catch (err) {
        console.error("Error sending verification email via Resend:", err);
    }
};

export default sendVerificationEmail;
