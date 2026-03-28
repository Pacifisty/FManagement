import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = session.user.companyId
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const [revenueResult, expenseResult] = await Promise.all([
    prisma.revenue.aggregate({
      where: { companyId, date: { gte: monthStart, lte: monthEnd } },
      _sum: { value: true },
    }),
    prisma.expense.aggregate({
      where: { companyId, dueDate: { gte: monthStart, lte: monthEnd } },
      _sum: { value: true },
    }),
  ])

  const totalRevenue = revenueResult._sum.value || 0
  const totalExpenses = expenseResult._sum.value || 0
  const netProfit = totalRevenue - totalExpenses

  const [allRevenue, allExpenses] = await Promise.all([
    prisma.revenue.aggregate({
      where: { companyId, status: 'received' },
      _sum: { value: true },
    }),
    prisma.expense.aggregate({
      where: { companyId, status: 'paid' },
      _sum: { value: true },
    }),
  ])
  const cashBalance = (allRevenue._sum.value || 0) - (allExpenses._sum.value || 0)

  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)

    const [rev, exp] = await Promise.all([
      prisma.revenue.aggregate({
        where: { companyId, date: { gte: start, lte: end } },
        _sum: { value: true },
      }),
      prisma.expense.aggregate({
        where: { companyId, dueDate: { gte: start, lte: end } },
        _sum: { value: true },
      }),
    ])

    monthlyData.push({
      month: format(date, 'MMM/yy'),
      revenue: rev._sum.value || 0,
      expenses: exp._sum.value || 0,
    })
  }

  const expensesByCategory = await prisma.expense.groupBy({
    by: ['categoryId'],
    where: { companyId, dueDate: { gte: monthStart, lte: monthEnd } },
    _sum: { value: true },
  })

  const categoryIds = expensesByCategory.map((e) => e.categoryId)
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  })
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))

  const expByCat = expensesByCategory.map((e) => ({
    name: categoryMap[e.categoryId] || 'Unknown',
    value: e._sum.value || 0,
  }))

  const [recentRevenues, recentExpenses] = await Promise.all([
    prisma.revenue.findMany({
      where: { companyId },
      orderBy: { date: 'desc' },
      take: 5,
      include: { category: true },
    }),
    prisma.expense.findMany({
      where: { companyId },
      orderBy: { dueDate: 'desc' },
      take: 5,
      include: { category: true },
    }),
  ])

  const recentTransactions = [
    ...recentRevenues.map((r) => ({
      id: r.id,
      description: r.description,
      value: r.value,
      date: r.date.toISOString(),
      type: 'revenue' as const,
      status: r.status,
      category: r.category.name,
    })),
    ...recentExpenses.map((e) => ({
      id: e.id,
      description: e.description,
      value: e.value,
      date: e.dueDate.toISOString(),
      type: 'expense' as const,
      status: e.status,
      category: e.category.name,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  return NextResponse.json({
    totalRevenue,
    totalExpenses,
    netProfit,
    cashBalance,
    monthlyData,
    expensesByCategory: expByCat,
    recentTransactions,
  })
}
