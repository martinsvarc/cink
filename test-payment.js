const { PrismaClient } = require('@prisma/client');

async function testPaymentCreation() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing payment creation...');
    
    const payment = await prisma.payment.create({
      data: {
        amount: 1000,
        chatterId: 'test-chatter',
        modelId: 'test-model',
        clientId: 'test-client',
        channel: 'test-channel',
        category: 'test-category',
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
    
  } catch (error) {
    console.error('❌ Payment creation failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPaymentCreation();