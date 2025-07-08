import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all performance goals
export async function GET() {
  try {
    const goals = await prisma.performanceGoal.findMany({
      orderBy: {
        period: 'asc'
      }
    });

    // Transform to the format expected by the frontend
    const transformedGoals = goals.reduce((acc: Record<string, any>, goal: any) => {
      acc[goal.period] = {
        chattingRevenueGoal: goal.chattingRevenueGoal,
        profitGoal: goal.profitGoal,
        enabled: goal.enabled
      };
      return acc;
    }, {} as Record<string, any>);

    // Ensure all periods exist with defaults
    const defaultGoals = {
      daily: {
        chattingRevenueGoal: 50000,
        profitGoal: 35000,
        enabled: true
      },
      weekly: {
        chattingRevenueGoal: 350000,
        profitGoal: 245000,
        enabled: true
      },
      monthly: {
        chattingRevenueGoal: 1500000,
        profitGoal: 1050000,
        enabled: false
      }
    };

    const result = { ...defaultGoals, ...transformedGoals };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching performance goals:', error);
    
    return NextResponse.json({ 
      error: 'Failed to fetch performance goals', 
      details: error.message
    }, { status: 500 });
  }
}

// POST - Create or update performance goals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period, chattingRevenueGoal, profitGoal, enabled } = body;

    if (!period || chattingRevenueGoal === undefined || profitGoal === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate period
    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
    }

    // Upsert the goal
    const goal = await prisma.performanceGoal.upsert({
      where: { period },
      update: {
        chattingRevenueGoal,
        profitGoal,
        enabled
      },
      create: {
        period,
        chattingRevenueGoal,
        profitGoal,
        enabled
      }
    });

    return NextResponse.json({
      success: true,
      goal: {
        period: goal.period,
        chattingRevenueGoal: goal.chattingRevenueGoal,
        profitGoal: goal.profitGoal,
        enabled: goal.enabled
      }
    });
  } catch (error: any) {
    console.error('Error creating/updating performance goal:', error);
    
    return NextResponse.json({ 
      error: 'Failed to save performance goal', 
      details: error.message
    }, { status: 500 });
  }
}

// PATCH - Update multiple goals at once
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { goals } = body;

    if (!goals || typeof goals !== 'object') {
      return NextResponse.json({ error: 'Invalid goals data' }, { status: 400 });
    }

    const updates = [];

    for (const [period, goalData] of Object.entries(goals)) {
      if (!['daily', 'weekly', 'monthly'].includes(period)) {
        continue;
      }

      const data = goalData as any;
      
      updates.push(
        prisma.performanceGoal.upsert({
          where: { period },
          update: {
            chattingRevenueGoal: data.chattingRevenueGoal,
            profitGoal: data.profitGoal,
            enabled: data.enabled
          },
          create: {
            period,
            chattingRevenueGoal: data.chattingRevenueGoal,
            profitGoal: data.profitGoal,
            enabled: data.enabled
          }
        })
      );
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating performance goals:', error);
    
    return NextResponse.json({ 
      error: 'Failed to update performance goals', 
      details: error.message
    }, { status: 500 });
  }
} 