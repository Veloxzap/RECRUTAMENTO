import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { vacancySchema, type VacancyFormValues } from '../../schemas'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import type { Vacancy } from '../../types'

interface VacancyModalProps {
  isOpen: boolean
  onClose: () => void
  vacancy?: Vacancy | null
  onSuccess: () => void
}

export function VacancyModal({ isOpen, onClose, vacancy, onSuccess }: VacancyModalProps) {
  const [loading, setLoading] = useState(false)
  
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      status: 'Confirmado',
      period: 'Plantão Diurno',
      quantity: 1
    }
  })

  const currentStatus = useWatch({
    control,
    name: 'status'
  })

  useEffect(() => {
    if (vacancy) {
      reset({
        title: vacancy.title,
        period: vacancy.period,
        status: vacancy.status,
        quantity: vacancy.quantity,
        status_reason: vacancy.status_reason || '',
      })
    } else {
      reset({
        title: '',
        period: 'Plantão Diurno',
        status: 'Confirmado',
        quantity: 1,
        status_reason: '',
      })
    }
  }, [vacancy, reset, isOpen])

  const onSubmit = async (values: VacancyFormValues) => {
    setLoading(true)
    try {
      if (vacancy) {
        const { error } = await supabase.from('vacancies').update(values).eq('id', vacancy.id)
        if (error) throw error
        toast.success('Vaga atualizada!')
      } else {
        const { error } = await supabase.from('vacancies').insert([values])
        if (error) throw error
        toast.success('Vaga cadastrada!')
      }
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vacancy ? 'Editar Vaga' : 'Nova Vaga'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Cargo / Função" 
            {...register('title')} 
            error={errors.title?.message} 
            placeholder="Ex: Operador"
          />
          <Input 
            label="Quantidade de Vagas" 
            type="number"
            {...register('quantity', { valueAsNumber: true })} 
            error={errors.quantity?.message} 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Período"
            {...register('period')}
            error={errors.period?.message}
            options={[
              { label: 'Plantão Diurno', value: 'Plantão Diurno' },
              { label: 'Plantão Noturno', value: 'Plantão Noturno' },
              { label: 'Diarista', value: 'Diarista' },
            ]}
          />
          
          <Select
            label="Situação"
            {...register('status')}
            error={errors.status?.message}
            options={[
              { label: 'Confirmado', value: 'Confirmado' },
              { label: 'Outros', value: 'Outros' },
            ]}
          />
        </div>

        {currentStatus === 'Outros' && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="text-sm font-semibold text-slate-700 ml-1">Motivo / Explicação</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all h-24"
              placeholder="Explique o motivo da situação 'Outros'..."
              {...register('status_reason')}
            />
            {errors.status_reason && <p className="text-xs font-medium text-red-500 ml-1">{errors.status_reason.message}</p>}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>
            {vacancy ? 'Salvar Alterações' : 'Cadastrar Vaga'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
