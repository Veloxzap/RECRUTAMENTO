import { useEffect, useState, useMemo, Fragment } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { 
  Plus, 
  Search, 
  Filter, 
  FileDown, 
  Edit, 
  Trash2, 
  Eye, 
  X,
  MapPin,
  TestTube,
  CheckCircle2,
  XCircle,
  MessageCircle
} from 'lucide-react'
import type { Candidate, WorkLocation, TestLocation, JobPosition } from '../types'
import { toast } from 'sonner'
import { clsx } from 'clsx'
import { format, isWithinInterval, parseISO } from 'date-fns'
import { generateCandidatesPDF } from '../utils/generatePDF'
import { CandidateModal } from '../components/candidates/CandidateModal'

export default function Candidates() {
  const [searchParams] = useSearchParams()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modals and Selection
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null)
  
  // Filters
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState(searchParams.get('agendamento') || '')
  const [filterResult, setFilterResult] = useState('')
  const [filterJob, setFilterJob] = useState(searchParams.get('vaga') || '')
  const [filterHire, setFilterHire] = useState(searchParams.get('contratar') === 'true' ? 'true' : '')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [regDateRange, setRegDateRange] = useState({ start: '', end: '' })
  const [showFilters, setShowFilters] = useState(!!searchParams.get('agendamento') || !!searchParams.get('contratar') || !!searchParams.get('vaga'))

  const showRegDateCol = !!(regDateRange.start || regDateRange.end)

  // Data for selects
  const [jobs, setJobs] = useState<JobPosition[]>([])
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([])
  const [testLocations, setTestLocations] = useState<TestLocation[]>([])

  const fetchData = async () => {
    setLoading(true)
    const [
      { data: candidatesData },
      { data: vacanciesData },
      { data: workLocData },
      { data: testLocData }
    ] = await Promise.all([
      supabase.from('candidates').select(`
        *,
        work_location:work_locations(*),
        test_location:test_locations(*)
      `).order('created_at', { ascending: false }),
      supabase.from('vacancies').select('title').order('title'),
      supabase.from('work_locations').select('*'),
      supabase.from('test_locations').select('*')
    ])

    if (candidatesData) setCandidates(candidatesData)
    if (vacanciesData) {
      // Get unique job titles from vacancies
      const uniqueTitles = Array.from(new Set(vacanciesData.map(v => v.title)))
      setJobs(uniqueTitles.map(title => ({ id: title, title, status: 'disponível', created_at: '' })))
    }
    if (workLocData) setWorkLocations(workLocData)
    if (testLocData) setTestLocations(testLocData)
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este candidato?')) return
    
    const { error } = await supabase.from('candidates').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao excluir: ' + error.message)
    } else {
      toast.success('Candidato excluído')
      fetchData()
    }
  }

  const handleEdit = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedCandidate(null)
    setIsModalOpen(true)
  }

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                           c.contact.includes(search)
      const matchesStatus = !filterStatus || c.current_status === filterStatus
      const matchesResult = !filterResult || c.test_result === filterResult
      const matchesJob = !filterJob || c.job_position === filterJob
      const matchesHire = !filterHire || (filterHire === 'true' ? c.should_hire === true : c.should_hire === false)
      
      let matchesDate = true
      if (dateRange.start && dateRange.end && c.test_date) {
        matchesDate = isWithinInterval(parseISO(c.test_date), {
          start: parseISO(dateRange.start),
          end: parseISO(dateRange.end)
        })
      }

      let matchesRegDate = true
      if (regDateRange.start && regDateRange.end && c.registration_date) {
        matchesRegDate = isWithinInterval(parseISO(c.registration_date), {
          start: parseISO(regDateRange.start),
          end: parseISO(regDateRange.end)
        })
      }

      return matchesSearch && matchesStatus && matchesResult && matchesJob && matchesDate && matchesHire && matchesRegDate
    })
  }, [candidates, search, filterStatus, filterResult, filterJob, dateRange, filterHire, regDateRange])

  const clearFilters = () => {
    setSearch('')
    setFilterStatus('')
    setFilterResult('')
    setFilterJob('')
    setFilterHire('')
    setDateRange({ start: '', end: '' })
    setRegDateRange({ start: '', end: '' })
  }

  const handleExport = () => {
    if (filteredCandidates.length === 0) {
      toast.error('Não há candidatos para exportar com os filtros atuais.')
      return
    }
    toast.promise(
      new Promise((resolve) => {
        generateCandidatesPDF(filteredCandidates, {
          status: filterStatus,
          result: filterResult,
          job: filterJob
        }, {
          showRegistrationDate: showRegDateCol
        })
        resolve(true)
      }),
      {
        loading: 'Gerando PDF...',
        success: 'PDF gerado com sucesso!',
        error: 'Erro ao gerar PDF'
      }
    )
  }

  return (
    <Layout title="Candidatos" desc="Gerencie os processos de recrutamento">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou contato..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(showFilters && "bg-slate-100")}
            >
              <Filter size={18} />
              Filtros
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <FileDown size={18} />
              Exportar
            </Button>
            <Button onClick={handleCreate}>
              <Plus size={18} />
              Novo Candidato
            </Button>
          </div>
        </div>

        <CandidateModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          candidate={selectedCandidate}
          onSuccess={fetchData}
          data={{ jobs, workLocations, testLocations }}
        />

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass-card p-6 rounded-3xl animate-in slide-in-from-top-2 duration-300 space-y-6">
            {/* Primeira Linha: Seletores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Agendamento</label>
                <select 
                  className="input-field bg-white"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Resultado</label>
                <select 
                  className="input-field bg-white"
                  value={filterResult}
                  onChange={(e) => setFilterResult(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Aprovado">Aprovado</option>
                  <option value="Reprovado">Reprovado</option>
                  <option value="Aguardando">Aguardando</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Função</label>
                <select 
                  className="input-field bg-white"
                  value={filterJob}
                  onChange={(e) => setFilterJob(e.target.value)}
                >
                  <option value="">Todas</option>
                  {jobs.map(j => <option key={j.id} value={j.title}>{j.title}</option>)}
                </select>
              </div>
            </div>

            {/* Segunda Linha: Datas e Limpar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Período do Teste</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="date" 
                    className="input-field py-2 text-xs w-full" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <span className="text-slate-400 font-bold">→</span>
                  <input 
                    type="date" 
                    className="input-field py-2 text-xs w-full" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Data do Registro</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="date" 
                    className="input-field py-2 text-xs w-full" 
                    value={regDateRange.start}
                    onChange={(e) => setRegDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <span className="text-slate-400 font-bold">→</span>
                  <input 
                    type="date" 
                    className="input-field py-2 text-xs w-full" 
                    value={regDateRange.end}
                    onChange={(e) => setRegDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-50">
              <button 
                onClick={clearFilters}
                className="text-xs font-bold text-slate-400 hover:text-primary transition-all flex items-center gap-1.5 uppercase tracking-wider"
              >
                <X size={14} className="stroke-[3px]" />
                Limpar Filtros
              </button>
            </div>
          </div>
        )}

        {/* Candidates Table/List */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidato</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Função</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Teste Prático</th>
                  {showRegDateCol && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Registro</th>
                  )}
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Agendamento</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Contratar</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={showRegDateCol ? 7 : 6} className="px-6 py-4">
                        <div className="h-10 bg-slate-50 rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={showRegDateCol ? 7 : 6} className="px-6 py-12 text-center text-slate-400">
                      Nenhum candidato encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((c) => (
                    <Fragment key={c.id}>
                      <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer group border-b border-slate-50">
                        <td className="px-6 py-4" onClick={() => setExpandedCandidate(expandedCandidate === c.id ? null : c.id)}>
                          <div className="font-semibold text-slate-900">{c.name}</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {c.contact.split('/').map((part, index) => {
                              const clean = part.replace(/\D/g, '')
                              let final = clean
                              // Adiciona DDD 83 se for apenas o número (8 ou 9 dígitos)
                              if (clean.length === 8 || clean.length === 9) {
                                final = '83' + clean
                              }
                              // Adiciona DDI 55 se não tiver
                              if (final.length > 0 && !final.startsWith('55')) {
                                final = '55' + final
                              }
                              
                              return (
                                <a
                                  key={index}
                                  href={`https://wa.me/${final}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 transition-colors hover:bg-emerald-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MessageCircle size={10} />
                                  {part.trim()}
                                </a>
                              )
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center" onClick={() => setExpandedCandidate(expandedCandidate === c.id ? null : c.id)}>
                          <span className="text-sm text-slate-600">{c.job_position}</span>
                        </td>
                        <td className="px-6 py-4 text-center" onClick={() => setExpandedCandidate(expandedCandidate === c.id ? null : c.id)}>
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-medium text-slate-700">
                              {c.test_date ? format(parseISO(c.test_date), 'dd/MM/yyyy') : 'Não definida'}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                              <MapPin size={10} /> {c.test_location?.name || 'Local não definido'}
                            </span>
                          </div>
                        </td>
                        {showRegDateCol && (
                          <td className="px-6 py-4 text-center" onClick={() => setExpandedCandidate(expandedCandidate === c.id ? null : c.id)}>
                            <span className="text-sm font-medium text-slate-700">
                              {c.registration_date ? format(parseISO(c.registration_date), 'dd/MM/yyyy') : '-'}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 text-center" onClick={() => setExpandedCandidate(expandedCandidate === c.id ? null : c.id)}>
                          <div className="flex justify-center">
                            <StatusBadge status={c.current_status} />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center" onClick={() => setExpandedCandidate(expandedCandidate === c.id ? null : c.id)}>
                          <div className="flex justify-center">
                            {c.should_hire ? (
                              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                                <CheckCircle2 size={18} />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-slate-100 text-slate-300 rounded-lg flex items-center justify-center">
                                <XCircle size={18} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              className={clsx(
                                "p-2 transition-colors rounded-lg",
                                expandedCandidate === c.id ? "bg-primary text-white" : "text-slate-400 hover:text-primary hover:bg-slate-100"
                              )}
                              onClick={() => setExpandedCandidate(expandedCandidate === c.id ? null : c.id)}
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-slate-100 rounded-lg transition-colors"
                              onClick={() => handleEdit(c)}
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors"
                              onClick={() => handleDelete(c.id)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedCandidate === c.id && (
                        <tr className="bg-slate-50/80 animate-in fade-in slide-in-from-top-1 duration-200">
                          <td colSpan={showRegDateCol ? 7 : 6} className="px-8 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="space-y-4">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local de Atuação</label>
                                  <p className="text-sm font-semibold text-slate-700">{c.work_location?.name || 'Não informado'}</p>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Endereço de Atuação</label>
                                  <p className="text-xs text-slate-500">{c.work_location?.address || 'Sem endereço'}</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detalhes do Teste</label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <TestTube size={14} className="text-amber-500" />
                                    <span className="text-sm font-semibold text-slate-700">{c.test_location?.name || 'Local não definido'}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-1">{c.test_location?.address || ''}</p>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resultado do Teste</label>
                                  <div className="mt-1">
                                    <span className={clsx(
                                      "text-xs font-bold px-2 py-0.5 rounded-md border",
                                      c.test_result === 'Aprovado' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                      c.test_result === 'Reprovado' ? "bg-red-50 text-red-600 border-red-100" :
                                      "bg-slate-100 text-slate-500 border-slate-200"
                                    )}>
                                      {c.test_result}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observações</label>
                                <div className="p-3 bg-white rounded-xl border border-slate-100 min-h-[80px]">
                                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{c.notes || 'Nenhuma observação cadastrada.'}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    'Sim': 'bg-purple-50 text-purple-600 border-purple-100',
    'Não': 'bg-slate-50 text-slate-500 border-slate-100',
    'Aprovado': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Reprovado': 'bg-red-50 text-red-600 border-red-100',
    'Aguardando': 'bg-amber-50 text-amber-600 border-amber-100',
  }

  return (
    <span className={clsx(
      "px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider",
      styles[status] || 'bg-slate-50 text-slate-500 border-slate-100'
    )}>
      {status}
    </span>
  )
}
