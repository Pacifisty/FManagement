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
  const status = searchParams.get('status')

  const where: Record<string, unknown> = { companyId: session.user.companyId }

  if (month && year) {
    const start = new Date(parseInt(year), parseInt(month) - 1, 1)
    const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
    where.dueDate = { gte: start, lte: end }
  }

  if (status) where.status = status

  const expenses = await prisma.expense.findMany({
    where,
    include: { category: true },
    orderBy: { dueDate: 'desc' },
  })

  return NextResponse.json(expenses)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      description,
      supplier,
      value,
      dueDate,
      paymentDate,
      categoryId,
      paymentMethod,
      type,
      recurring,
      costCenter,
      status,
      notes,
    } = body

    if (!description || !value || !dueDate || !categoryId) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        supplier,
        value: parseFloat(value),
        dueDate: new Date(dueDate),
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        categoryId,
        paymentMethod,
        type,
        recurring: recurring || false,
        costCenter,
        status: status || 'pending',
        notes,
        companyId: session.user.companyId,
        createdById: session.user.id,
      },
      include: { category: true },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Expense POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
