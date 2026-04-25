import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { locationSchema, testLocationSchema } from '../../schemas'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
  location?: any
  type: 'work' | 'test'
  onSuccess: () => void
}

export function LocationModal({ isOpen, onClose, location, type, onSuccess }: LocationModalProps) {
  const [loading, setLoading] = useState(false)
  const schema = type === 'work' ? locationSchema : testLocationSchema
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    if (location) {
      reset({
        name: location.name,
        address: location.address,
        city: location.city,
        state: location.state,
        notes: location.notes,
        capacity: location.capacity,
        responsible: location.responsible,
      })
    } else {
      reset({
        name: '',
        address: '',
        city: '',
        state: '',
        notes: '',
        capacity: undefined,
        responsible: '',
      })
    }
  }, [location, reset, isOpen])

  const onSubmit = async (values: any) => {
    setLoading(true)
    const table = type === 'work' ? 'work_locations' : 'test_locations'
    try {
      if (location) {
        const { error } = await supabase.from(table).update(values).eq('id', location.id)
        if (error) throw error
        toast.success('Local atualizado!')
      } else {
        const { error } = await supabase.from(table).insert([values])
        if (error) throw error
        toast.success('Local cadastrado!')
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
      title={location ? 'Editar Local' : 'Novo Local'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nome do Local" {...register('name')} error={errors.name?.message as string} />
        <Input label="Endereço" {...register('address')} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Cidade" {...register('city')} />
          <Input label="Estado" {...register('state')} />
        </div>
        
        {type === 'test' && (
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Capacidade" 
              type="number" 
              {...register('capacity', { valueAsNumber: true })} 
              error={errors.capacity?.message as string} 
            />
            <Input label="Responsável" {...register('responsible')} />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 ml-1">Observações</label>
          <textarea 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all h-24"
            {...register('notes')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>
            {location ? 'Salvar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
