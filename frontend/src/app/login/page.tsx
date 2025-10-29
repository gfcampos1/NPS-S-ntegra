'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Mail, Lock, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou senha incorretos')
        setLoading(false)
        return
      }

      router.push('/admin/dashboard')
      router.refresh()
    } catch (err) {
      setError('Ocorreu um erro ao fazer login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-sintegra p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl p-10">
          <div className="text-center mb-8">
            <Image
              src="/assets/logos/sintegra-logo.png"
              alt="Sistema NPS"
              width={80}
              height={80}
              priority
              className="mx-auto mb-4 h-20 w-20 object-contain"
            />
            <h1 className="text-3xl font-bold text-sintegra-blue mb-2">Sistema NPS</h1>
            <p className="text-gray-600">Plataforma de feedback Net Promoter Score</p>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Entrar</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sintegra-blue focus:border-transparent outline-none transition"
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sintegra-blue focus:border-transparent outline-none transition"
                  placeholder="********"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="#"
                className="text-sm text-sintegra-blue hover:text-sintegra-blue-dark font-medium underline underline-offset-2"
              >
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sintegra-blue hover:bg-sintegra-blue-dark text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Precisa de acesso?{' '}
              <span className="text-sintegra-blue font-semibold">
                Contate o administrador do sistema
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
