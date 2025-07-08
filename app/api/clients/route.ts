import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    console.log('🔍 GET /api/clients called');
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const operator = searchParams.get('operator');
    const channel = searchParams.get('channel');
    const status = searchParams.get('status');
    const isVIP = searchParams.get('isVIP');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    console.log('📋 Query parameters:', { search, operator, channel, status, isVIP, tags });

    // Build where clause for database query
    const whereClause: any = {};

    // Search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Channel filter
    if (channel && channel !== 'all') {
      whereClause.channel = channel;
    }

    // Status filter
    if (status && status !== 'all') {
      whereClause.statusIndicator = status;
    }

    // Tag filters
    if (tags && tags.length > 0) {
      whereClause.tags = {
        some: {
          label: { in: tags }
        }
      };
    }

    // Fetch clients from database
    const clients = await prisma.client.findMany({
      where: whereClause,
      include: {
        tags: true,
        assignedChatter: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true
              }
            }
          }
        },
        payments: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('📊 Found', clients.length, 'clients in database');

    // Calculate aggregated data for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client: any) => {
        // Calculate total collected
        const totalCollected = await prisma.payment.aggregate({
          where: { clientId: client.id },
          _sum: { amount: true }
        });

        // Calculate past 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const past7Days = await prisma.payment.aggregate({
          where: {
            clientId: client.id,
            timestamp: { gte: sevenDaysAgo }
          },
          _sum: { amount: true }
        });

        // Calculate average payment
        const avgPayment = await prisma.payment.aggregate({
          where: { clientId: client.id },
          _avg: { amount: true }
        });

        // Check if VIP
        const isVIPClient = client.tags.some((tag: any) => 
          tag.label === 'VIP' || tag.label === 'Premium'
        );

        // Get primary model (most recent payment's model)
        let primaryModel = null;
        if (client.payments[0]) {
          const recentPayments = await prisma.payment.findMany({
            where: { clientId: client.id },
            include: { model: true },
            orderBy: { timestamp: 'desc' },
            take: 1
          });
          primaryModel = recentPayments[0]?.model || null;
        }

        // Format last payment
        const lastPayment = client.payments[0] ? 
          formatTimeAgo(client.payments[0].timestamp) : null;

        return {
          id: client.id,
          name: client.name,
          email: null, // Not stored in current schema
          phone: null, // Not stored in current schema
          assignedOperator: client.assignedChatter?.user?.name || null,
          operatorId: client.assignedChatter?.user?.id || null,
          modelName: primaryModel?.name || null,
          modelId: primaryModel?.id || null,
          channel: client.channel,
          summary: client.notes,
          payday: client.payday || null,
          paydayIndicator: client.payday ? 
            `${client.payday}. den v měsíci` : null,
          totalCollected: totalCollected._sum.amount || 0,
          past7Days: past7Days._sum.amount || 0,
          lastPayment: lastPayment,
          avgPayment: Math.round(avgPayment._avg.amount || 0),
          isVIP: isVIPClient,
          tags: client.tags.map((tag: any) => tag.label),
          status: 'active',
          statusIndicator: client.statusIndicator || 'active',
          riskLevel: 'low', // Default for now
          createdAt: client.createdAt.toISOString(),
          updatedAt: client.createdAt.toISOString(),
          profileUrl: client.profileUrl
        };
      })
    );

    // Apply VIP filter after processing
    let filteredClients = clientsWithStats;
    
    if (isVIP && isVIP !== 'all') {
      const isVIPBool = isVIP === 'true';
      filteredClients = clientsWithStats.filter(client => client.isVIP === isVIPBool);
    }

    // Apply operator filter after processing
    if (operator && operator !== 'all') {
      filteredClients = filteredClients.filter(client => client.assignedOperator === operator);
    }

    console.log('✅ Returning', filteredClients.length, 'filtered clients from database');
    return NextResponse.json(filteredClients);

  } catch (error) {
    console.error('❌ Clients API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch clients', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'právě teď';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minut zpět`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hodin zpět`;
  return `${Math.floor(diffInSeconds / 86400)} dnů zpět`;
}

export async function POST(request: Request) {
  try {
    console.log('🔄 POST /api/clients - Creating new client');
    
    const data = await request.json();
    console.log('📝 Client data received:', data);

    // Validate required fields
    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { error: 'Jméno klienta je povinné' },
        { status: 400 }
      );
    }

    // Use Prisma to create the client in the database
    const newClient = await prisma.client.create({
      data: {
        name: data.name.trim(),
        notes: data.summary || null,
        profileUrl: data.socialLink || null,
        payday: data.payday || null, // Store as integer (1-31)
        channel: data.socialLink ? 
          (data.socialLink.includes('instagram') ? 'Instagram' :
           data.socialLink.includes('twitter') ? 'Twitter' :
           data.socialLink.includes('facebook') ? 'Facebook' :
           data.socialLink.includes('tiktok') ? 'TikTok' :
           data.socialLink.includes('fanvue') ? 'Fanvue' :
           data.socialLink.includes('onlyfans') ? 'OnlyFans' :
           'Other') : null,
        statusIndicator: 'active',
        priorityScore: data.tags?.includes('VIP') || data.tags?.includes('Premium') ? 10 : 5,
      },
      include: {
        tags: true // Include tags in the response
      }
    });

    console.log('✅ Created client in database with ID:', newClient.id);

    // Create client tags if provided
    if (data.tags && data.tags.length > 0) {
      const tagPromises = data.tags.map((tag: string) => 
        prisma.clientTag.create({
          data: {
            clientId: newClient.id,
            label: tag,
            score: tag === 'VIP' || tag === 'Premium' ? 10 : 5
          }
        })
      );
      
      await Promise.all(tagPromises);
      console.log('✅ Created', data.tags.length, 'tags for client');
    }

    // Fetch the complete client with tags
    const completeClient = await prisma.client.findUnique({
      where: { id: newClient.id },
      include: {
        tags: true,
        assignedChatter: {
          include: {
            user: true
          }
        }
      }
    });

    if (!completeClient) {
      throw new Error('Failed to fetch created client');
    }

    // Transform to frontend format
    const clientResponse = {
      id: completeClient.id, // This will be a real CUID!
      name: completeClient.name,
      email: null,
      phone: null,
      profileUrl: completeClient.profileUrl,
      assignedOperator: completeClient.assignedChatter?.user?.name || null,
      channel: completeClient.channel,
      summary: completeClient.notes,
      payday: completeClient.payday || 1,
      paydayIndicator: completeClient.payday ? 
        `${completeClient.payday}. den v měsíci` : 
        '1. den v měsíci',
      totalCollected: 0,
      past7Days: 0,
      lastPayment: null,
      avgPayment: 0,
      isVIP: completeClient.tags.some((tag: any) => tag.label === 'VIP' || tag.label === 'Premium'),
      tags: completeClient.tags.map((tag: any) => tag.label),
      status: 'active',
      statusIndicator: completeClient.statusIndicator,
      riskLevel: 'low',
      createdAt: completeClient.createdAt.toISOString(),
      updatedAt: completeClient.createdAt.toISOString()
    };

    console.log('✅ Returning client with real DB ID:', clientResponse.id);
    return NextResponse.json(clientResponse, { status: 201 });

  } catch (error) {
    console.error('❌ Client creation error:', error);
    return NextResponse.json(
      { 
        error: 'Nepodařilo se vytvořit klienta',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 