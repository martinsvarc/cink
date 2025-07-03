import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CommissionCalculation {
  totalDailyVolume: number;
  thresholdMet: boolean;
  commissionRate: number;
  totalCommission: number;
  affectedPayments: string[];
}

/**
 * Recalculates commissions for a chatter on a specific date
 * This runs whenever CINKLO status changes
 */
export async function recalculateCommissions(
  chatterId: string, 
  date: Date
): Promise<CommissionCalculation> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all CINKLO payments for this chatter on this date
  const cinkoPayments = await prisma.payment.findMany({
    where: {
      chatterId,
      cinklo: true,
      timestamp: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    orderBy: { timestamp: 'asc' }
  });

  // Calculate total daily volume
  const totalDailyVolume = cinkoPayments.reduce((sum, payment) => sum + payment.amount, 0);

  // Get the goal/commission rate for this date
  const goal = await prisma.goal.findFirst({
    where: {
      chatterId,
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  if (!goal) {
    throw new Error(`No goal found for chatter ${chatterId} on ${date.toISOString()}`);
  }

  // Check if threshold is met
  const thresholdMet = totalDailyVolume >= goal.targetAmount;
  const commissionRate = thresholdMet ? goal.commissionRate : 0;
  const totalCommission = Math.floor(totalDailyVolume * (commissionRate / 100));

  // Update all payments with new commission data
  const affectedPayments: string[] = [];
  
  for (const payment of cinkoPayments) {
    const commissionEarned = thresholdMet ? 
      Math.floor(payment.amount * (commissionRate / 100)) : 0;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        dailyVolumeAtTime: totalDailyVolume,
        commissionEarned,
        commissionRate,
        thresholdMet,
        cinkoProcessedAt: new Date()
      }
    });

    affectedPayments.push(payment.id);
  }

  return {
    totalDailyVolume,
    thresholdMet,
    commissionRate,
    totalCommission,
    affectedPayments
  };
}

/**
 * Handles client assignment logic
 * If client with profileUrl exists, transfer ownership
 */
export async function handleClientAssignment(
  profileUrl: string, 
  chatterId: string, 
  clientData: { name: string; notes?: string; channel?: string }
) {
  // Check if client with this profileUrl exists
  const existingClient = await prisma.client.findUnique({
    where: { profileUrl }
  });

  if (existingClient) {
    // Transfer ownership to new chatter
    const updatedClient = await prisma.client.update({
      where: { id: existingClient.id },
      data: {
        assignedChatterId: chatterId,
        name: clientData.name, // Update name in case it changed
        notes: clientData.notes,
        channel: clientData.channel
      }
    });
    
    return { client: updatedClient, isNewClient: false };
  } else {
    // Create new client
    const newClient = await prisma.client.create({
      data: {
        name: clientData.name,
        profileUrl,
        assignedChatterId: chatterId,
        notes: clientData.notes,
        channel: clientData.channel
      }
    });
    
    return { client: newClient, isNewClient: true };
  }
}

/**
 * Gets chatter's earnings for a specific date
 */
export async function getChatterEarnings(chatterId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all CINKLO payments for this date
  const payments = await prisma.payment.findMany({
    where: {
      chatterId,
      cinklo: true,
      timestamp: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  const totalVolume = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalCommission = payments.reduce((sum, p) => sum + (p.commissionEarned || 0), 0);

  // Get hourly earnings from work sessions
  const workSessions = await prisma.workSession.findMany({
    where: {
      chatterId,
      startTime: {
        gte: startOfDay,
        lte: endOfDay
      },
      status: { in: ['completed', 'auto_stopped'] }
    }
  });

  const hourlyEarnings = workSessions.reduce((sum, session) => {
    return sum + (session.calculatedEarnings || 0);
  }, 0);

  const milestoneBonus = workSessions.reduce((sum, session) => {
    return sum + (session.milestoneBonus || 0);
  }, 0);

  return {
    totalVolume,
    totalCommission,
    hourlyEarnings,
    milestoneBonus,
    totalEarnings: totalCommission + hourlyEarnings + milestoneBonus
  };
}

/**
 * Auto-stops all active work sessions at midnight
 */
export async function autoStopWorkSessions() {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const activeSessions = await prisma.workSession.findMany({
    where: {
      status: 'active',
      startTime: {
        lt: endOfDay
      }
    },
    include: {
      chatter: true
    }
  });

  for (const session of activeSessions) {
    const durationMinutes = Math.floor((endOfDay.getTime() - session.startTime.getTime()) / (1000 * 60));
    const hourlyEarnings = Math.floor((durationMinutes / 60) * session.chatter.hourlyRate);

    await prisma.workSession.update({
      where: { id: session.id },
      data: {
        endTime: endOfDay,
        durationMinutes,
        calculatedEarnings: hourlyEarnings,
        status: 'auto_stopped',
        autoStoppedAt: now
      }
    });
  }

  return activeSessions.length;
}