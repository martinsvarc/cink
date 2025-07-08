import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      where: {
        chatter: {
          isNot: null
        }
      },
      include: {
        chatter: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to match UI expectations
    const transformedUsers = users.map((user: any) => ({
      id: user.id,
      userId: user.id,
      chatterId: user.chatter.id,
      user: user.name || user.username,
      defaultChatCommission: user.chatter.defaultCommission,
      hourlyPay: user.chatter.hourlyRate,
      milestoneBonus: user.chatter.milestoneTiers || {},
      weekendBonus: user.chatter.weekendBonusMultiplier,
      wildcardBonus: user.chatter.wildcardBonusMultiplier,
      isActive: user.chatter.isActive
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching revenue settings:', error);
    return NextResponse.json({ error: 'Failed to fetch revenue settings' }, { status: 500 });
  }
} 