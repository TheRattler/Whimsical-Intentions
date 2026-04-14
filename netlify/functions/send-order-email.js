exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const order = JSON.parse(event.body);
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      return { statusCode: 500, body: "Resend API key not configured" };
    }

    const orderDate = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

    // Email 1: Notification to Kendra
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Whimsical Intentions <orders@whimsicalintentions.com>",
        to: "kennie1973@gmail.com",
        subject: `New Order: ${order.productName} — ${order.customerName}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px;">
            <h1 style="color: #2D2438; border-bottom: 2px solid #C8A2D4; padding-bottom: 12px;">
              ✦ New Order Received
            </h1>

            <div style="background: #F5EFF8; border-radius: 12px; padding: 24px; margin: 20px 0;">
              <h2 style="color: #C8A2D4; margin: 0 0 8px; font-size: 20px;">${order.productName}</h2>
              <p style="color: #555; margin: 0; font-size: 14px;">${order.productCategory}</p>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #2D2438; margin-bottom: 12px;">Order Summary</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr style="border-bottom: 1px solid #E8D5F0;">
                  <td style="padding: 8px 0; color: #555;">Subtotal</td>
                  <td style="padding: 8px 0; text-align: right; color: #2D2438; font-weight: bold;">$${order.subtotal}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E8D5F0;">
                  <td style="padding: 8px 0; color: #555;">Tax (${order.taxRate}%)</td>
                  <td style="padding: 8px 0; text-align: right; color: #2D2438;">$${order.tax}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E8D5F0;">
                  <td style="padding: 8px 0; color: #555;">Shipping</td>
                  <td style="padding: 8px 0; text-align: right; color: #2D2438;">$${order.shipping}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #2D2438; font-weight: bold; font-size: 16px;">Total</td>
                  <td style="padding: 12px 0; text-align: right; color: #C8A2D4; font-weight: bold; font-size: 18px;">$${order.total}</td>
                </tr>
              </table>
              <p style="margin-top: 8px; font-size: 13px; color: #888;">Payment via Venmo</p>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #2D2438; margin-bottom: 12px;">Customer Details</h3>
              <p style="margin: 4px 0; color: #555; font-size: 14px;">
                <strong>Name:</strong> ${order.customerName}<br/>
                <strong>Email:</strong> <a href="mailto:${order.customerEmail}">${order.customerEmail}</a><br/>
                <strong>Phone:</strong> ${order.customerPhone || "Not provided"}
              </p>
            </div>

            <div style="background: #FFF8F3; border: 2px dashed #C8A2D4; border-radius: 12px; padding: 24px; margin: 20px 0;">
              <h3 style="color: #2D2438; margin: 0 0 12px; font-size: 16px;">📦 Ship To:</h3>
              <p style="margin: 0; color: #2D2438; font-size: 16px; line-height: 1.6; font-weight: 500;">
                ${order.customerName}<br/>
                ${order.address}<br/>
                ${order.city}, ${order.state} ${order.zip}
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #E8D5F0; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">
              Order placed on whimsicalintentions.com on ${orderDate}.
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
        from: "Whimsical Intentions <orders@whimsicalintentions.com>",
        to: order.customerEmail,
        reply_to: "kennie1973@gmail.com",
        subject: `Order Confirmed — ${order.productName} ✦`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px;">
            <h1 style="color: #2D2438; border-bottom: 2px solid #C8A2D4; padding-bottom: 12px;">
              ✦ Order Confirmed!
            </h1>

            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Hi ${order.customerName}! Thank you for your order. Kendra is preparing your one-of-a-kind piece with love and care.
            </p>

            <div style="background: #F5EFF8; border-radius: 12px; padding: 24px; margin: 20px 0;">
              <h2 style="color: #C8A2D4; margin: 0 0 8px; font-size: 22px;">${order.productName}</h2>
              <p style="color: #555; margin: 0; font-size: 14px;">${order.productCategory}</p>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #2D2438; margin-bottom: 12px;">Your Order Summary</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr style="border-bottom: 1px solid #E8D5F0;">
                  <td style="padding: 8px 0; color: #555;">Subtotal</td>
                  <td style="padding: 8px 0; text-align: right; color: #2D2438; font-weight: bold;">$${order.subtotal}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E8D5F0;">
                  <td style="padding: 8px 0; color: #555;">Tax (${order.taxRate}%)</td>
                  <td style="padding: 8px 0; text-align: right; color: #2D2438;">$${order.tax}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E8D5F0;">
                  <td style="padding: 8px 0; color: #555;">Shipping</td>
                  <td style="padding: 8px 0; text-align: right; color: #2D2438;">$${order.shipping}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #2D2438; font-weight: bold; font-size: 16px;">Total</td>
                  <td style="padding: 12px 0; text-align: right; color: #C8A2D4; font-weight: bold; font-size: 18px;">$${order.total}</td>
                </tr>
              </table>
            </div>

            <div style="background: #FFF8F3; border-radius: 12px; padding: 24px; margin: 20px 0;">
              <h3 style="color: #2D2438; margin: 0 0 12px; font-size: 16px;">📦 Shipping To:</h3>
              <p style="margin: 0; color: #2D2438; font-size: 15px; line-height: 1.6;">
                ${order.customerName}<br/>
                ${order.address}<br/>
                ${order.city}, ${order.state} ${order.zip}
              </p>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #2D2438;">What's Next?</h3>
              <p style="color: #555; font-size: 14px; line-height: 1.6;">
                Your item will be carefully packaged and shipped within 3–5 business days. 
                If you have any questions about your order, simply reply to this email.
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
