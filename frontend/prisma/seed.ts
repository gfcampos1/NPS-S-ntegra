import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário admin padrão
  const adminPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sintegra.com.br' },
    update: {},
    create: {
      email: 'admin@sintegra.com.br',
      name: 'Administrador',
      password: adminPassword,
      role: 'SUPER_ADMIN',
    },
  })

  console.log('✅ Usuário admin criado:', admin.email)

  // Criar templates de email padrão
  const welcomeTemplate = await prisma.emailTemplate.upsert({
    where: { name: 'welcome_survey' },
    update: {},
    create: {
      name: 'welcome_survey',
      subject: 'Sua opinião é muito importante para nós!',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4169B1;">Olá {name}!</h2>
          <p>Gostaríamos de conhecer sua opinião sobre nossos serviços.</p>
          <p>Por favor, dedique alguns minutos para responder nossa pesquisa de satisfação.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{link}" style="background-color: #4169B1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Responder Pesquisa
            </a>
          </div>
          <p style="color: #6B6B6B; font-size: 12px;">Este link é válido até {expiryDate}</p>
        </div>
      `,
      textContent: 'Olá {name}! Sua opinião é importante. Responda nossa pesquisa: {link}',
    },
  })

  console.log('✅ Template de email criado:', welcomeTemplate.name)

  // Criar configurações padrão do sistema
  await prisma.settings.upsert({
    where: { key: 'nps_target' },
    update: {},
    create: {
      key: 'nps_target',
      value: { medicos: 50, distribuidores: 60 },
      description: 'Meta de NPS por tipo de respondente',
    },
  })

  await prisma.settings.upsert({
    where: { key: 'email_sender' },
    update: {},
    create: {
      key: 'email_sender',
      value: { name: 'Síntegra NPS', email: 'nps@sintegra.com.br' },
      description: 'Configuração do remetente de emails',
    },
  })

  await prisma.settings.upsert({
    where: { key: 'response_expiration_days' },
    update: {},
    create: {
      key: 'response_expiration_days',
      value: 30,
      description: 'Dias até expiração do link de resposta',
    },
  })

  console.log('✅ Configurações do sistema criadas')

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
