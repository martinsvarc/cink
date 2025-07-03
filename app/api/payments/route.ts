import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔍 GET /api/payments called');
    
    const payments = await prisma.payment.findMany({
      take: 50,
      orderBy: { timestamp: 'desc' }
    });

    return NextResponse.json({
      success: true,
      payments,
      count: payments.length
    });
  } catch (error) {
    console.error('❌ GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 POST /api/payments called');
    
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    const {
      amount,
      chatterId,
      modelId,
      clientName,
      channel,
      category,
      notes,
      toAccount
    } = body;

    // Validate required fields
    if (!amount || !chatterId || !modelId || !clientName) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: amount, chatterId, modelId, clientName' },
        { status: 400 }
      );
    }

    // Verify chatter exists
    const chatter = await prisma.chatter.findUnique({
      where: { id: chatterId }
    });

    if (!chatter) {
      console.log('❌ Chatter not found:', chatterId);
      return NextResponse.json(
        { error: 'Chatter not found' },
        { status: 404 }
      );
    }

    // Verify model exists  
    const model = await prisma.model.findUnique({
      where: { id: modelId }
    });

    if (!model) {
      console.log('❌ Model not found:', modelId);
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    // Use the test client ID
    const clientId = 'cmcnaqoff0005ujeotcyn2q7x';

    console.log('✅ Creating payment...');

    const payment = await prisma.payment.create({
      data: {
        amount: parseInt(amount),
        chatterId,
        modelId,
        clientId,
        channel: channel || 'Unknown',
        category: category || 'Unknown',
        notes: notes || '',
        toAccount: toAccount || '',
        source: 'web-form',
        cinklo: false,
        hotovo: false,
        dailyVolumeAtTime: 0,
        commissionEarned: 0,
        commissionRate: 0,
        thresholdMet: false
      }
    });

    console.log('✅ Payment created successfully:', payment.id);

    return NextResponse.json({
      success: true,
      payment,
      message: 'Payment created successfully'
    });

  } catch (error) {
    console.error('❌ POST error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Foreign key constraint failed - invalid chatter or model ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create payment', details: error.message },
      { status: 500 }
    );
  }
}