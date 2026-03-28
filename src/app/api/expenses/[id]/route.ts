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

    const expense = await prisma.expense.update({
      where: { id: params.id, companyId: session.user.companyId },
      data: {
        description,
        supplier,
        value: parseFloat(value),
        dueDate: new Date(dueDate),
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        categoryId,
        paymentMethod,
        type,
        recurring,
        costCenter,
        status,
        notes,
      },
      include: { category: true },
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Expense PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.expense.delete({
      where: { id: params.id, companyId: session.user.companyId },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Expense DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
