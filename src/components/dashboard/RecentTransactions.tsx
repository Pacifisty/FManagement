'use client'

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
import { RecentTransaction } from '@/types'

interface RecentTransactionsProps {
  transactions: RecentTransaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhuma transação encontrada</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.description}</TableCell>
                  <TableCell>
                    <Badge variant={tx.type === 'revenue' ? 'success' : 'destructive'}>
                      {tx.type === 'revenue' ? 'Receita' : 'Despesa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(tx.date)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tx.status}</Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      tx.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'revenue' ? '+' : '-'}
                    {formatCurrency(tx.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
