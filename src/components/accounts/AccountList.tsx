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
import { AccountForm } from './AccountForm'
import { Account } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface AccountListProps {
  accounts: Account[]
  onRefresh: () => void
}

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'outline' }> = {
  paid: { label: 'Pago', variant: 'success' },
  received: { label: 'Recebido', variant: 'success' },
  pending: { label: 'Pendente', variant: 'warning' },
  overdue: { label: 'Vencido', variant: 'destructive' },
}

export function AccountList({ accounts, onRefresh }: AccountListProps) {
  const [editAccount, setEditAccount] = useState<Account | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return

    const res = await fetch(`/api/accounts/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    if (res.ok) {
      toast.success('Conta excluída!')
      onRefresh()
    } else {
      toast.error('Erro ao excluir')
    }
  }

  return (
    <>
      {accounts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma conta encontrada.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => {
              const status = statusLabels[account.status] || { label: account.status, variant: 'outline' as const }
              return (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.description}</TableCell>
                  <TableCell>
                    <Badge variant={account.type === 'payable' ? 'destructive' : 'success'}>
                      {account.type === 'payable' ? 'A Pagar' : 'A Receber'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(account.dueDate)}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${account.type === 'payable' ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(account.value)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditAccount(account); setDialogOpen(true) }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(account.id)} className="text-red-500 hover:text-red-700">
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
        <DialogContent className="max-w-lg">
          <AccountForm
            account={editAccount}
            onSuccess={() => { setDialogOpen(false); onRefresh() }}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir Conta"
        description="Deseja excluir esta conta? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}

