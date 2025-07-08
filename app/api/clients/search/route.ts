import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    console.log('🔍 GET /api/clients/search called with query:', query);
    
    // Return empty results for empty queries
    if (!query || query.length < 1) {
      console.log('📋 Empty query, returning empty results');
      return NextResponse.json({ clients: [] });
    }

    // Search clients in database
    const clients = await prisma.client.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
        tags: true
      },
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('📊 Found', clients.length, 'clients matching query:', query);

    // Format clients for frontend
    const formattedClients = clients.map((client: any) => ({
      id: client.id,
      name: client.name,
      email: null, // Not stored in current schema
      phone: null, // Not stored in current schema
      payday: client.payday ? client.payday.getDate() : null,
      isVIP: client.tags.some((tag: any) => tag.label === 'VIP' || tag.label === 'Premium'),
      status: client.statusIndicator || 'active',
      profileUrl: client.profileUrl,
      channel: client.channel,
      summary: client.notes,
      tags: client.tags.map((tag: any) => tag.label),
      createdAt: client.createdAt.toISOString()
    }));

    return NextResponse.json({ clients: formattedClients });

  } catch (error) {
    console.error('❌ GET client search error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json({ 
      error: 'Failed to search clients', 
      details: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown'
    }, { status: 500 });
  }
} 