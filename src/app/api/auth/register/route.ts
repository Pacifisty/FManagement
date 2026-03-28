import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, companyName } = body

    if (!name || !email || !password || !companyName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const company = await prisma.company.create({
      data: { name: companyName, currency: 'BRL' },
    })

    // Create default categories
    const revenueCategories = ['Venda de Produto', 'Prestação de Serviço', 'Comissão', 'Outros']
    const expenseCategories = [
      'Aluguel',
      'Energia',
      'Folha de Pagamento',
      'Marketing',
      'Transporte',
      'Impostos',
      'Outros',
    ]

    await prisma.category.createMany({
      data: [
        ...revenueCategories.map((name) => ({ name, type: 'revenue', companyId: company.id })),
        ...expenseCategories.map((name) => ({ name, type: 'expense', companyId: company.id })),
      ],
    })

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyId: company.id,
      },
    })

    return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
