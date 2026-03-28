'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { RevenueForm } from '@/components/revenues/RevenueForm'
import { RevenueList } from '@/components/revenues/RevenueList'
import { Revenue } from '@/types'
import { Plus, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function RevenuesPage() {
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchRevenues = () => {
    setLoading(true)
    fetch('/api/revenues')
      .then((r) => r.json())
      .then((data) => {
        setRevenues(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchRevenues()
  }, [])

  const total = revenues.reduce((sum, r) => sum + r.value, 0)
  const received = revenues.filter((r) => r.status === 'received').reduce((sum, r) => sum + r.value, 0)
  const pending = revenues.filter((r) => r.status === 'pending').reduce((sum, r) => sum + r.value, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Receitas</h1>
          <p className="text-muted-foreground">Gerencie suas receitas</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Receita
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{formatCurrency(total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Recebido</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(received)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-xl font-bold text-yellow-600">{formatCurrency(pending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : (
            <RevenueList revenues={revenues} onRefresh={fetchRevenues} />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <RevenueForm
            onSuccess={() => { setDialogOpen(false); fetchRevenues() }}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
