interface ResetPasswordTemplateProps {
  name: string;
  resetLink: string;
}

export const resetPasswordTemplate = ({
  name,
  resetLink,
}: ResetPasswordTemplateProps): string => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f6f8;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
        }
        .btn {
          display: inline-block;
          padding: 12px 20px;
          background: #1677ff;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #888;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Hello ${name},</h2>
        <p>You requested to reset your password.</p>
        <p>Click the button below to continue:</p>

        <p style="text-align:center;">
          <a href="${resetLink}" class="btn">Reset Password</a>
        </p>

        <p>If you did not request this, please ignore this email.</p>

        <div class="footer">
          <p>This link will expire in 15 minutes.</p>
          <p>© ${new Date().getFullYear()} Your Company</p>
        </div>
      </div>
    </body>
  </html>
  `;
};
