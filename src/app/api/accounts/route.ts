import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = { companyId: session.user.companyId }
  if (type) where.type = type
  if (status) where.status = status

  const accounts = await prisma.account.findMany({
    where,
    orderBy: { dueDate: 'asc' },
  })

  return NextResponse.json(accounts)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { type, description, value, dueDate, status } = body

    if (!type || !description || !value || !dueDate) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const account = await prisma.account.create({
      data: {
        type,
        description,
        value: parseFloat(value),
        dueDate: new Date(dueDate),
        status: status || 'pending',
        companyId: session.user.companyId,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Account POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
