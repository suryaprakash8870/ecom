const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

class WhatsAppService {
  constructor() {
    this.client = new Client({
      sessionPath: process.env.WHATSAPP_SESSION_PATH || './whatsapp-session',
    });
    this.isReady = false;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.on('qr', (qr) => {
      console.log('QR Code received, scan with WhatsApp to authenticate');
      qrcode.toString(qr, { type: 'terminal' }, (err, string) => {
        if (err) throw err;
        console.log(string);
      });
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready!');
      this.isReady = true;
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp client authenticated');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('Authentication failed:', msg);
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
      this.isReady = false;
    });
  }

  async initialize() {
    try {
      await this.client.initialize();
    } catch (error) {
      console.error('Failed to initialize WhatsApp client:', error);
    }
  }

  async sendOrderNotification(orderData, adminPhone) {
    if (!this.isReady) {
      console.log('WhatsApp client not ready, skipping notification');
      return false;
    }

    try {
      const message = this.formatOrderMessage(orderData);
      const chatId = `${adminPhone}@c.us`;
      
      await this.client.sendMessage(chatId, message);
      console.log('Order notification sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
      return false;
    }
  }

  formatOrderMessage(orderData) {
    const { order, customer, items } = orderData;
    
    return `🛒 *New Order Received!*

📋 *Order Details:*
• Order #: ${order.order_number}
• Customer: ${customer.name}
• Phone: ${customer.phone}
• Total: ₹${order.total_amount}

📦 *Items:*
${items.map(item => `• ${item.product_name} x${item.quantity} - ₹${item.price}`).join('\n')}

📍 *Shipping Address:*
${order.shipping_address.address}
${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.pincode}

⏰ Order placed at: ${new Date(order.created_at).toLocaleString('en-IN')}

Please process this order promptly! 🚀`;
  }

  async disconnect() {
    if (this.client) {
      await this.client.destroy();
    }
  }
}

// Singleton instance
let whatsappService = null;

const getWhatsAppService = () => {
  if (!whatsappService) {
    whatsappService = new WhatsAppService();
  }
  return whatsappService;
};

module.exports = {
  WhatsAppService,
  getWhatsAppService,
};
