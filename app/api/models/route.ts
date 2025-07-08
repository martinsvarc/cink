import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 POST /api/models called');
    
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('✅ Current user:', decoded.username, 'Role:', decoded.role);

    // Parse request body
    const body = await request.json();
    console.log('📝 Request body:', body);

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Model name is required' }, { status: 400 });
    }

    // Map form data to database structure
    const modelData = {
      name: body.name.trim(),
      platform: body.channels?.[0]?.platform || 'Fanvue', // Use first channel's platform as default
      channelHandle: body.channels?.[0]?.name || null,
      adSpend: null,
      commissionRate: null,
      status: 'active'
    };

    console.log('✅ Creating model with data:', modelData);

    // Create model in database
    const createdModel = await prisma.model.create({
      data: modelData,
      include: {
        persona: true,
        channels: true
      }
    });

    console.log('✅ Model created with ID:', createdModel.id);

    // Create model persona if story or tags provided
    if (body.story || body.personalityTags?.length > 0 || body.todayActivity) {
      const personaData = {
        modelId: createdModel.id,
        description: body.story || null,
        tags: body.personalityTags || [],
        statusNote: body.todayActivity || null,
        lastEditedBy: decoded.username
      };

      console.log('✅ Creating persona with data:', personaData);

      await prisma.modelPersona.create({
        data: personaData
      });

      console.log('✅ Persona created for model:', createdModel.id);
    }

    // Create model channels
    if (body.channels?.length > 0) {
      const channelPromises = body.channels.map((channel: any) => {
        const channelData = {
          modelId: createdModel.id,
          platform: channel.platform,
          channelName: channel.name,
          chatterId: null, // Will be set when operators are assigned
          active: channel.isActive !== false
        };

        console.log('✅ Creating channel with data:', channelData);

        return prisma.modelChannel.create({
          data: channelData
        });
      });

      await Promise.all(channelPromises);
      console.log('✅ Created', body.channels.length, 'channels for model:', createdModel.id);
    }

    // Fetch the complete model with all relationships
    const completeModel = await prisma.model.findUnique({
      where: { id: createdModel.id },
      include: {
        persona: true,
        channels: true
      }
    });

    console.log('✅ Model creation completed:', completeModel?.id);

    return NextResponse.json({ 
      success: true, 
      model: completeModel,
      message: 'Model created successfully' 
    });

  } catch (error) {
    console.error('❌ POST error:', error);
    return NextResponse.json({ 
      error: 'Failed to create model', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  } finally {
    // Ensure proper cleanup of connections in development
    if (process.env.NODE_ENV === 'development') {
      await prisma.$disconnect();
    }
  }
}

export async function GET() {
  try {
    console.log('🔍 GET /api/models called');
    
    const models = await prisma.model.findMany({
      include: {
        persona: true,
        channels: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('📊 Found', models.length, 'models in database');

    return NextResponse.json({ models });

  } catch (error) {
    console.error('❌ GET error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch models', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  } finally {
    // Ensure proper cleanup of connections in development
    if (process.env.NODE_ENV === 'development') {
      await prisma.$disconnect();
    }
  }
} 