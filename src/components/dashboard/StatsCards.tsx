'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StatsCardsProps {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  cashBalance: number
}

export function StatsCards({ totalRevenue, totalExpenses, netProfit, cashBalance }: StatsCardsProps) {
  const stats = [
    {
      title: 'Receita do Mês',
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Despesas do Mês',
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Lucro Líquido',
      value: formatCurrency(netProfit),
      icon: DollarSign,
      iconColor: netProfit >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: netProfit >= 0 ? 'bg-blue-50' : 'bg-red-50',
    },
    {
      title: 'Saldo em Caixa',
      value: formatCurrency(cashBalance),
      icon: Wallet,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
