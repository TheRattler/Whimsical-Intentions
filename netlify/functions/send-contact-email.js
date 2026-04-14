exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { name, email, message } = JSON.parse(event.body);
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      return { statusCode: 500, body: "Resend API key not configured" };
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Whimsical Intentions <contact@whimsicalintentions.com>",
        to: "kennie1973@gmail.com",
        subject: `New Message from ${name}`,
        reply_to: email,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px;">
            <h1 style="color: #2D2438; border-bottom: 2px solid #C8A2D4; padding-bottom: 12px;">
              ✦ New Contact Message
            </h1>
            
            <div style="background: #F5EFF8; border-radius: 12px; padding: 24px; margin: 20px 0;">
              <p style="margin: 8px 0; color: #2D2438;">
                <strong>From:</strong> ${name}<br/>
                <strong>Email:</strong> <a href="mailto:${email}">${email}</a>
              </p>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #2D2438;">Message</h3>
              <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>

            <hr style="border: none; border-top: 1px solid #E8D5F0; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">
              This message was sent through the contact form on whimsicalintentions.com. 
              You can reply directly to this email to respond to ${name}.
            </p>
          </div>
        `,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } else {
      console.error("Resend error:", result);
      return { statusCode: 500, body: JSON.stringify(result) };
    }
  } catch (error) {
    console.error("Function error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
