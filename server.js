/* ==========================================================================
   Royal Chhab Custom Cakes - Node.js Server & Gmail SMTP Receipt Transporter
   Port: 3000
   ========================================================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

// Configure Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'faheemkhan101992@gmail.com',
    pass: 'hrxk xehs gjtq magh'
  }
});

// Verify Gmail Transporter Connection
transporter.verify((error, success) => {
  if (error) {
    console.log('⚠️ Gmail Transporter connection notice:', error.message);
  } else {
    console.log('✅ Gmail SMTP Transporter ready to send receipts from faheemkhan101992@gmail.com!');
  }
});

// POST Endpoint: Send Order Receipt Email
app.post('/api/send-receipt', async (req, res) => {
  try {
    const {
      id,
      customerName,
      customerPhone,
      deliveryAddress,
      items,
      totalAmount,
      paymentMethod,
      fulfillmentType,
      deliveryFee,
      customerEmail
    } = req.body;

    const recipientEmail = customerEmail && customerEmail.includes('@') ? customerEmail : 'faheemkhan101992@gmail.com';
    const subtotal = (totalAmount || 0) - (deliveryFee || 0);

    const itemsHtml = (items || []).map(item => `
      <tr style="border-bottom: 1px solid #eeeeee;">
        <td style="padding: 12px; font-family: sans-serif; font-size: 14px; color: #333;">
          <strong>${item.name}</strong>
          ${item.details ? `<br><small style="color: #666;">${item.details}</small>` : ''}
          ${item.customText ? `<br><small style="color: #a83250;">Inscription: "${item.customText}"</small>` : ''}
        </td>
        <td style="padding: 12px; font-family: sans-serif; font-size: 14px; text-align: center; color: #333;">${item.quantity}</td>
        <td style="padding: 12px; font-family: sans-serif; font-size: 14px; text-align: right; color: #333;">Rs. ${item.price.toLocaleString()}</td>
        <td style="padding: 12px; font-family: sans-serif; font-size: 14px; text-align: right; font-weight: bold; color: #a83250;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Royal Chhab Invoice #${id}</title>
      </head>
      <body style="font-family: sans-serif; background-color: #fdf8f5; margin: 0; padding: 20px;">
        <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #d4a359; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(168,50,80,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #a83250, #6b1d31); padding: 30px 25px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 26px; letter-spacing: 1px; color: #f59e0b;">👑 Royal Chhab Custom Cakes</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #f8bbd0; text-transform: uppercase; letter-spacing: 2px;">Fresh Bakery &amp; Cake Shop &bull; Chhab, Pakistan</p>
          </div>

          <!-- Body Container -->
          <div style="padding: 30px 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f9ece6; padding-bottom: 15px; margin-bottom: 20px;">
              <div>
                <h2 style="margin: 0; color: #a83250; font-size: 18px;">OFFICIAL ORDER RECEIPT</h2>
                <span style="font-size: 12px; color: #777;">Date: ${new Date().toLocaleString()}</span>
              </div>
              <div style="text-align: right;">
                <span style="background: #f59e0b; color: #000; font-size: 14px; font-weight: bold; padding: 5px 12px; border-radius: 20px;">#${id}</span>
              </div>
            </div>

            <!-- Customer & Fulfillment Summary -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background: #fdf8f5; border-radius: 10px; padding: 15px;">
              <tr>
                <td style="padding: 10px; font-size: 13px; color: #444;" width="50%">
                  <strong style="color: #a83250;">CUSTOMER DETAILS:</strong><br>
                  Name: <strong>${customerName}</strong><br>
                  Phone: ${customerPhone}<br>
                  Email: ${recipientEmail}
                </td>
                <td style="padding: 10px; font-size: 13px; color: #444;" width="50%">
                  <strong style="color: #a83250;">ORDER FULFILLMENT:</strong><br>
                  Type: <strong>${fulfillmentType === 'pickup' ? '🏪 Bakery Store Self-Pickup' : '🚚 Express Home Delivery'}</strong><br>
                  Payment: <strong>${paymentMethod}</strong><br>
                  Location: ${deliveryAddress}
                </td>
              </tr>
            </table>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #a83250; color: #ffffff; text-align: left;">
                  <th style="padding: 10px 12px; font-size: 13px;">Item Description</th>
                  <th style="padding: 10px 12px; font-size: 13px; text-align: center;">Qty</th>
                  <th style="padding: 10px 12px; font-size: 13px; text-align: right;">Price</th>
                  <th style="padding: 10px 12px; font-size: 13px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Total Box -->
            <div style="text-align: right; font-size: 14px; color: #333; margin-top: 20px; border-top: 2px dashed #ddd; padding-top: 15px;">
              Subtotal: Rs. ${subtotal.toLocaleString()}<br>
              Delivery Fee: Rs. ${(deliveryFee || 0).toLocaleString()}<br>
              <h2 style="margin: 8px 0 0 0; color: #a83250; font-size: 22px;">Grand Total: Rs. ${totalAmount.toLocaleString()}</h2>
            </div>

            <!-- Footer Notes -->
            <div style="margin-top: 30px; background: #f9ece6; border-radius: 10px; padding: 15px; text-align: center; font-size: 12px; color: #7d6b70;">
              <strong style="color: #a83250;">Royal Chhab Bakery Kitchen Location:</strong><br>
              Main Road, Near RHC Hospital, Chhab, Punjab, Pakistan<br>
              WhatsApp Support: 0300-ROYAL-CHHAB &bull; Thank you for choosing Royal Chhab!
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: '"Royal Chhab Custom Cakes" <faheemkhan101992@gmail.com>',
      to: recipientEmail,
      subject: `👑 Order Receipt #${id} - Royal Chhab Custom Cakes`,
      html: emailHtml
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email receipt sent for Order #${id} to ${recipientEmail}:`, info.messageId);

    res.json({
      success: true,
      message: `Receipt email sent successfully to ${recipientEmail}!`,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('❌ Failed to send receipt email via Gmail SMTP:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to dispatch email receipt.'
    });
  }
});

// POST Endpoint: Send Order Feedback Follow-up Email
app.post('/api/send-followup', async (req, res) => {
  try {
    const {
      id,
      customerName,
      customerEmail,
      items
    } = req.body;

    const recipientEmail = customerEmail && customerEmail.includes('@') ? customerEmail : 'faheemkhan101992@gmail.com';
    const itemsList = (items || []).map(item => `<li><strong>${item.name}</strong></li>`).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Share Your Feedback - Royal Chhab</title>
      </head>
      <body style="font-family: sans-serif; background-color: #fdf8f5; margin: 0; padding: 20px;">
        <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #d4a359; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(168,50,80,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #a83250, #6b1d31); padding: 30px 25px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 26px; letter-spacing: 1px; color: #f59e0b;">👑 Share Your Experience</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #f8bbd0; text-transform: uppercase; letter-spacing: 2px;">Royal Chhab Custom Cakes</p>
          </div>

          <!-- Body Container -->
          <div style="padding: 30px 25px; line-height: 1.6; color: #333;">
            <p>Dear <strong>${customerName}</strong>,</p>
            <p>We are delighted to inform you that your order <strong>#${id}</strong> has been successfully fulfilled and delivered!</p>
            
            <p>We hope you loved your handcrafted cakes:</p>
            <ul style="padding-left: 20px; color: #a83250;">
              ${itemsList}
            </ul>

            <p>To help us maintain our royal standards of baking and delivery, we would love to hear about your experience. Please take a moment to leave your review and feedback on our storefront!</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/index.html#reviews-section" style="background-color: #a83250; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(168,50,80,0.3);">
                ⭐ Leave Storefront Feedback & Reviews
              </a>
            </div>

            <!-- Footer Notes -->
            <div style="margin-top: 30px; background: #f9ece6; border-radius: 10px; padding: 15px; text-align: center; font-size: 12px; color: #7d6b70;">
              <strong>Royal Chhab Bakery Kitchen</strong><br>
              Main Road, Near RHC Hospital, Chhab, Punjab, Pakistan<br>
              WhatsApp Support: 0300-ROYAL-CHHAB &bull; Thank you for choosing Royal Chhab!
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: '"Royal Chhab Custom Cakes" <faheemkhan101992@gmail.com>',
      to: recipientEmail,
      subject: `👑 How was your cake, ${customerName}? Share your feedback!`,
      html: emailHtml
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Follow-up feedback email sent for Order #${id} to ${recipientEmail}:`, info.messageId);

    res.json({
      success: true,
      message: `Follow-up feedback email sent successfully to ${recipientEmail}!`,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('❌ Failed to send follow-up email via Gmail SMTP:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to dispatch follow-up email.'
    });
  }
});

// POST Endpoint: Send Order Confirmation Email (triggered by Admin Approval)
app.post('/api/send-confirmation', async (req, res) => {
  try {
    const {
      id,
      customerName,
      customerPhone,
      deliveryAddress,
      items,
      totalAmount,
      paymentMethod,
      fulfillmentType,
      deliveryFee,
      customerEmail
    } = req.body;

    const recipientEmail = customerEmail && customerEmail.includes('@') ? customerEmail : 'faheemkhan101992@gmail.com';
    const subtotal = (totalAmount || 0) - (deliveryFee || 0);

    const itemsHtml = (items || []).map(item => `
      <tr style="border-bottom: 1px solid #eeeeee;">
        <td style="padding: 12px; font-family: sans-serif; font-size: 14px; color: #333;">
          <strong>${item.name}</strong>
          ${item.pounds ? `<br><small style="color: #a83250;">⚖️ ${item.pounds} Lb • ${item.layers || 2} Layers • ${item.floors || 1} Floor</small>` : ''}
          ${item.customText ? `<br><small style="color: #a83250;">✍️ Inscription: "${item.customText}"</small>` : ''}
        </td>
        <td style="padding: 12px; font-family: sans-serif; font-size: 14px; text-align: center; color: #333;">${item.quantity}</td>
        <td style="padding: 12px; font-family: sans-serif; font-size: 14px; text-align: right; color: #333;">Rs. ${item.price.toLocaleString()}</td>
        <td style="padding: 12px; font-family: sans-serif; font-size: 14px; text-align: right; font-weight: bold; color: #a83250;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmed! #${id} - Royal Chhab</title>
      </head>
      <body style="font-family: sans-serif; background-color: #fdf8f5; margin: 0; padding: 20px;">
        <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #d4a359; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(168,50,80,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #a83250, #6b1d31); padding: 30px 25px; text-align: center; color: #ffffff;">
            <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px; color: #f59e0b;">Order Confirmed!</h1>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #f8bbd0;">👑 Royal Chhab Custom Cakes • Chhab, Pakistan</p>
          </div>

          <!-- Body -->
          <div style="padding: 30px 25px;">
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Dear <strong>${customerName}</strong>,
            </p>
            <p style="font-size: 15px; color: #333; line-height: 1.6;">
              Great news! 🎉 Your order has been <strong style="color: #a83250;">reviewed and officially confirmed</strong> by the Royal Chhab bakery team. Our bakers are now preparing your cake with care!
            </p>

            <!-- Order Badge -->
            <div style="background: #f9ece6; border: 2px solid #a83250; border-radius: 12px; padding: 15px 20px; margin: 20px 0; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 12px; color: #777; text-transform: uppercase; letter-spacing: 1px;">Order Number</span><br>
                <strong style="font-size: 22px; color: #a83250;">#${id}</strong>
              </div>
              <div style="text-align: right;">
                <span style="background: #22c55e; color: white; padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: bold;">✓ CONFIRMED</span><br>
                <span style="font-size: 12px; color: #777; margin-top: 4px; display: block;">${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}</span>
              </div>
            </div>

            <!-- Customer & Order Details -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background: #fdf8f5; border-radius: 10px;">
              <tr>
                <td style="padding: 12px; font-size: 13px; color: #444;" width="50%">
                  <strong style="color: #a83250;">CUSTOMER DETAILS:</strong><br>
                  Name: <strong>${customerName}</strong><br>
                  Phone / WhatsApp: ${customerPhone}<br>
                  Email: ${recipientEmail}
                </td>
                <td style="padding: 12px; font-size: 13px; color: #444;" width="50%">
                  <strong style="color: #a83250;">ORDER DETAILS:</strong><br>
                  Fulfillment: <strong>${fulfillmentType === 'pickup' ? '🏪 Store Self-Pickup' : '🚚 Home Delivery'}</strong><br>
                  Payment: <strong>${paymentMethod}</strong><br>
                  Address: ${deliveryAddress}
                </td>
              </tr>
            </table>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #a83250; color: #ffffff; text-align: left;">
                  <th style="padding: 10px 12px; font-size: 13px;">Item</th>
                  <th style="padding: 10px 12px; font-size: 13px; text-align: center;">Qty</th>
                  <th style="padding: 10px 12px; font-size: 13px; text-align: right;">Price</th>
                  <th style="padding: 10px 12px; font-size: 13px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Total -->
            <div style="text-align: right; font-size: 14px; color: #333; border-top: 2px dashed #ddd; padding-top: 15px; margin-bottom: 25px;">
              Subtotal: Rs. ${subtotal.toLocaleString()}<br>
              Delivery Fee: Rs. ${(deliveryFee || 0).toLocaleString()}<br>
              <h2 style="margin: 8px 0 0 0; color: #a83250; font-size: 22px;">Grand Total: Rs. ${totalAmount.toLocaleString()}</h2>
            </div>

            <!-- What Happens Next -->
            <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px;">
              <strong style="color: #166534;">📋 What Happens Next:</strong>
              <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #166534; font-size: 13px; line-height: 1.8;">
                <li>Our bakers are now preparing your cake fresh.</li>
                <li>${fulfillmentType === 'pickup' ? 'Your cake will be ready at our bakery for self-pickup.' : 'A rider will deliver your cake to your address.'}</li>
                <li>You will receive another email when your order is out for delivery / ready for pickup.</li>
                <li>Questions? WhatsApp us at: <strong>0300-ROYAL-CHHAB</strong></li>
              </ul>
            </div>

            <!-- Footer -->
            <div style="background: #f9ece6; border-radius: 10px; padding: 15px; text-align: center; font-size: 12px; color: #7d6b70;">
              <strong style="color: #a83250;">Royal Chhab Bakery Kitchen</strong><br>
              Main Road, Near RHC Hospital, Chhab, Punjab, Pakistan<br>
              WhatsApp: 0300-ROYAL-CHHAB • Thank you for choosing Royal Chhab! 👑
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: '"Royal Chhab Custom Cakes" <faheemkhan101992@gmail.com>',
      to: recipientEmail,
      subject: `✅ Order #${id} Confirmed! – Royal Chhab Custom Cakes`,
      html: emailHtml
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent for Order #${id} to ${recipientEmail}:`, info.messageId);

    res.json({
      success: true,
      message: `Confirmation email sent to ${recipientEmail}!`,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to dispatch confirmation email.'
    });
  }
});

// Fallback Static Route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Express Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Royal Chhab Executive Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
