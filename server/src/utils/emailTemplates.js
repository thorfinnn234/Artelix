export function passwordResetTemplate({ code }) {
  const html = `
  <div style="background:#f6f8fb;padding:24px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e9eef5;">
      <div style="padding:18px 22px;background:#25eb4d;color:#ffffff;">
        <div style="font-size:18px;font-weight:700;">Vendorly</div>
        <div style="font-size:12px;opacity:0.9;margin-top:4px;">Password Reset</div>
      </div>

      <div style="padding:22px;">
        <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Reset your password</h2>
        <p style="margin:0 0 14px;font-size:14px;color:#374151;line-height:1.6;">
          We received a request to reset your Vendorly password. Use the code below to continue.
        </p>

        <div style="margin:18px 0;padding:16px;border-radius:12px;background:#eff6ff;border:1px dashed #93c5fd;text-align:center;">
          <div style="font-size:12px;color:#1d4ed8;margin-bottom:6px;letter-spacing:0.12em;">YOUR RESET CODE</div>
          <div style="font-size:32px;font-weight:800;letter-spacing:0.2em;color:#111827;">${code}</div>
        </div>

        <p style="margin:0 0 14px;font-size:13px;color:#6b7280;line-height:1.6;">
          This code expires in <strong>10 minutes</strong>. If you didn’t request this, ignore this email.
        </p>

        <div style="padding:14px;border-radius:12px;background:#f0fdf4;border:1px solid #86efac;color:#166534;font-size:13px;line-height:1.6;">
          <strong>Security tip:</strong> Never share this code with anyone.
        </div>
      </div>

      <div style="padding:14px 22px;background:#f9fafb;color:#6b7280;font-size:12px;">
        © Vendorly
      </div>
    </div>
  </div>
  `;

  const text = `Vendorly password reset code: ${code} (expires in 10 minutes). If you did not request this, ignore this email.`;

  return { html, text };
}
