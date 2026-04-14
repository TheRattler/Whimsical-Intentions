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

    const isPaid = booking.payment_status === "paid";
    const venmoLink = `https://venmo.com/Whimsical_Intentions?txn=pay&amount=${booking.price || 0}&note=${encodeURIComponent(booking.session_type + " - " + booking.date + " at " + booking.time_slot)}`;

    // Email 1: Notification to Kendra
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Whimsical Intentions <bookings@whimsicalintentions.com>",
        to: "kennie1973@gmail.com",
        subject: `New Booking: ${booking.session_type} — ${booking.name} (${isPaid ? "PAID" : "NOT PAID"})`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px;">
            <h1 style="color: #2D2438; border-bottom: 2px solid #C8A2D4; padding-bottom: 12px;">
              ✦ New Session Booking
            </h1>
            
            <div style="background: #F5EFF8; border-radius: 12px; padding: 24px; margin: 20px 0;">
              <h2 style="color: #C8A2D4; margin: 0 0 8px; font-size: 20px;">${booking.session_type}</h2>
              <p style="margin: 8px 0; color: #2D2438;">
                <strong>Date:</strong> ${booking.date}<br/>
                <strong>Time:</strong> ${booking.time_slot}<br/>
                <strong>Price:</strong> $${booking.price || "N/A"}
              </p>
              <p style="margin: 12px 0 0; padding: 8px 16px; border-radius: 50px; display: inline-block; font-size: 14px; font-weight: bold; ${isPaid ? 'background: #d4edda; color: #155724;' : 'background: #fff3cd; color: #856404;'}">
                ${isPaid ? "✓ PAID via Venmo" : "⏳ NOT YET PAID — Pay at session"}
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
            </p>
          </div>
        `,
      }),
    });

    // Email 2: Confirmation to customer
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Whimsical Intentions <bookings@whimsicalintentions.com>",
        to: booking.email,
        reply_to: "kennie1973@gmail.com",
        subject: `Your Booking is Confirmed — ${booking.session_type}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px;">
            <h1 style="color: #2D2438; border-bottom: 2px solid #C8A2D4; padding-bottom: 12px;">
              ✦ Booking Confirmed!
            </h1>

            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Hi ${booking.name}! Your singing bowl session has been booked. Here are your details:
            </p>
            
            <div style="background: #F5EFF8; border-radius: 12px; padding: 24px; margin: 20px 0;">
              <h2 style="color: #C8A2D4; margin: 0 0 12px; font-size: 22px;">${booking.session_type}</h2>
              <p style="margin: 0; color: #2D2438; font-size: 16px; line-height: 1.8;">
                📅 <strong>${booking.date}</strong><br/>
                🕐 <strong>${booking.time_slot}</strong><br/>
                💰 <strong>$${booking.price || "N/A"}</strong>
              </p>
            </div>

            <div style="background: ${isPaid ? '#d4edda' : '#fff3cd'}; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: ${isPaid ? '#155724' : '#856404'};">
                ${isPaid ? "✓ Payment Received — Thank you!" : "Payment Due at Session"}
              </p>
              ${!isPaid ? `
                <p style="margin: 12px 0 0; color: #856404; font-size: 14px;">
                  Want to pay ahead of time? Use the link below:
                </p>
                <a href="${venmoLink}" style="display: inline-block; margin-top: 12px; padding: 12px 32px; background: #008CFF; color: white; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: bold;">
                  Pay Now with Venmo
                </a>
              ` : ''}
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #2D2438;">What to Expect</h3>
              <p style="color: #555; font-size: 14px; line-height: 1.6;">
                Wear comfortable clothing and arrive with an open mind. Avoid heavy meals before your session. 
                If you need to reschedule or have questions, simply reply to this email.
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #E8D5F0; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              Whimsical Intentions — Handcrafted magic and healing vibrations ✦<br/>
              <a href="https://whimsicalintentions.com" style="color: #C8A2D4;">whimsicalintentions.com</a>
            </p>
          </div>
        `,
      }),
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error("Function error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
