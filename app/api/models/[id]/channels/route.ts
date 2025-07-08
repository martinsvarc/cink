import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 GET /api/models/[id]/channels called for model:', params.id);
    
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch channels for this model
    const channels = await prisma.modelChannel.findMany({
      where: {
        modelId: params.id,
        active: true
      },
      include: {
        chatter: {
          include: {
            user: {
              select: {
                name: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        platform: 'asc'
      }
    });

    console.log('📊 Found', channels.length, 'channels for model:', params.id);

    return NextResponse.json({ channels });

  } catch (error) {
    console.error('❌ GET channels error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch channels', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  } finally {
    // Ensure proper cleanup of connections in development
    if (process.env.NODE_ENV === 'development') {
      await prisma.$disconnect();
    }
  }
} 