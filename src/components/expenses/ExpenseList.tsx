'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ExpenseForm } from './ExpenseForm'
import { Expense } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface ExpenseListProps {
  expenses: Expense[]
  onRefresh: () => void
}

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'outline' }> = {
  paid: { label: 'Pago', variant: 'success' },
  pending: { label: 'Pendente', variant: 'warning' },
  overdue: { label: 'Vencido', variant: 'destructive' },
}

export function ExpenseList({ expenses, onRefresh }: ExpenseListProps) {
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return

    const res = await fetch(`/api/expenses/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    if (res.ok) {
      toast.success('Despesa excluída!')
      onRefresh()
    } else {
      toast.error('Erro ao excluir')
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditExpense(expense)
    setDialogOpen(true)
  }

  return (
    <>
      {expenses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma despesa encontrada. Clique em &quot;Nova Despesa&quot; para começar.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => {
              const status = statusLabels[expense.status] || { label: expense.status, variant: 'outline' as const }
              return (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell className="text-muted-foreground">{expense.supplier || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category?.name}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(expense.dueDate)}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    {formatCurrency(expense.value)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(expense)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(expense.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <ExpenseForm
            expense={editExpense}
            onSuccess={() => { setDialogOpen(false); onRefresh() }}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir Despesa"
        description="Deseja excluir esta despesa? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}

