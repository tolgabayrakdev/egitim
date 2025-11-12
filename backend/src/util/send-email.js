import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendEmail(to, subject, html) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Mail içeriğine güvenlik notu ekle
    const enhancedHtml = `
        ${html}
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
        <div style="font-size: 12px; color: #666; text-align: center; padding: 20px;">
            <p style="margin: 5px 0;">
                <strong>🔒 Güvenlik Notu:</strong> Bu e-posta <strong>www.edivora.com</strong> tarafından gönderilmiştir.
            </p>
            <p style="margin: 5px 0; font-size: 11px; color: #999;">
                Bu e-postayı beklemiyorsanız, lütfen dikkate almayın.
            </p>
        </div>
    `;

    const mailOptions = {
        from: {
            name: "Edivora",
            address: process.env.EMAIL_USER,
        },
        replyTo: process.env.EMAIL_USER,
        to,
        subject,
        html: enhancedHtml,
        headers: {
            'X-Entity-Ref-ID': 'edivora',
            'List-Unsubscribe': '<mailto:' + process.env.EMAIL_USER + '>',
        },
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("📩 Email sent:", info.response);
    } catch (error) {
        console.error("❌ Failed to send email:", error);
        throw error;
    }
}