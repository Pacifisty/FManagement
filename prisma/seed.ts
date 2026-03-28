import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { subMonths, startOfMonth, addDays } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.revenue.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.account.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()

  // Create company
  const company = await prisma.company.create({
    data: {
      name: 'Demo Company',
      cnpj: '12.345.678/0001-90',
      phone: '(11) 99999-9999',
      email: 'contato@democompany.com',
      currency: 'BRL',
    },
  })

  // Create categories
  const revenueCategories = await Promise.all([
    prisma.category.create({ data: { name: 'Venda de Produto', type: 'revenue', companyId: company.id } }),
    prisma.category.create({ data: { name: 'Prestação de Serviço', type: 'revenue', companyId: company.id } }),
    prisma.category.create({ data: { name: 'Comissão', type: 'revenue', companyId: company.id } }),
    prisma.category.create({ data: { name: 'Outros', type: 'revenue', companyId: company.id } }),
  ])

  const expenseCategories = await Promise.all([
    prisma.category.create({ data: { name: 'Aluguel', type: 'expense', companyId: company.id } }),
    prisma.category.create({ data: { name: 'Energia', type: 'expense', companyId: company.id } }),
    prisma.category.create({ data: { name: 'Folha de Pagamento', type: 'expense', companyId: company.id } }),
    prisma.category.create({ data: { name: 'Marketing', type: 'expense', companyId: company.id } }),
    prisma.category.create({ data: { name: 'Transporte', type: 'expense', companyId: company.id } }),
    prisma.category.create({ data: { name: 'Impostos', type: 'expense', companyId: company.id } }),
    prisma.category.create({ data: { name: 'Outros', type: 'expense', companyId: company.id } }),
  ])

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@fmanagement.com',
      password: hashedPassword,
      companyId: company.id,
    },
  })

  // Generate 6 months of data
  const now = new Date()
  const revenueData = [
    { description: 'Venda de Software', client: 'Tech Corp', multiplier: 1.0 },
    { description: 'Consultoria', client: 'Business SA', multiplier: 0.6 },
    { description: 'Manutenção Mensal', client: 'Global Inc', multiplier: 0.4 },
    { description: 'Projeto Especial', client: 'StartUp XYZ', multiplier: 0.8 },
  ]

  for (let i = 5; i >= 0; i--) {
    const monthDate = startOfMonth(subMonths(now, i))

    for (let j = 0; j < revenueData.length; j++) {
      const rd = revenueData[j]
      const baseValue = 15000 + Math.floor(Math.random() * 10000)
      await prisma.revenue.create({
        data: {
          description: rd.description,
          client: rd.client,
          value: Math.round(baseValue * rd.multiplier * 100) / 100,
          date: addDays(monthDate, 5 + j * 5),
          categoryId: revenueCategories[j % revenueCategories.length].id,
          paymentMethod: ['pix', 'transferencia', 'boleto'][j % 3],
          status: i > 0 ? 'received' : ['received', 'pending'][j % 2],
          companyId: company.id,
          createdById: user.id,
        },
      })
    }

    // Expenses
    const expenseData = [
      { description: 'Aluguel do Escritório', supplier: 'Imobiliária ABC', value: 3500, catIdx: 0 },
      { description: 'Conta de Energia', supplier: 'Distribuidora EE', value: 850, catIdx: 1 },
      { description: 'Salários', supplier: null, value: 18000, catIdx: 2 },
      { description: 'Google Ads', supplier: 'Google', value: 2000, catIdx: 3 },
      { description: 'Combustível', supplier: 'Posto BR', value: 600, catIdx: 4 },
      { description: 'IRPJ', supplier: 'Receita Federal', value: 1500, catIdx: 5 },
    ]

    for (let j = 0; j < expenseData.length; j++) {
      const ed = expenseData[j]
      const isPaid = i > 0 || j < 3
      await prisma.expense.create({
        data: {
          description: ed.description,
          supplier: ed.supplier,
          value: ed.value + Math.floor(Math.random() * 200),
          dueDate: addDays(monthDate, 10 + j * 3),
          paymentDate: isPaid ? addDays(monthDate, 10 + j * 3) : null,
          categoryId: expenseCategories[ed.catIdx].id,
          paymentMethod: isPaid ? 'transferencia' : undefined,
          status: isPaid ? 'paid' : 'pending',
          companyId: company.id,
          createdById: user.id,
        },
      })
    }
  }

  // Create some accounts
  await prisma.account.createMany({
    data: [
      {
        type: 'receivable',
        description: 'Fatura Cliente ABC - Dezembro',
        value: 12500,
        dueDate: addDays(now, 15),
        status: 'pending',
        companyId: company.id,
      },
      {
        type: 'payable',
        description: 'Fornecedor TechParts - NF 001',
        value: 5400,
        dueDate: addDays(now, 7),
        status: 'pending',
        companyId: company.id,
      },
      {
        type: 'receivable',
        description: 'Projeto Beta - Parcela 2/3',
        value: 8000,
        dueDate: addDays(now, 30),
        status: 'pending',
        companyId: company.id,
      },
      {
        type: 'payable',
        description: 'Serviços de Cloud',
        value: 1800,
        dueDate: addDays(now, 5),
        status: 'overdue',
        companyId: company.id,
      },
    ],
  })

  console.log('✅ Seed completed!')
  console.log('Demo credentials:')
  console.log('  Email: demo@fmanagement.com')
  console.log('  Password: demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
