import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 PATCH /api/models/' + params.id + ' called');
    
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

    // Validate model exists
    const existingModel = await prisma.model.findUnique({
      where: { id: params.id },
      include: {
        persona: true,
        channels: true
      }
    });

    if (!existingModel) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    console.log('✅ Found existing model:', existingModel.name);

    // Update basic model fields
    const modelUpdateData: any = {};
    if (body.name) modelUpdateData.name = body.name.trim();
    if (body.channels?.[0]?.platform) modelUpdateData.platform = body.channels[0].platform;
    if (body.channels?.[0]?.name) modelUpdateData.channelHandle = body.channels[0].name;

    let updatedModel;
    if (Object.keys(modelUpdateData).length > 0) {
      updatedModel = await prisma.model.update({
        where: { id: params.id },
        data: modelUpdateData,
        include: {
          persona: true,
          channels: true
        }
      });
      console.log('✅ Updated model basic fields');
    } else {
      updatedModel = existingModel;
    }

    // Update or create persona
    if (body.story !== undefined || body.personalityTags !== undefined || body.todayActivity !== undefined) {
      const personaData = {
        description: body.story || null,
        tags: body.personalityTags || [],
        statusNote: body.todayActivity || null,
        lastEditedBy: decoded.username,
        updatedAt: new Date()
      };

      if (existingModel.persona) {
        // Update existing persona
        await prisma.modelPersona.update({
          where: { modelId: params.id },
          data: personaData
        });
        console.log('✅ Updated existing persona');
      } else {
        // Create new persona
        await prisma.modelPersona.create({
          data: {
            modelId: params.id,
            ...personaData
          }
        });
        console.log('✅ Created new persona');
      }
    }

    // Update channels
    if (body.channels && Array.isArray(body.channels)) {
      // Remove all existing channels
      await prisma.modelChannel.deleteMany({
        where: { modelId: params.id }
      });

      // Create new channels
      if (body.channels.length > 0) {
        const channelPromises = body.channels.map((channel: any) => {
          return prisma.modelChannel.create({
            data: {
              modelId: params.id,
              platform: channel.platform,
              channelName: channel.name,
              chatterId: null,
              active: channel.isActive !== false
            }
          });
        });

        await Promise.all(channelPromises);
        console.log('✅ Updated channels:', body.channels.length);
      }
    }

    // Fetch the complete updated model
    const completeModel = await prisma.model.findUnique({
      where: { id: params.id },
      include: {
        persona: true,
        channels: true
      }
    });

    console.log('✅ Model update completed:', completeModel?.id);

    return NextResponse.json({ 
      success: true, 
      model: completeModel,
      message: 'Model updated successfully' 
    });

  } catch (error) {
    console.error('❌ PATCH error:', error);
    return NextResponse.json({ 
      error: 'Failed to update model', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  } finally {
    if (process.env.NODE_ENV === 'development') {
      await prisma.$disconnect();
    }
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 DELETE /api/models/' + params.id + ' called');
    
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

    // Verify model exists
    const existingModel = await prisma.model.findUnique({
      where: { id: params.id },
      include: {
        persona: true,
        channels: true,
        payments: true
      }
    });

    if (!existingModel) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    console.log('✅ Found model to delete:', existingModel.name);

    // Check if model has payments (prevent deletion if it has financial history)
    if (existingModel.payments && existingModel.payments.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete model with payment history', 
        details: `This model has ${existingModel.payments.length} payment records` 
      }, { status: 400 });
    }

    // Delete related data first (due to foreign key constraints)
    
    // Delete persona
    if (existingModel.persona) {
      await prisma.modelPersona.delete({
        where: { modelId: params.id }
      });
      console.log('✅ Deleted persona');
    }

    // Delete channels
    if (existingModel.channels && existingModel.channels.length > 0) {
      await prisma.modelChannel.deleteMany({
        where: { modelId: params.id }
      });
      console.log('✅ Deleted channels');
    }

    // Delete the model
    await prisma.model.delete({
      where: { id: params.id }
    });

    console.log('✅ Model deleted successfully:', params.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Model deleted successfully' 
    });

  } catch (error) {
    console.error('❌ DELETE error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete model', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  } finally {
    if (process.env.NODE_ENV === 'development') {
      await prisma.$disconnect();
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 GET /api/models/' + params.id + ' called');
    
    const model = await prisma.model.findUnique({
      where: { id: params.id },
      include: {
        persona: true,
        channels: true
      }
    });

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    console.log('📊 Found model:', model.name);

    return NextResponse.json({ model });

  } catch (error) {
    console.error('❌ GET error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch model', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  } finally {
    if (process.env.NODE_ENV === 'development') {
      await prisma.$disconnect();
    }
  }
} 