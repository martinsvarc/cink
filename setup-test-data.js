const { PrismaClient } = require('@prisma/client');

async function setupTestData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Setting up test data...');
    
    // 1. Create a test user first
    const user = await prisma.user.create({
      data: {
        username: 'test-user',
        email: 'test@example.com',
        role: 'chatter',
        passwordHash: 'dummy-hash'
      }
    });
    console.log('✅ User created:', user.id);
    
    // 2. Create a chatter linked to the user
    const chatter = await prisma.chatter.create({
      data: {
        userId: user.id,
        hourlyRate: 120,
        defaultCommission: 20.0,
        milestoneTiers: [{"amount": 10000, "bonus": 500}],
        weekendBonusMultiplier: 1.5,
        wildcardBonusMultiplier: 2.0
      }
    });
    console.log('✅ Chatter created:', chatter.id);
    
    // 3. Create a model
    const model = await prisma.model.create({
      data: {
        name: 'Test Model',
        platform: 'Fanvue',
        status: 'active'
      }
    });
    console.log('✅ Model created:', model.id);
    
    // 4. Create a client
    const client = await prisma.client.create({
      data: {
        name: 'Test Client',
        profileUrl: 'https://example.com/test-client',
        assignedChatterId: chatter.id
      }
    });
    console.log('✅ Client created:', client.id);
    
    // 5. Now create a payment
    const payment = await prisma.payment.create({
      data: {
        amount: 1000,
        chatterId: chatter.id,
        modelId: model.id,
        clientId: client.id,
        channel: 'Test Channel',
        category: 'Test Category',
        timestamp: new Date(),
        cinklo: false,
        hotovo: false,
        dailyVolumeAtTime: 0,
        commissionEarned: 0,
        commissionRate: 0,
        thresholdMet: false
      }
    });
    console.log('✅ Payment created successfully:', payment.id);
    
    console.log('🎉 All test data created successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData();