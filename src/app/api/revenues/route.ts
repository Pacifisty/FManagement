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
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  const where: Record<string, unknown> = { companyId: session.user.companyId }

  if (month && year) {
    const start = new Date(parseInt(year), parseInt(month) - 1, 1)
    const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
    where.date = { gte: start, lte: end }
  }

  const revenues = await prisma.revenue.findMany({
    where,
    include: { category: true },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(revenues)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { description, client, value, date, categoryId, paymentMethod, status, notes } = body

    if (!description || !value || !date || !categoryId) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const revenue = await prisma.revenue.create({
      data: {
        description,
        client,
        value: parseFloat(value),
        date: new Date(date),
        categoryId,
        paymentMethod,
        status: status || 'received',
        notes,
        companyId: session.user.companyId,
        createdById: session.user.id,
      },
      include: { category: true },
    })

    return NextResponse.json(revenue, { status: 201 })
  } catch (error) {
    console.error('Revenue POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
