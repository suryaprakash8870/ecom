const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 Setting up your India E-Commerce environment...\n');

// Generate JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');
const nextAuthSecret = crypto.randomBytes(32).toString('hex');

// Environment template
const envTemplate = `# Database Configuration (Replace YOUR_PASSWORD with your actual Supabase password)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.uswlthldhldnklxuwvxv.supabase.co:5432/postgres

# JWT Secret (auto-generated)
JWT_SECRET=${jwtSecret}

# WhatsApp Configuration
WHATSAPP_SESSION_PATH=./whatsapp-session
ADMIN_WHATSAPP_NUMBER=+91XXXXXXXXXX

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${nextAuthSecret}

# Rate Limiting (Optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

// Check if .env.local already exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
  fs.copyFileSync(envPath, envPath + '.backup');
}

// Write the environment file
fs.writeFileSync(envPath, envTemplate);

console.log('✅ Environment file created: .env.local');
console.log('🔑 JWT Secret generated:', jwtSecret);
console.log('🔐 NextAuth Secret generated:', nextAuthSecret);
console.log('\n📋 Next steps:');
console.log('1. Update YOUR_PASSWORD in .env.local with your actual Supabase password');
console.log('2. Update ADMIN_WHATSAPP_NUMBER with your WhatsApp number');
console.log('3. Run: npm install');
console.log('4. Run: npm run setup');
console.log('5. Run: npm run dev');
console.log('\n🎉 Your environment is ready!');
