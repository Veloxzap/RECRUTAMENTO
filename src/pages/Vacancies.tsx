import { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Plus, Briefcase, Edit, Trash2, Clock, CheckCircle2, AlertCircle, Search } from 'lucide-react'
import type { Vacancy } from '../types'
import { toast } from 'sonner'
import { VacancyModal } from '../components/vacancies/VacancyModal'
import { clsx } from 'clsx'

export default function Vacancies() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null)

  const fetchVacancies = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('vacancies')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setVacancies(data)
    } catch (error: any) {
      toast.error('Erro ao carregar vagas: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVacancies()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta vaga?')) return
    
    try {
      const { error } = await supabase.from('vacancies').delete().eq('id', id)
      if (error) throw error
      toast.success('Vaga excluída com sucesso!')
      fetchVacancies()
    } catch (error: any) {
      toast.error('Erro ao excluir vaga: ' + error.message)
    }
  }

  const handleEdit = (vacancy: Vacancy) => {
    setSelectedVacancy(vacancy)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedVacancy(null)
    setIsModalOpen(true)
  }

  const filteredVacancies = vacancies.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.period.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout title="Gestão de Vagas" desc="Cadastre e gerencie as vagas disponíveis">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar vaga pelo cargo ou período..." 
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate}>
            <Plus size={18} />
            Nova Vaga
          </Button>
        </div>

        <VacancyModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          vacancy={selectedVacancy} 
          onSuccess={fetchVacancies} 
        />

        <div className="flex flex-col gap-3">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="glass-card h-20 rounded-2xl animate-pulse bg-slate-100/50" />
            ))
          ) : filteredVacancies.length === 0 ? (
            <div className="py-20 text-center glass-card rounded-3xl">
              <Briefcase size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500">Nenhuma vaga encontrada.</p>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-primary font-bold hover:underline mt-2">
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            filteredVacancies.map((v) => (
              <div key={v.id} className="glass-card p-4 rounded-2xl group hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-4 border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4 flex-1">
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    v.status === 'Confirmado' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    <Briefcase size={20} />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 flex-1">
                    <h3 className="font-bold text-slate-900 text-lg min-w-[200px]">{v.title}</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <Clock size={14} className="text-slate-400" />
                        <span className="font-medium">{v.period}</span>
                      </div>
                      <div className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-xs font-bold">
                        {v.quantity} {v.quantity === 1 ? 'vaga' : 'vagas'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className={clsx(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    v.status === 'Confirmado' 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                      : "bg-amber-50 text-amber-600 border-amber-100"
                  )}>
                    {v.status === 'Confirmado' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {v.status}
                  </div>

                  <div className="flex gap-1">
                    <button 
                      className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-slate-50 rounded-lg"
                      onClick={() => handleEdit(v)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors hover:bg-slate-50 rounded-lg"
                      onClick={() => handleDelete(v.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
