import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest, { params }: { params: { chatterId: string } }) {
  try {
    const { chatterId } = params;
    const body = await request.json();

    // Validate chatter exists
    const existingChatter = await prisma.chatter.findUnique({
      where: { id: chatterId }
    });

    if (!existingChatter) {
      return NextResponse.json({ error: 'Chatter not found' }, { status: 404 });
    }

    // Build update data object
    const updateData: any = {};
    
    if (body.defaultCommission !== undefined) {
      updateData.defaultCommission = parseFloat(body.defaultCommission);
    }
    
    if (body.hourlyRate !== undefined) {
      updateData.hourlyRate = parseInt(body.hourlyRate);
    }
    
    if (body.milestoneTiers !== undefined) {
      updateData.milestoneTiers = body.milestoneTiers;
    }
    
    if (body.weekendBonusMultiplier !== undefined) {
      updateData.weekendBonusMultiplier = parseFloat(body.weekendBonusMultiplier);
    }
    
    if (body.wildcardBonusMultiplier !== undefined) {
      updateData.wildcardBonusMultiplier = parseFloat(body.wildcardBonusMultiplier);
    }

    // Update the chatter
    const updatedChatter = await prisma.chatter.update({
      where: { id: chatterId },
      data: updateData,
      include: {
        user: true
      }
    });

    // Transform response to match UI expectations
    const transformedChatter = {
      id: updatedChatter.user.id,
      userId: updatedChatter.user.id,
      chatterId: updatedChatter.id,
      user: updatedChatter.user.name || updatedChatter.user.username,
      defaultChatCommission: updatedChatter.defaultCommission,
      hourlyPay: updatedChatter.hourlyRate,
      milestoneBonus: updatedChatter.milestoneTiers || {},
      weekendBonus: updatedChatter.weekendBonusMultiplier,
      wildcardBonus: updatedChatter.wildcardBonusMultiplier,
      isActive: updatedChatter.isActive
    };

    return NextResponse.json(transformedChatter);
  } catch (error) {
    console.error('Error updating chatter commission:', error);
    return NextResponse.json({ error: 'Failed to update commission settings' }, { status: 500 });
  }
} 