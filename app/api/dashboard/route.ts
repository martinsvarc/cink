import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getChatterEarnings } from '@/lib/payment-engine';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatterId = searchParams.get('chatterId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const period = searchParams.get('period') || 'today'; // 'today', 'week', 'month'

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get period boundaries
    let periodStart = startOfDay;
    let periodEnd = endOfDay;

    if (period === 'week') {
      periodStart = new Date(targetDate);
      periodStart.setDate(targetDate.getDate() - 7);
      periodStart.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      periodStart = new Date(targetDate);
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);
    }

    // Base query conditions
    let whereConditions: any = {
      cinklo: true, // Only count approved payments
      timestamp: {
        gte: periodStart,
        lte: periodEnd
      }
    };

    // Filter by chatter if specified
    if (chatterId) {
      whereConditions.chatterId = chatterId;
    }

    // Get total revenue and payments
    const payments = await prisma.payment.findMany({
      where: whereConditions,
      include: {
        chatter: { include: { user: true } },
        model: true,
        client: true
      },
      orderBy: { timestamp: 'desc' }
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalCommissions = payments.reduce((sum, p) => sum + (p.commissionEarned || 0), 0);
    const totalPayments = payments.length;

    // Get chatter performance if specific chatter requested
    let chatterData = null;
    if (chatterId) {
      const earnings = await getChatterEarnings(chatterId, targetDate);
      
      // Get chatter's goal for today
      const goal = await prisma.goal.findFirst({
        where: {
          chatterId,
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      // Get active work session
      const activeSession = await prisma.workSession.findFirst({
        where: {
          chatterId,
          status: 'active'
        }
      });

      chatterData = {
        earnings,
        goal,
        activeSession,
        progress: goal ? (earnings.totalVolume / goal.targetAmount) * 100 : 0,
        todayPayments: payments.filter(p => p.chatterId === chatterId).length
      };
    }

    // Get top performers for the period
    const topPerformers = await prisma.payment.groupBy({
      by: ['chatterId'],
      where: {
        cinklo: true,
        timestamp: {
          gte: periodStart,
          lte: periodEnd
        }
      },
      _sum: {
        amount: true,
        commissionEarned: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: 10
    });

    // Get chatter details for top performers
    const topPerformersWithDetails = await Promise.all(
      topPerformers.map(async (performer) => {
        const chatter = await prisma.chatter.findUnique({
          where: { id: performer.chatterId },
          include: { user: true }
        });
        
        return {
          chatter,
          totalRevenue: performer._sum.amount || 0,
          totalCommission: performer._sum.commissionEarned || 0,
          paymentCount: performer._count.id
        };
      })
    );

    // Get recent activity
    const recentActivity = await prisma.activityLog.findMany({
      where: {
        timestamp: {
          gte: periodStart,
          lte: periodEnd
        }
      },
      include: {
        payment: {
          include: {
            chatter: { include: { user: true } },
            model: true,
            client: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    // Get model performance
    const modelPerformance = await prisma.payment.groupBy({
      by: ['modelId'],
      where: {
        cinklo: true,
        timestamp: {
          gte: periodStart,
          lte: periodEnd
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      }
    });

    const modelPerformanceWithDetails = await Promise.all(
      modelPerformance.map(async (model) => {
        const modelData = await prisma.model.findUnique({
          where: { id: model.modelId }
        });
        
        return {
          model: modelData,
          totalRevenue: model._sum.amount || 0,
          paymentCount: model._count.id
        };
      })
    );

    // Get hourly breakdown for today
    const hourlyBreakdown = await prisma.payment.findMany({
      where: {
        cinklo: true,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      select: {
        timestamp: true,
        amount: true
      }
    });

    // Group by hour
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourPayments = hourlyBreakdown.filter(p => 
        p.timestamp.getHours() === hour
      );
      
      return {
        hour,
        revenue: hourPayments.reduce((sum, p) => sum + p.amount, 0),
        count: hourPayments.length
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalCommissions,
          totalPayments,
          period,
          date: targetDate.toISOString()
        },
        chatterData,
        topPerformers: topPerformersWithDetails,
        recentActivity,
        modelPerformance: modelPerformanceWithDetails,
        hourlyBreakdown: hourlyData
      }
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}