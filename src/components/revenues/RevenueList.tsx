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
import { RevenueForm } from './RevenueForm'
import { Revenue } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface RevenueListProps {
  revenues: Revenue[]
  onRefresh: () => void
}

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'outline' }> = {
  received: { label: 'Recebido', variant: 'success' },
  pending: { label: 'Pendente', variant: 'warning' },
  overdue: { label: 'Vencido', variant: 'destructive' },
}

export function RevenueList({ revenues, onRefresh }: RevenueListProps) {
  const [editRevenue, setEditRevenue] = useState<Revenue | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta receita?')) return

    const res = await fetch(`/api/revenues/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Receita excluída!')
      onRefresh()
    } else {
      toast.error('Erro ao excluir')
    }
  }

  const handleEdit = (revenue: Revenue) => {
    setEditRevenue(revenue)
    setDialogOpen(true)
  }

  return (
    <>
      {revenues.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma receita encontrada. Clique em &quot;Nova Receita&quot; para começar.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {revenues.map((revenue) => {
              const status = statusLabels[revenue.status] || { label: revenue.status, variant: 'outline' as const }
              return (
                <TableRow key={revenue.id}>
                  <TableCell className="font-medium">{revenue.description}</TableCell>
                  <TableCell className="text-muted-foreground">{revenue.client || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{revenue.category?.name}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(revenue.date)}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {formatCurrency(revenue.value)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(revenue)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(revenue.id)} className="text-red-500 hover:text-red-700">
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
          <RevenueForm
            revenue={editRevenue}
            onSuccess={() => { setDialogOpen(false); onRefresh() }}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
