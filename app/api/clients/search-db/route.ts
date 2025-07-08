import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    console.log('🔍 GET /api/clients/search-db called with query:', query);
    
    // Return empty results for empty queries
    if (!query || query.length < 1) {
      console.log('📋 Empty query, returning empty results');
      return NextResponse.json({ clients: [] });
    }

    // Try to import and use Prisma
    let prisma;
    try {
      const prismaModule = await import('@/lib/prisma');
      prisma = prismaModule.prisma;
      console.log('✅ Prisma client imported successfully');
    } catch (prismaError) {
      console.error('❌ Failed to import Prisma client:', prismaError);
      return NextResponse.json({ 
        error: 'Database not available', 
        details: 'Prisma client import failed' 
      }, { status: 500 });
    }

    // Test database connectivity
    try {
      const clientCount = await prisma.client.count();
      console.log('✅ Database connection OK. Total clients:', clientCount);
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: dbError instanceof Error ? dbError.message : 'Unknown database error' 
      }, { status: 500 });
    }

    // Verify authentication - make this optional for debugging
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      console.log('⚠️ No auth token found, proceeding without auth for debugging');
    } else {
      try {
        const decoded = await verifyToken(token);
        if (!decoded) {
          console.log('⚠️ Invalid token, proceeding without auth for debugging');
        } else {
          console.log('✅ Authentication successful for user:', decoded.username);
        }
      } catch (authError) {
        console.error('❌ Auth verification failed:', authError);
      }
    }

    console.log('🔍 Searching for clients with query:', query);

    // Simplified search query
    const clients = await prisma.client.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        notes: true,
        payday: true,
        statusIndicator: true,
        profileUrl: true,
        channel: true
      },
      take: 10,
      orderBy: {
        name: 'asc'
      }
    });

    console.log('📊 Found', clients.length, 'clients matching query:', query);

    return NextResponse.json({ clients });

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