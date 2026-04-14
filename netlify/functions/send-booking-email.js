exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const booking = JSON.parse(event.body);
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
        from: "Whimsical Intentions <bookings@whimsicalintentions.com>",
        to: "kennie1973@gmail.com",
        subject: `New Booking: ${booking.session_type} — ${booking.name}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px;">
            <h1 style="color: #2D2438; border-bottom: 2px solid #C8A2D4; padding-bottom: 12px;">
              ✦ New Session Booking
            </h1>
            
            <div style="background: #F5EFF8; border-radius: 12px; padding: 24px; margin: 20px 0;">
              <h2 style="color: #C8A2D4; margin: 0 0 16px; font-size: 20px;">${booking.session_type}</h2>
              <p style="margin: 8px 0; color: #2D2438;">
                <strong>Date:</strong> ${booking.date}<br/>
                <strong>Time:</strong> ${booking.time_slot}
              </p>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #2D2438;">Client Details</h3>
              <p style="margin: 8px 0; color: #555;">
                <strong>Name:</strong> ${booking.name}<br/>
                <strong>Email:</strong> <a href="mailto:${booking.email}">${booking.email}</a><br/>
                <strong>Phone:</strong> ${booking.phone || "Not provided"}<br/>
                <strong>Notes:</strong> ${booking.notes || "None"}
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #E8D5F0; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">
              This booking was made through whimsicalintentions.com. 
              Log into the admin panel to manage bookings.
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
