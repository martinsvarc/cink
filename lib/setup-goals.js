const { PrismaClient } = require('@prisma/client');

async function setupProductionGoals() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 Setting up commission goals for all chatters...');
    
    // Get all chatters
    const chatters = await prisma.chatter.findMany({
      include: { user: true }
    });
    
    console.log(`Found ${chatters.length} chatters`);
    
    // Create goals for the last 30 days and next 30 days for each chatter
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 30);
    
    for (let i = 0; i < 60; i++) {
      const goalDate = new Date(startDate);
      goalDate.setDate(startDate.getDate() + i);
      
      for (const chatter of chatters) {
        // Check if goal already exists
        const existingGoal = await prisma.goal.findUnique({
          where: {
            chatterId_date: {
              chatterId: chatter.id,
              date: goalDate
            }
          }
        });
        
        if (!existingGoal) {
          await prisma.goal.create({
            data: {
              chatterId: chatter.id,
              targetAmount: 125000, // 125,000 CZK daily threshold
              commissionRate: 20, // 20% commission rate
              date: goalDate,
              goalType: 'daily',
              metricType: 'volume',
              isActive: true
            }
          });
        }
      }
    }
    
    console.log('✅ Commission goals created for all chatters!');
    console.log('📊 Goal structure:');
    console.log('- Daily threshold: 125,000 CZK');
    console.log('- Commission rate: 20%');
    console.log('- Date range: Last 30 days + Next 30 days');
    
  } catch (error) {
    console.error('❌ Error setting up goals:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupProductionGoals();