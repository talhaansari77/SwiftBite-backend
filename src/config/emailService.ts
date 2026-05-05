import nodemailer from "nodemailer"

// Create reusable transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `swiftbite://reset-password/${resetToken}`

  const mailOptions = {
    from: `"SwiftBite 🍔" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your SwiftBite Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FF6B35; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🍔 SwiftBite</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #1A1A2E;">Reset Your Password</h2>
          <p style="color: #8D8D8D;">
            You requested to reset your password. Use the token below in the app:
          </p>
          <div style="background-color: #FF6B35; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="color: white; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 4px;">
              ${resetToken}
            </p>
          </div>
          <p style="color: #8D8D8D;">
            This token expires in <strong>15 minutes</strong>.
          </p>
          <p style="color: #8D8D8D;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
        <div style="background-color: #1A1A2E; padding: 16px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="color: #8D8D8D; margin: 0; font-size: 12px;">
            © 2024 SwiftBite. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}