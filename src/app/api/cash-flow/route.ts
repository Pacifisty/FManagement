import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subMonths, startOfMonth, endOfMonth } from 'date-fns'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = session.user.companyId
  const now = new Date()
  const sixMonthsAgo = startOfMonth(subMonths(now, 5))
  const endOfCurrentMonth = endOfMonth(now)

  const [revenues, expenses] = await Promise.all([
    prisma.revenue.findMany({
      where: { companyId, date: { gte: sixMonthsAgo, lte: endOfCurrentMonth } },
      include: { category: true },
      orderBy: { date: 'asc' },
    }),
    prisma.expense.findMany({
      where: { companyId, dueDate: { gte: sixMonthsAgo, lte: endOfCurrentMonth } },
      include: { category: true },
      orderBy: { dueDate: 'asc' },
    }),
  ])

  const entries = [
    ...revenues.map((r) => ({
      id: r.id,
      description: r.description,
      value: r.value,
      date: r.date.toISOString(),
      type: 'revenue' as const,
      status: r.status,
      category: r.category.name,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      description: e.description,
      value: e.value,
      date: e.dueDate.toISOString(),
      type: 'expense' as const,
      status: e.status,
      category: e.category.name,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return NextResponse.json(entries)
}
