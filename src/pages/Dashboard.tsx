import { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { Users, Briefcase, CheckCircle, Calendar, MapPin, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [stats, setStats] = useState({
    candidates: 0,
    vacancies: 0,
    hired: 0,
    scheduled: 0,
  })
  const [scheduledCandidates, setScheduledCandidates] = useState<any[]>([])
  const [jobStats, setJobStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchStats() {
    const [
      { count: candidates },
      { data: vacanciesData },
      { count: hired },
      { count: scheduled },
      { data: scheduledData },
      { data: allCandidatesJobs }
    ] = await Promise.all([
      supabase.from('candidates').select('*', { count: 'exact', head: true }),
      supabase.from('vacancies').select('quantity'),
      supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('should_hire', true),
      supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('current_status', 'Sim'),
      supabase.from('candidates')
        .select('id, name, job_position, test_date, test_location:test_locations(name)')
        .eq('current_status', 'Sim')
        .order('test_date', { ascending: true })
        .limit(5),
      supabase.from('candidates').select('job_position')
    ])

    const totalVacancies = vacanciesData?.reduce((acc, v) => acc + (v.quantity || 0), 0) || 0

    // Agrupar candidatos por vaga
    const counts = allCandidatesJobs?.reduce((acc: any, curr: any) => {
      if (curr.job_position) {
        acc[curr.job_position] = (acc[curr.job_position] || 0) + 1
      }
      return acc
    }, {})

    const formattedJobStats = Object.entries(counts || {})
      .map(([title, count]) => ({ title, count }))
      .sort((a: any, b: any) => b.count - a.count)

    setStats({
      candidates: candidates || 0,
      vacancies: totalVacancies,
      hired: hired || 0,
      scheduled: scheduled || 0,
    })
    setScheduledCandidates(scheduledData || [])
    setJobStats(formattedJobStats)
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()

    // Realtime subscriptions
    const channel = supabase.channel('dashboard-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vacancies' }, fetchStats)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <Layout title="Dashboard" desc="Visão geral do sistema de recrutamento">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Calendar size={24} />}
          label="Candidatos Agendados"
          value={stats.scheduled}
          color="bg-purple-600"
          loading={loading}
          to="/candidatos?agendamento=Sim"
        />
        <StatCard
          icon={<Users size={24} />}
          label="Candidatos Cadastrados"
          value={stats.candidates}
          color="bg-blue-600"
          loading={loading}
          to="/candidatos"
        />
        <StatCard
          icon={<Briefcase size={24} />}
          label="Total de Vagas"
          value={stats.vacancies}
          color="bg-amber-500"
          loading={loading}
          to="/vagas"
        />
        <StatCard
          icon={<CheckCircle size={24} />}
          label="Candidatos Contratados"
          value={stats.hired}
          color="bg-emerald-500"
          loading={loading}
          to="/candidatos?contratar=true"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        <div className="lg:col-span-2">
          <div className="glass-card rounded-3xl overflow-hidden border border-slate-100 shadow-sm bg-white/50">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-purple-600" />
                Próximos Testes Agendados
              </h3>
              <Link to="/candidatos" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                Ver todos <ChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Carregando agendamentos...</div>
              ) : scheduledCandidates.length > 0 ? (
                scheduledCandidates.map((c) => (
                  <div key={c.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="font-semibold text-slate-900">
                        <span className="text-primary font-bold">{c.job_position}</span>
                        <span className="mx-2 text-slate-300">|</span>
                        {c.name}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {c.test_location?.name || 'Local não definido'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-primary">
                        {c.test_date ? format(parseISO(c.test_date), 'dd/MM/yyyy') : '--/--/----'}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Data do Teste</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">Nenhum teste agendado no momento.</div>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-slate-100 shadow-sm bg-white/50 flex flex-col items-center">
          <div className="w-full space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Candidatos por Vaga</h4>
            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {jobStats.length > 0 ? (
                jobStats.map((item) => (
                  <Link
                    key={item.title}
                    to={`/candidatos?vaga=${encodeURIComponent(item.title)}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-50 hover:border-primary/20 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Briefcase size={14} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors text-left">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {item.count}
                      </span>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-slate-400">Nenhum candidato cadastrado ainda.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function StatCard({ icon, label, value, color, loading, to }: any) {
  if (loading) {
    return (
      <div className="glass-card p-6 rounded-3xl animate-pulse bg-white border border-slate-100">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4" />
        <div className="h-4 w-24 bg-slate-100 rounded mb-2" />
        <div className="h-8 w-12 bg-slate-100 rounded" />
      </div>
    )
  }

  const content = (
    <div className="glass-card p-6 rounded-3xl hover:shadow-xl transition-all duration-500 group border border-white bg-white/70 h-full flex flex-col items-center text-center">
      <div className={`w-14 h-14 ${color} text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
        {icon}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">{label}</p>
      <p className="text-4xl font-bold mt-1 text-slate-900 tracking-tight group-hover:translate-x-1 transition-transform">{value}</p>
    </div>
  )

  return to ? <Link to={to}>{content}</Link> : content
}
