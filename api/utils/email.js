import nodemailer from 'nodemailer';

export async function sendNewConsultantAlert(consultant, origin = 'http://localhost:5173') {
    const adminEmail = 'prodecideonline@gmail.com';
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    const subject = `🚀 New Consultant Application: ${consultant.fullName}`;
    
    const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
            <h2 style="color: #0052FF; margin-bottom: 20px;">New Expert Registration Request</h2>
            <p>A professional has submitted an application to join the ProDecide consultant network.</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0052FF;">
                <h3 style="margin-top: 0;">Applicant Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold; width: 120px;">Name:</td>
                        <td style="padding: 6px 0;">${consultant.fullName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold;">Email:</td>
                        <td style="padding: 6px 0;">${consultant.email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold;">Phone:</td>
                        <td style="padding: 6px 0;">${consultant.phone || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold;">Location:</td>
                        <td style="padding: 6px 0;">${consultant.location || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold;">Role/Title:</td>
                        <td style="padding: 6px 0;">${consultant.role}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold;">Organization:</td>
                        <td style="padding: 6px 0;">${consultant.organization || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold;">Experience:</td>
                        <td style="padding: 6px 0;">${consultant.experience || 'N/A'} years</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold;">Expertise:</td>
                        <td style="padding: 6px 0;">${Array.isArray(consultant.expertise) ? consultant.expertise.join(', ') : consultant.expertise}</td>
                    </tr>
                </table>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h4 style="margin-bottom: 5px;">Biography:</h4>
                <p style="font-style: italic; color: #475569; background: #f1f5f9; padding: 10px; border-radius: 6px; margin-top: 0;">
                    "${consultant.bio || 'No bio provided'}"
                </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${origin}/admin" style="background-color: #0052FF; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                    Open Admin Dashboard to Review
                </a>
            </div>
            
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 40px; border-t: 1px solid #e2e8f0; padding-top: 15px;">
                This is an automated notification from ProDecide AI Platform.
            </p>
        </div>
    `;

    if (!user || !pass) {
        console.warn("⚠️ SMTP credentials (SMTP_USER/SMTP_PASSWORD) are not set. Logging email contents instead:");
        console.log("-----------------------------------------");
        console.log(`To: ${adminEmail}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body (HTML length): ${htmlBody.length} chars`);
        console.log("-----------------------------------------");
        return { mock: true, sent: true };
    }

    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // true for 465, false for other ports
            auth: {
                user,
                pass,
            },
        });

        const info = await transporter.sendMail({
            from: `"ProDecide Notifications" <${user}>`,
            to: adminEmail,
            subject,
            html: htmlBody,
        });

        console.log("✉️ Notification email sent to admin: %s", info.messageId);
        return { sent: true, messageId: info.messageId };
    } catch (error) {
        console.error("❌ Failed to send SMTP notification email:", error);
        throw error;
    }
}

export async function sendOtpEmail(email, code) {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    const subject = `🔑 Your ProDecide Verification Code: ${code}`;
    
    const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <h2 style="color: #0052FF; margin-top: 0; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-weight: bold; letter-spacing: -0.5px;">ProDecide Verification</h2>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">Please use the following 6-digit code to verify your identity on the ProDecide platform:</p>
            <div style="background-color: #f8fafc; padding: 18px; text-align: center; border-radius: 10px; margin: 25px 0; border: 1px solid #cbd5e1;">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-family: monospace;">${code}</span>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
                This code will remain valid for 10 minutes. If you did not request this verification code, please disregard this email.
            </p>
        </div>
    `;

    if (!user || !pass) {
        console.warn("⚠️ SMTP credentials (SMTP_USER/SMTP_PASSWORD) are not set. Logging OTP code to console:");
        console.log("-----------------------------------------");
        console.log(`To: ${email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Verification Code: ${code}`);
        console.log("-----------------------------------------");
        return { mock: true, sent: true };
    }

    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user,
                pass,
            },
        });

        const info = await transporter.sendMail({
            from: `"ProDecide Security" <${user}>`,
            to: email,
            subject,
            html: htmlBody,
        });

        console.log("✉️ OTP verification email sent successfully to %s", email);
        return { sent: true, messageId: info.messageId };
    } catch (error) {
        console.error("❌ Failed to send SMTP OTP email:", error);
        throw error;
    }
}
