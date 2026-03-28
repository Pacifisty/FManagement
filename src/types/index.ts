export interface Category {
  id: string
  name: string
  type: string
  companyId: string
}

export interface Revenue {
  id: string
  description: string
  client?: string | null
  value: number
  date: string | Date
  categoryId: string
  category?: Category
  paymentMethod?: string | null
  status: string
  notes?: string | null
  companyId: string
  createdById: string
  createdAt: string | Date
}

export interface Expense {
  id: string
  description: string
  supplier?: string | null
  value: number
  dueDate: string | Date
  paymentDate?: string | Date | null
  categoryId: string
  category?: Category
  paymentMethod?: string | null
  type?: string | null
  recurring: boolean
  costCenter?: string | null
  status: string
  notes?: string | null
  companyId: string
  createdById: string
  createdAt: string | Date
}

export interface Account {
  id: string
  type: string
  description: string
  value: number
  dueDate: string | Date
  status: string
  companyId: string
  createdAt: string | Date
}

export interface Company {
  id: string
  name: string
  cnpj?: string | null
  phone?: string | null
  email?: string | null
  currency: string
  createdAt: string | Date
}

export interface DashboardStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  cashBalance: number
  monthlyData: MonthlyData[]
  expensesByCategory: CategoryData[]
  recentTransactions: RecentTransaction[]
}

export interface MonthlyData {
  month: string
  revenue: number
  expenses: number
}

export interface CategoryData {
  name: string
  value: number
}

export interface RecentTransaction {
  id: string
  description: string
  value: number
  date: string
  type: 'revenue' | 'expense'
  status: string
}
