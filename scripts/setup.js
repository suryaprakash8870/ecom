const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

// Check if DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.error('Please make sure .env.local file exists and contains DATABASE_URL');
  process.exit(1);
}

console.log('🔗 Using database:', process.env.DATABASE_URL.split('@')[1]?.split(':')[0] || 'Unknown');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
});

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../lib/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('✅ Database schema created successfully');
    
    // Insert sample data
    console.log('📦 Inserting sample data...');
    
    // Sample products
    const sampleProducts = [
      {
        name: 'Samsung Galaxy S23',
        description: 'Latest Samsung smartphone with advanced camera features',
        price: 79999,
        discount_price: 69999,
        category_id: 1,
        stock_quantity: 50,
        images: JSON.stringify(['https://images.samsung.com/in/smartphones/galaxy-s23/images/galaxy-s23-highlights-kv-mo.jpg']),
        specifications: JSON.stringify({
          'Display': '6.1" Dynamic AMOLED',
          'Processor': 'Snapdragon 8 Gen 2',
          'RAM': '8GB',
          'Storage': '128GB',
          'Camera': '50MP + 12MP + 10MP'
        })
      },
      {
        name: 'Apple iPhone 14',
        description: 'Powerful iPhone with A15 Bionic chip',
        price: 79900,
        discount_price: 72900,
        category_id: 1,
        stock_quantity: 30,
        images: JSON.stringify(['https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch_AV1?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1663703841896']),
        specifications: JSON.stringify({
          'Display': '6.1" Super Retina XDR',
          'Processor': 'A15 Bionic',
          'RAM': '6GB',
          'Storage': '128GB',
          'Camera': '12MP + 12MP'
        })
      },
      {
        name: 'Nike Air Max 270',
        description: 'Comfortable running shoes with Max Air cushioning',
        price: 12995,
        discount_price: 9995,
        category_id: 5,
        stock_quantity: 100,
        images: JSON.stringify(['https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-max-270-mens-shoes-KkLcGR.png']),
        specifications: JSON.stringify({
          'Size': '7-12 (UK)',
          'Color': 'Black/White',
          'Material': 'Mesh and Synthetic',
          'Type': 'Running Shoes'
        })
      }
    ];

    for (const product of sampleProducts) {
      await pool.query(
        `INSERT INTO products (name, description, price, discount_price, category_id, stock_quantity, images, specifications)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [product.name, product.description, product.price, product.discount_price, 
         product.category_id, product.stock_quantity, product.images, product.specifications]
      );
    }

    console.log('✅ Sample products inserted');
    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env.local file with correct database URL');
    console.log('2. Run: npm run dev');
    console.log('3. Open: http://localhost:3000');
    console.log('\n🔑 Default admin credentials:');
    console.log('Email: admin@ecommerce.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
