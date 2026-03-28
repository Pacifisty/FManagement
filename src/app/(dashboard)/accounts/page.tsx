'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { AccountForm } from '@/components/accounts/AccountForm'
import { AccountList } from '@/components/accounts/AccountList'
import { Account } from '@/types'
import { Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchAccounts = () => {
    setLoading(true)
    fetch('/api/accounts')
      .then((r) => r.json())
      .then((data) => {
        setAccounts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const payable = accounts.filter((a) => a.type === 'payable').reduce((s, a) => s + a.value, 0)
  const receivable = accounts.filter((a) => a.type === 'receivable').reduce((s, a) => s + a.value, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contas a Pagar / Receber</h1>
          <p className="text-muted-foreground">Gerencie suas obrigações financeiras</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-600">Total a Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(payable)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-green-600">Total a Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(receivable)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : (
            <AccountList accounts={accounts} onRefresh={fetchAccounts} />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <AccountForm
            onSuccess={() => { setDialogOpen(false); fetchAccounts() }}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
