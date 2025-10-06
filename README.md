# India E-Commerce Platform

A comprehensive e-commerce web application built specifically for the Indian market using Next.js, React, and PostgreSQL.

## Features

- 🛍️ **Product Catalog** with categories and advanced search
- 🛒 **Shopping Cart** and secure checkout process
- 👤 **User Authentication** with JWT tokens
- 🛡️ **Admin Panel** for managing orders, products, and users
- 📱 **WhatsApp Notifications** for order alerts
- 📱 **Responsive Design** optimized for all devices
- 🔒 **Security Features** including rate limiting and HTTPS
- 💰 **Cost-Effective** setup with minimal infrastructure requirements

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Notifications**: WhatsApp Web.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd india-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update the `.env.local` file with your configuration:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/india_ecommerce
   
   # JWT Secret (generate a strong secret)
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # WhatsApp Configuration
   WHATSAPP_SESSION_PATH=./whatsapp-session
   ADMIN_WHATSAPP_NUMBER=+91XXXXXXXXXX
   
   # Server Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-here
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb india_ecommerce
   
   # Run schema
   psql -d india_ecommerce -f lib/schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

The application includes a comprehensive database schema with the following tables:

- **users** - Customer and admin accounts
- **categories** - Product categories
- **products** - Product catalog
- **cart** - Shopping cart items
- **orders** - Order information
- **order_items** - Individual order items
- **whatsapp_notifications** - Notification logs

## WhatsApp Integration

1. **Install WhatsApp Web.js dependencies**
   ```bash
   npm install whatsapp-web.js qrcode
   ```

2. **Configure WhatsApp**
   - Update `ADMIN_WHATSAPP_NUMBER` in your environment variables
   - The first time you run the app, scan the QR code with WhatsApp
   - Session will be saved for future use

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get products with filters
- `POST /api/products` - Create product (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update cart item
- `DELETE /api/cart` - Remove item from cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order

### Admin
- `GET /api/admin/orders` - Get all orders (admin)
- `PUT /api/admin/orders` - Update order status
- `GET /api/admin/users` - Get all users (admin)

## Security Features

- **JWT Authentication** for secure user sessions
- **Rate Limiting** to prevent abuse
- **Input Validation** on all API endpoints
- **SQL Injection Protection** using parameterized queries
- **CORS Configuration** for cross-origin requests
- **Security Headers** for enhanced protection

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Configure your database and environment variables

## Cost Optimization

This setup is designed for minimal cost:

- **Database**: Use free tier PostgreSQL (Supabase, Railway, or Neon)
- **Hosting**: Vercel free tier or similar
- **WhatsApp**: Free WhatsApp Web API
- **Storage**: Local file storage or free cloud storage

## Features for Indian Market

- **Indian Currency**: All prices displayed in INR
- **Indian Address Format**: Pincode, state, city fields
- **WhatsApp Integration**: Popular in India for business communication
- **Cash on Delivery**: Payment method preferred in India
- **Local Language Support**: Ready for Hindi/regional language integration

## Admin Panel Features

- **Dashboard**: Overview of orders, users, and revenue
- **Order Management**: Update order status, view order details
- **Product Management**: Add, edit, remove products
- **User Management**: View and manage user accounts
- **Category Management**: Organize product categories

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

## Roadmap

- [ ] Multi-language support (Hindi, regional languages)
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] SMS integration
- [ ] Payment gateway integration (Razorpay, PayU)
- [ ] Inventory management
- [ ] Coupon and discount system
- [ ] Review and rating system
- [ ] Mobile app (React Native)
