import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { toast } from 'sonner'
import { LogIn } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword(data)
    
    if (error) {
      toast.error('Erro ao entrar: ' + error.message)
      setLoading(false)
    } else {
      toast.success('Bem-vindo!')
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2">
          <div className="mx-auto bg-white p-4 rounded-3xl shadow-sm mb-6 inline-block">
            <img src={logoHm} alt="Logo HM" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Recrutamento HM</h1>
          <p className="text-slate-500">Entre com suas credenciais para acessar o sistema</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-8 rounded-3xl space-y-5">
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <div className="space-y-1">
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />
            <button
              type="button"
              className="text-xs font-semibold text-primary hover:underline ml-1"
              onClick={() => toast.info('Funcionalidade em desenvolvimento')}
            >
              Esqueci minha senha
            </button>
          </div>

          <Button type="submit" className="w-full h-12 text-lg" loading={loading}>
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
