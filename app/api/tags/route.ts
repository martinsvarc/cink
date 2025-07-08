import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all unique tags from client tags
    const tags = await prisma.clientTag.findMany({
      select: {
        label: true,
        id: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get unique tags with count
    const tagGroups = await prisma.clientTag.groupBy({
      by: ['label'],
      _count: {
        label: true
      }
    });

    // Combine the data
    const uniqueTags = tagGroups.map((group: any) => ({
      label: group.label,
      count: group._count.label,
      createdAt: tags.find((tag: any) => tag.label === group.label)?.createdAt || new Date()
    }));

    return NextResponse.json(uniqueTags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { label, clientId } = await request.json();
    
    if (!label || !clientId) {
      return NextResponse.json(
        { error: 'Label and clientId are required' },
        { status: 400 }
      );
    }

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId }
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
        clientId: clientId,
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
        clientId: clientId
      }
    });

    return NextResponse.json(newTag);
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
} 