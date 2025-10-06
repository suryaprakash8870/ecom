const nodemailer = require('nodemailer');

function getTransport() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  // Fallback: stream to console
  return {
    sendMail: async (opts) => {
      console.log('Email (console fallback):');
      console.log('From:', opts.from);
      console.log('To:', opts.to);
      console.log('Subject:', opts.subject);
      console.log('Text:', opts.text);
      console.log('HTML:', opts.html);
      return { messageId: 'console' };
    },
  };
}

async function sendOrderEmail({ to, customerName, order }) {
  const transporter = getTransport();
  const from = process.env.FROM_EMAIL || 'no-reply@example.com';
  const subject = `Order Confirmation - ${order.order_number}`;
  const itemsHtml = (order.items || [])
    .map((it) => `<li>${it.product_name} × ${it.quantity} - ₹${it.price}</li>`) 
    .join('');
  const html = `
    <div>
      <p>Hi ${customerName || ''},</p>
      <p>Thank you for your order. Here are your details:</p>
      <p><strong>Order #:</strong> ${order.order_number}</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Total:</strong> ₹${order.total_amount}</p>
      <p>Status: ${order.status}</p>
      <p>We will notify you when your order ships.</p>
      <p>— Team</p>
    </div>
  `;
  const text = `Order ${order.order_number} total ₹${order.total_amount}`;
  try {
    await transporter.sendMail({ from, to, subject, text, html });
  } catch (e) {
    console.error('Email send failed:', e);
  }
}

module.exports = { sendOrderEmail };


