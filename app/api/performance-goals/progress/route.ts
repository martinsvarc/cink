import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get actual revenue data for different periods
    const [dailyRevenue, weeklyRevenue, monthlyRevenue] = await Promise.all([
      // Daily revenue (today)
      prisma.payment.aggregate({
        where: {
          timestamp: {
            gte: todayStart,
            lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
          },
          cinklo: true // Only count processed payments
        },
        _sum: {
          amount: true
        }
      }),
      
      // Weekly revenue (this week)
      prisma.payment.aggregate({
        where: {
          timestamp: {
            gte: weekStart,
            lt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
          },
          cinklo: true
        },
        _sum: {
          amount: true
        }
      }),
      
      // Monthly revenue (this month)
      prisma.payment.aggregate({
        where: {
          timestamp: {
            gte: monthStart,
            lt: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1)
          },
          cinklo: true
        },
        _sum: {
          amount: true
        }
      })
    ]);

    // Calculate profit (assuming 70% profit margin as example)
    const profitMargin = 0.7;
    
    const progressData = {
      daily: {
        currentRevenue: dailyRevenue._sum.amount || 0,
        currentProfit: Math.round((dailyRevenue._sum.amount || 0) * profitMargin),
        period: 'today'
      },
      weekly: {
        currentRevenue: weeklyRevenue._sum.amount || 0,
        currentProfit: Math.round((weeklyRevenue._sum.amount || 0) * profitMargin),
        period: 'this week'
      },
      monthly: {
        currentRevenue: monthlyRevenue._sum.amount || 0,
        currentProfit: Math.round((monthlyRevenue._sum.amount || 0) * profitMargin),
        period: 'this month'
      }
    };

    return NextResponse.json(progressData);
  } catch (error) {
    console.error('Error calculating progress:', error);
    return NextResponse.json({ error: 'Failed to calculate progress' }, { status: 500 });
  }
} 