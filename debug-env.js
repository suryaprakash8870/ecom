// Temporary debug script to check environment variables
const fs = require('fs');
const path = require('path');

console.log('🔍 Environment Variables Debug:');

// Read .env.local file manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file found');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  let databaseUrl = '';
  let jwtSecret = '';
  
  lines.forEach(line => {
    if (line.startsWith('DATABASE_URL=')) {
      databaseUrl = line.split('=')[1];
    }
    if (line.startsWith('JWT_SECRET=')) {
      jwtSecret = line.split('=')[1];
    }
  });
  
  console.log('DATABASE_URL:', databaseUrl ? '✅ Found' : '❌ Missing');
  console.log('JWT_SECRET:', jwtSecret ? '✅ Found' : '❌ Missing');
  
  if (databaseUrl) {
    console.log('\n📊 DATABASE_URL Analysis:');
    console.log('Full URL length:', databaseUrl.length);
    console.log('Contains @:', databaseUrl.includes('@') ? '✅' : '❌');
    console.log('Contains :5432:', databaseUrl.includes(':5432') ? '✅' : '❌');
    console.log('Contains supabase.co:', databaseUrl.includes('supabase.co') ? '✅' : '❌');
    
    // Extract parts
    try {
      const urlObj = new URL(databaseUrl);
      console.log('Protocol:', urlObj.protocol);
      console.log('Hostname:', urlObj.hostname);
      console.log('Port:', urlObj.port);
      console.log('Database:', urlObj.pathname);
      console.log('Username:', urlObj.username);
      console.log('Password length:', urlObj.password ? urlObj.password.length : 0);
    } catch (error) {
      console.log('❌ URL parsing error:', error.message);
    }
  }
} else {
  console.log('❌ .env.local file not found');
  console.log('Please create .env.local file with your database configuration');
}
