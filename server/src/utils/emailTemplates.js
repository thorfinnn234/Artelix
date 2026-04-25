export function passwordResetTemplate({ code }) {
  const html = `
  <div style="background:#f5f7f5;padding:40px 16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;">

      <!-- Logo -->
      <div style="text-align:center;margin-bottom:28px;">
        <div style="display:inline-block;background:#1e7a40;border-radius:12px;padding:10px 20px;">
          <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">Vendorly</span>
        </div>
      </div>

      <!-- Card -->
      <div style="background:#ffffff;border-radius:16px;padding:36px;border:1px solid #e2e8e2;">

        <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0f1a10;">
          Your one-time reset code:
        </h2>

        <p style="margin:0 0 24px;font-size:14px;color:#4a6b4e;line-height:1.7;">
          Use the code below to reset your Vendorly password. 
          It expires in <strong>10 minutes</strong>.
        </p>

        <!-- Code -->
        <div style="background:#f0fdf4;border:1.5px solid #c8e6c9;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
          <div style="font-size:42px;font-weight:900;letter-spacing:0.4em;color:#0f1a10;font-family:'Courier New',Courier,monospace;text-indent:0.4em;">
            ${code}
          </div>
        </div>

        <p style="margin:0;font-size:13px;color:#9db8a0;line-height:1.7;">
          This code expires after 10 minutes. If you did not request 
          this, please ignore this email — your account remains secure.
        </p>

      </div>

      <!-- Footer -->
      <div style="text-align:center;margin-top:24px;">
        <p style="margin:0;font-size:11px;color:#9db8a0;">
          © ${new Date().getFullYear()} Vendorly. All rights reserved.
        </p>
        <p style="margin:4px 0 0;font-size:11px;color:#c8d8c8;">
          This message was sent from Vendorly, Lagos, Nigeria.
        </p>
      </div>

    </div>
  </div>
  `;

  const text = `
Vendorly — Password Reset

Your one-time reset code: ${code}

This code expires in 10 minutes.
If you did not request this, ignore this email.

© ${new Date().getFullYear()} Vendorly
  `.trim();

  return { html, text };
}