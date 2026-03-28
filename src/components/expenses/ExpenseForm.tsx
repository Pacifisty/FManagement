'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Category, Expense } from '@/types'
import { toast } from 'sonner'

interface ExpenseFormProps {
  expense?: Expense | null
  onSuccess: () => void
  onCancel: () => void
}

export function ExpenseForm({ expense, onSuccess, onCancel }: ExpenseFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    description: expense?.description || '',
    supplier: expense?.supplier || '',
    value: expense?.value?.toString() || '',
    dueDate: expense?.dueDate ? new Date(expense.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    paymentDate: expense?.paymentDate ? new Date(expense.paymentDate).toISOString().split('T')[0] : '',
    categoryId: expense?.categoryId || '',
    paymentMethod: expense?.paymentMethod || '',
    type: expense?.type || '',
    recurring: expense?.recurring || false,
    costCenter: expense?.costCenter || '',
    status: expense?.status || 'pending',
    notes: expense?.notes || '',
  })

  useEffect(() => {
    fetch('/api/categories?type=expense')
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description || !form.value || !form.dueDate || !form.categoryId) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    setLoading(true)

    try {
      const url = expense ? `/api/expenses/${expense.id}` : '/api/expenses'
      const method = expense ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao salvar')
      }

      toast.success(expense ? 'Despesa atualizada!' : 'Despesa criada!')
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{expense ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-2">
            <Label>Descrição *</Label>
            <Input
              placeholder="Ex: Aluguel do escritório"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Fornecedor</Label>
            <Input
              placeholder="Nome do fornecedor"
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Valor (R$) *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Vencimento *</Label>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Data Pagamento</Label>
            <Input
              type="date"
              value={form.paymentDate}
              onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Centro de Custo</Label>
            <Input
              placeholder="Ex: Administrativo"
              value={form.costCenter}
              onChange={(e) => setForm({ ...form, costCenter: e.target.value })}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Observações adicionais..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>
      </form>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogFooter>
    </>
  )
}
