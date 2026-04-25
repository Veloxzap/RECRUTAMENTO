import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { candidateSchema, type CandidateFormValues } from '../../schemas'
import type { Candidate, WorkLocation, TestLocation, JobPosition } from '../../types'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

interface CandidateModalProps {
  isOpen: boolean
  onClose: () => void
  candidate?: Candidate | null
  onSuccess: () => void
  data: {
    jobs: JobPosition[]
    workLocations: WorkLocation[]
    testLocations: TestLocation[]
  }
}

export function CandidateModal({ isOpen, onClose, candidate, onSuccess, data }: CandidateModalProps) {
  const [loading, setLoading] = useState(false)
  
  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      current_status: 'Não',
      test_result: 'Aguardando',
      should_hire: false
    }
  })

  const isScheduled = useWatch({
    control,
    name: 'current_status'
  })

  const shouldHire = useWatch({
    control,
    name: 'should_hire'
  })

  // Automação: Se marcar para contratar, aprova o teste automaticamente
  useEffect(() => {
    if (shouldHire) {
      setValue('test_result', 'Aprovado')
    }
  }, [shouldHire, setValue])

  useEffect(() => {
    if (candidate) {
      reset({
        name: candidate.name,
        contact: candidate.contact,
        job_position: candidate.job_position,
        work_location_id: candidate.work_location_id || '',
        test_location_id: candidate.test_location_id || '',
        test_date: candidate.test_date || '',
        current_status: candidate.current_status,
        test_result: candidate.test_result,
        should_hire: candidate.should_hire,
        notes: candidate.notes
      })
    } else {
      reset({
        current_status: 'Não',
        test_result: 'Aguardando',
        should_hire: false,
        name: '',
        contact: '',
        job_position: '',
        work_location_id: '',
        test_location_id: '',
        test_date: '',
        notes: ''
      })
    }
  }, [candidate, reset, isOpen])

  const onSubmit = async (values: any) => {
    setLoading(true)
    try {
      // Lógica de decrementar vaga
      if (values.should_hire && (!candidate || !candidate.should_hire)) {
        const { data: vacancyData } = await supabase
          .from('vacancies')
          .select('id, quantity')
          .eq('title', values.job_position)
          .gt('quantity', 0)
          .limit(1)
          .single()
        
        if (vacancyData) {
          await supabase
            .from('vacancies')
            .update({ quantity: vacancyData.quantity - 1 })
            .eq('id', vacancyData.id)
        }
      }

      const payload = {
        ...values,
        updated_at: new Date().toISOString()
      }

      if (candidate) {
        const { error } = await supabase
          .from('candidates')
          .update(payload)
          .eq('id', candidate.id)
        if (error) throw error
        toast.success('Candidato atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('candidates')
          .insert([payload])
        if (error) throw error
        toast.success('Candidato cadastrado com sucesso!')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={candidate ? 'Editar Candidato' : 'Novo Candidato'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Nome Completo" 
            placeholder="Ex: João Silva" 
            {...register('name')} 
            error={errors.name?.message} 
          />
          <Input 
            label="Contato (Tel/WhatsApp)" 
            placeholder="(00) 00000-0000" 
            {...register('contact')} 
            error={errors.contact?.message} 
          />
          
          <Select 
            label="Função"
            options={data.jobs.map(j => ({ label: j.title, value: j.title }))}
            {...register('job_position')}
            error={errors.job_position?.message}
          />
          
          <Select 
            label="Local de Atuação"
            options={data.workLocations.map(l => ({ label: l.name, value: l.id }))}
            {...register('work_location_id')}
            error={errors.work_location_id?.message}
          />
          
          <Select 
            label="Agendamento"
            options={[
              { label: 'Não', value: 'Não' },
              { label: 'Sim', value: 'Sim' },
            ]}
            {...register('current_status')}
            error={errors.current_status?.message}
          />

          <Select 
            label="Local do Teste"
            options={data.testLocations.map(l => ({ label: l.name, value: l.id }))}
            {...register('test_location_id')}
            error={errors.test_location_id?.message}
          />

          {isScheduled === 'Sim' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <Input 
                label="Data do Teste Prático" 
                type="date" 
                {...register('test_date')} 
                error={errors.test_date?.message} 
              />
            </div>
          )}
          
          <Select 
            label="Resultado do Teste"
            options={[
              { label: 'Aguardando', value: 'Aguardando' },
              { label: 'Aprovado', value: 'Aprovado' },
              { label: 'Reprovado', value: 'Reprovado' },
            ]}
            {...register('test_result')}
            error={errors.test_result?.message}
          />
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <input 
            type="checkbox" 
            id="should_hire" 
            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20"
            {...register('should_hire')}
          />
          <label htmlFor="should_hire" className="text-sm font-bold text-slate-700 cursor-pointer">
            Marcar para contratar? (Destaque visual no relatório)
          </label>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 ml-1">Observações</label>
          <textarea 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all h-24"
            placeholder="Informações adicionais sobre o candidato..."
            {...register('notes')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading} className="px-10">
            {candidate ? 'Salvar Alterações' : 'Cadastrar Candidato'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
