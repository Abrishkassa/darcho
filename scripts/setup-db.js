const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🚀 Setting up Darcho database...');
  
  try {
    // 1. Create test farmer
    const hashedPassword = await bcrypt.hash('farmer123', 10);
    
    const farmerUser = await prisma.user.upsert({
      where: { email: 'farmer@darcho.com' },
      update: {},
      create: {
        email: 'farmer@darcho.com',
        phone: '+251911223344',
        passwordHash: hashedPassword,
        role: 'farmer',
        fullName: 'Abriham Kassa',
        isVerified: true,
      },
    });
    
    const farmer = await prisma.farmer.upsert({
      where: { userId: farmerUser.id },
      update: {},
      create: {
        userId: farmerUser.id,
        farmName: 'Green Valley Farm',
        region: 'Oromia',
        residence: 'Addis Ababa',
        farmSize: '5 hectares',
        yearsFarming: 8,
        certifications: ['Organic Certified', 'Fair Trade', 'Rainforest Alliance'],
      },
    });
    
    // 2. Create test buyer
    const buyerPassword = await bcrypt.hash('buyer123', 10);
    
    const buyerUser = await prisma.user.upsert({
      where: { email: 'buyer@darcho.com' },
      update: {},
      create: {
        email: 'buyer@darcho.com',
        phone: '+251922334455',
        passwordHash: buyerPassword,
        role: 'buyer',
        fullName: 'Selam Desta',
        isVerified: true,
      },
    });
    
    const buyer = await prisma.buyer.upsert({
      where: { userId: buyerUser.id },
      update: {},
      create: {
        userId: buyerUser.id,
        companyName: 'Global Coffee Exporters',
        businessType: 'Export Company',
        location: 'Addis Ababa',
        buyerType: 'exporter',
        preferredRegions: ['Oromia', 'Sidamo', 'Yirgacheffe'],
      },
    });
    
    // 3. Create sample coffee products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          farmerId: farmer.id,
          name: 'Yirgacheffe AA Premium',
          grade: 'AA',
          category: 'Specialty Coffee',
          quantity: 45.5,
          unit: 'kg',
          pricePerUnit: 2800,
          description: 'Premium washed coffee from Yirgacheffe region with floral notes',
          originRegion: 'Yirgacheffe, Ethiopia',
          altitude: '2100m',
          harvestDate: new Date('2024-01-15'),
          processingMethod: 'Washed',
          certifications: ['Organic', 'Fair Trade'],
          moistureContent: 11.5,
          beanSize: 'Screen 18',
          cuppingScore: 88.5,
          imageUrls: ['https://example.com/coffee1.jpg'],
          status: 'available',
        },
      }),
      prisma.product.create({
        data: {
          farmerId: farmer.id,
          name: 'Sidamo Natural Process',
          grade: 'A',
          category: 'Specialty Coffee',
          quantity: 32.0,
          unit: 'kg',
          pricePerUnit: 2400,
          description: 'Natural process coffee with berry notes',
          originRegion: 'Sidamo, Ethiopia',
          altitude: '1900m',
          harvestDate: new Date('2024-01-10'),
          processingMethod: 'Natural',
          certifications: ['Organic'],
          moistureContent: 12.0,
          beanSize: 'Screen 16',
          cuppingScore: 86.0,
          imageUrls: ['https://example.com/coffee2.jpg'],
          status: 'available',
        },
      }),
    ]);
    
    // 4. Create sample order
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        productId: products[0].id,
        buyerId: buyer.id,
        farmerId: farmer.id,
        quantity: 10.5,
        unitPrice: 2800,
        totalPrice: 29400,
        status: 'confirmed',
        deliveryStatus: 'pending',
        notes: 'Urgent delivery requested',
        paymentMethod: 'escrow',
        paymentStatus: 'pending',
      },
    });
    
    console.log('✅ Database setup completed!');
    console.log(`👨‍🌾 Farmer created: ${farmerUser.fullName}`);
    console.log(`🛒 Buyer created: ${buyerUser.fullName}`);
    console.log(`📦 Products created: ${products.length}`);
    console.log(`📋 Order created: ${order.orderNumber}`);
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup
setupDatabase();