'use client'

import { useEffect, useState } from 'react'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RevenueExpenseChart } from '@/components/dashboard/RevenueExpenseChart'
import { ExpenseByCategoryChart } from '@/components/dashboard/ExpenseByCategoryChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { DashboardStats } from '@/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Erro ao carregar dados</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das suas finanças</p>
      </div>

      <StatsCards
        totalRevenue={stats.totalRevenue}
        totalExpenses={stats.totalExpenses}
        netProfit={stats.netProfit}
        cashBalance={stats.cashBalance}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueExpenseChart data={stats.monthlyData} />
        <ExpenseByCategoryChart data={stats.expensesByCategory} />
      </div>

      <RecentTransactions transactions={stats.recentTransactions} />
    </div>
  )
}
