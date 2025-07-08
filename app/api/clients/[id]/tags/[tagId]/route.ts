import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; tagId: string } }
) {
  try {
    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: params.id }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if tag exists for this client
    const tag = await prisma.clientTag.findFirst({
      where: {
        id: params.tagId,
        clientId: params.id
      }
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found for this client' },
        { status: 404 }
      );
    }

    // Delete the tag
    await prisma.clientTag.delete({
      where: {
        id: params.tagId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing tag from client:', error);
    return NextResponse.json(
      { error: 'Failed to remove tag from client' },
      { status: 500 }
    );
  }
}

// Alternative endpoint to delete by label
export async function POST(
  request: Request,
  { params }: { params: { id: string; tagId: string } }
) {
  try {
    const { action } = await request.json();
    
    if (action === 'remove') {
      // Check if client exists
      const client = await prisma.client.findUnique({
        where: { id: params.id }
      });

      if (!client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }

      // Delete by label (tagId is actually the label in this case)
      const deletedTag = await prisma.clientTag.deleteMany({
        where: {
          clientId: params.id,
          label: params.tagId
        }
      });

      if (deletedTag.count === 0) {
        return NextResponse.json(
          { error: 'Tag not found for this client' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, deleted: deletedTag.count });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error removing tag from client:', error);
    return NextResponse.json(
      { error: 'Failed to remove tag from client' },
      { status: 500 }
    );
  }
} 