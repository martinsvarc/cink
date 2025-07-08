import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { label } = await request.json();
    
    if (!label) {
      return NextResponse.json(
        { error: 'Label is required' },
        { status: 400 }
      );
    }

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

    // Check if tag already exists for this client
    const existingTag = await prisma.clientTag.findFirst({
      where: {
        clientId: params.id,
        label: label
      }
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag already exists for this client' },
        { status: 400 }
      );
    }

    // Create new tag
    const newTag = await prisma.clientTag.create({
      data: {
        label: label,
        clientId: params.id
      }
    });

    return NextResponse.json(newTag);
  } catch (error) {
    console.error('Error adding tag to client:', error);
    return NextResponse.json(
      { error: 'Failed to add tag to client' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get all tags for this client
    const tags = await prisma.clientTag.findMany({
      where: { clientId: params.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching client tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client tags' },
      { status: 500 }
    );
  }
} 