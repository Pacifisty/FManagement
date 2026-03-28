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
import { CategoryForm } from './CategoryForm'
import { Category } from '@/types'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface CategoryListProps {
  categories: Category[]
  onRefresh: () => void
}

export function CategoryList({ categories, onRefresh }: CategoryListProps) {
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return

    const res = await fetch(`/api/categories/${deleteId}`, { method: 'DELETE' })
    setDeleteId(null)
    if (res.ok) {
      toast.success('Categoria excluída!')
      onRefresh()
    } else {
      toast.error('Erro ao excluir. Verifique se não há registros vinculados.')
    }
  }

  return (
    <>
      {categories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhuma categoria encontrada.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell>
                  <Badge variant={cat.type === 'revenue' ? 'success' : 'destructive'}>
                    {cat.type === 'revenue' ? 'Receita' : 'Despesa'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditCategory(cat); setDialogOpen(true) }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteId(cat.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <CategoryForm
            category={editCategory}
            onSuccess={() => { setDialogOpen(false); onRefresh() }}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir Categoria"
        description="Deseja excluir esta categoria? Isso pode afetar registros existentes."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}

