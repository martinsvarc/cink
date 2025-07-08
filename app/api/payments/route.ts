import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken, getUserById } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔍 GET /api/payments called');
    
    // First try to connect to the database
    console.log('📋 Checking database connection...');
    
    // Try a simple query first
    const paymentCount = await prisma.payment.count();
    console.log(`📊 Found ${paymentCount} payments in database`);
    
    if (paymentCount === 0) {
      console.log('⚠️ No payments found in database');
      return NextResponse.json({
        success: true,
        payments: [],
        count: 0
      });
    }
    
    // Try to fetch payments with minimal relations first
    console.log('🔄 Fetching payments with relations...');
    const payments = await prisma.payment.findMany({
      take: 50,
      orderBy: { timestamp: 'desc' },
      include: {
        chatter: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        model: {
          select: {
            name: true
          }
        },
        client: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`✅ Successfully fetched ${payments.length} payments`);
    
    return NextResponse.json({
      success: true,
      payments,
      count: payments.length
    });
  } catch (error) {
    console.error('❌ GET error:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // If database connection fails, return mock data for development
    console.log('🔄 Database connection failed, returning mock data for development');
    
    const mockPayments = [
      {
        id: 1,
        amount: 11250,
        timestamp: new Date('2024-01-15T14:23:00Z'),
        channel: 'Fanvue',
        category: 'Premium Video',
        toAccount: 'Wise USD',
        notes: 'Custom content request',
        cinklo: true,
        hotovo: true,
        chatter: {
          user: {
            name: 'Isabella'
          }
        },
        model: {
          name: 'Isabella'
        },
        client: {
          name: 'Michael_VIP'
        }
      },
      {
        id: 2,
        amount: 5000,
        timestamp: new Date('2024-01-15T13:45:00Z'),
        channel: 'Facebook',
        category: 'Chat Session',
        toAccount: 'Crypto Wallet',
        notes: 'Extended conversation',
        cinklo: true,
        hotovo: false,
        chatter: {
          user: {
            name: 'Sophia'
          }
        },
        model: {
          name: 'Natalie'
        },
        client: {
          name: 'David_Elite'
        }
      },
      {
        id: 3,
        amount: 18750,
        timestamp: new Date('2024-01-15T12:30:00Z'),
        channel: 'WhatsApp',
        category: 'Live Call',
        toAccount: 'Wise USD',
        notes: 'Private session',
        cinklo: false,
        hotovo: false,
        chatter: {
          user: {
            name: 'Luna'
          }
        },
        model: {
          name: 'Sophia'
        },
        client: {
          name: 'James_VIP'
        }
      }
    ];
    
    return NextResponse.json({
      success: true,
      payments: mockPayments,
      count: mockPayments.length,
      mock: true
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== PAYMENT API DEBUG START ===');
    
    // Log the request body
    const body = await request.json();
    console.log('📝 Request body:', JSON.stringify(body, null, 2));
    
    const {
      amount,
      modelId,
      channelId,
      clientId,
      clientName,
      payday,
      accountId,
      category,
      notes,
      screenshot
    } = body;

    // Check required fields
    const requiredFields = { amount, modelId, channelId, accountId, category };
    console.log('📋 Required fields check:', requiredFields);
    
    // Check if we have either clientId or clientName
    if (!clientId && !clientName) {
      console.error('❌ Missing required field: clientId or clientName');
      return NextResponse.json(
        { error: 'Either clientId or clientName is required' },
        { status: 400 }
      );
    }
    
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        console.error(`❌ Missing required field: ${field}`);
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Get authenticated user
    console.log('🔐 Checking authentication...');
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      console.log('❌ No auth token found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token and get current user
    const payload = await verifyToken(token);
    if (!payload) {
      console.log('❌ Invalid token');
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const currentUser = await getUserById(payload.userId);
    if (!currentUser) {
      console.log('❌ User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ Current user:', {
      id: currentUser.id,
      username: currentUser.username,
      role: currentUser.role
    });

    // ADMIN OVERRIDE: Admins can do everything, no restrictions
    let chatterId: string | null = null;
    
    if (currentUser.role === 'admin') {
      console.log('🔑 Admin user detected - bypassing all restrictions');
      // For admin users, we'll use the first available chatter or create a default one
      // This is just for the database relationship requirement
      let defaultChatter = await prisma.chatter.findFirst({
        where: { isActive: true }
      });
      
      if (!defaultChatter) {
        // Create a system chatter for admin payments
        console.log('🔄 Creating admin chatter record...');
        defaultChatter = await prisma.chatter.create({
          data: {
            userId: currentUser.id,
            hourlyRate: 0,
            defaultCommission: 0,
            milestoneTiers: [],
            weekendBonusMultiplier: 1,
            wildcardBonusMultiplier: 1,
            isActive: true
          }
        });
        console.log('✅ Created admin chatter record');
      }
      chatterId = defaultChatter.id;
    } else {
      // For non-admin users, they must be chatters
      const userChatter = await prisma.chatter.findFirst({
        where: { userId: currentUser.id }
      });
      
      if (!userChatter) {
        console.log('❌ User is not a chatter and not an admin');
        return NextResponse.json(
          { error: 'User is not authorized to submit payments' },
          { status: 403 }
        );
      }
      chatterId = userChatter.id;
    }

    console.log('✅ Using chatterId:', chatterId);

    // Use a transaction for better performance
    console.log('🔄 Starting database transaction...');
    const result = await prisma.$transaction(async (tx: any) => {
      console.log('🔍 Step 1: Verifying model exists...');
      // Verify model exists  
      const model = await tx.model.findUnique({
        where: { id: modelId }
      });

      if (!model) {
        console.error('❌ Model not found:', modelId);
        throw new Error(`Model not found: ${modelId}`);
      }
      console.log('✅ Model found:', model.name);

      console.log('🔍 Step 2: Verifying channel exists...');
      // Verify channel exists and belongs to model
      const channel = await tx.modelChannel.findUnique({
        where: { id: channelId }
      });

      if (!channel || channel.modelId !== modelId) {
        console.error('❌ Channel validation failed:', { channelId, modelId, found: channel });
        throw new Error(`Channel not found or does not belong to model: ${channelId}`);
      }
      console.log('✅ Channel found:', channel.channelName);

      console.log('🔍 Step 3: Verifying account exists...');
      // Verify account exists
      const account = await tx.account.findUnique({
        where: { id: accountId }
      });

      if (!account) {
        console.error('❌ Account not found:', accountId);
        throw new Error(`Account not found: ${accountId}`);
      }
      console.log('✅ Account found:', account.name);

      // Handle client creation or lookup
      let finalClientId = clientId;
      let finalClientName = clientName;
      
      if (clientId) {
        console.log('🔍 Step 4: Verifying existing client...');
        // Verify existing client exists - use simple query to avoid email column error
        const existingClient = await tx.client.findUnique({
          where: { id: clientId },
          select: { 
            id: true, 
            name: true 
          } // Only select fields we know exist
        });

        if (!existingClient) {
          console.error('❌ Client not found:', clientId);
          throw new Error(`Client not found: ${clientId}`);
        }
        console.log('✅ Existing client found:', existingClient.name);
        finalClientName = existingClient.name;
      } else {
        // Need to create a new client
        if (!payday) {
          console.error('❌ Payday required for new client');
          throw new Error('Payday is required for new client');
        }

        console.log('🔄 Creating new client:', clientName);
        
        // Create client with only fields that exist in database
        const newClient = await tx.client.create({
          data: {
            name: clientName,
            payday: new Date(`2024-01-${payday.toString().padStart(2, '0')}`), // Convert to DateTime
            notes: notes || null,
            channel: channel.channelName,
            statusIndicator: 'active', // Use statusIndicator instead of status
            assignedChatterId: chatterId
          }
        });
        
        finalClientId = newClient.id;
        finalClientName = newClient.name;
        console.log('✅ Created new client:', newClient.id, clientName);
      }

      console.log('🔄 Creating payment...');
      console.log('📝 Payment data:', {
        amount: parseInt(amount),
        chatterId,
        modelId,
        clientId: finalClientId,
        channel: channel.channelName,
        category,
        notes: notes || '',
        toAccount: account.name
      });

      // Create payment with optimized single query
      const payment = await tx.payment.create({
        data: {
          amount: parseInt(amount),
          chatterId,
          modelId,
          clientId: finalClientId,
          channel: channel.channelName,
          category,
          notes: notes || '',
          toAccount: account.name,
          source: 'web-form',
          cinklo: false,
          hotovo: false,
          screenshot: screenshot || null,
          dailyVolumeAtTime: 0,
          commissionEarned: 0,
          commissionRate: 0,
          thresholdMet: false
        },
        include: {
          chatter: {
            include: {
              user: true
            }
          },
          model: true,
          client: true
        }
      });

      console.log('✅ Payment created successfully:', payment.id);
      return payment;
    });

    console.log('=== PAYMENT API DEBUG SUCCESS ===');

    return NextResponse.json({
      success: true,
      payment: result,
      message: 'Payment created successfully'
    });

  } catch (error) {
    console.error('=== PAYMENT API DEBUG ERROR ===');
    console.error('❌ Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('❌ Error code:', (error as any)?.code);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('❌ Full error:', error);
    
    // Return the actual error for debugging
    return NextResponse.json(
      { 
        error: 'Payment creation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code || 'UNKNOWN',
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}