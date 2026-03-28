'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

interface CashFlowEntry {
  id: string
  description: string
  value: number
  date: string
  type: 'revenue' | 'expense'
  status: string
  category: string
}

export default function CashFlowPage() {
  const [entries, setEntries] = useState<CashFlowEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cash-flow')
      .then((r) => r.json())
      .then((data) => {
        setEntries(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const totalIn = entries.filter((e) => e.type === 'revenue').reduce((s, e) => s + e.value, 0)
  const totalOut = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.value, 0)
  const balance = totalIn - totalOut

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fluxo de Caixa</h1>
        <p className="text-muted-foreground">Entradas e saídas cronológicas</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ArrowDownCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Entradas</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalIn)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ArrowUpCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Saídas</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalOut)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações (últimos 6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma movimentação encontrada</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={`${entry.type}-${entry.id}`}>
                    <TableCell className="text-muted-foreground">{formatDate(entry.date)}</TableCell>
                    <TableCell className="font-medium">{entry.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {entry.type === 'revenue' ? (
                          <ArrowDownCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowUpCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={entry.type === 'revenue' ? 'text-green-600' : 'text-red-600'}>
                          {entry.type === 'revenue' ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.status}</Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        entry.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {entry.type === 'revenue' ? '+' : '-'}
                      {formatCurrency(entry.value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
