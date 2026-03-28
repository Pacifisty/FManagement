import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { type, description, value, dueDate, status } = body

    const account = await prisma.account.update({
      where: { id: params.id, companyId: session.user.companyId },
      data: {
        type,
        description,
        value: parseFloat(value),
        dueDate: new Date(dueDate),
        status,
      },
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error('Account PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.account.delete({
      where: { id: params.id, companyId: session.user.companyId },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
