import { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Plus, MapPin, Edit, Trash2 } from 'lucide-react'
import type { WorkLocation } from '../types'
import { toast } from 'sonner'
import { LocationModal } from '../components/locations/LocationModal'

export default function WorkLocations() {
  const [locations, setLocations] = useState<WorkLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLoc, setSelectedLoc] = useState<WorkLocation | null>(null)

  const fetchLocations = async () => {
    setLoading(true)
    const { data } = await supabase.from('work_locations').select('*').order('name')
    if (data) setLocations(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este local?')) return
    const { error } = await supabase.from('work_locations').delete().eq('id', id)
    if (error) toast.error('Erro ao excluir')
    else { toast.success('Excluído'); fetchLocations() }
  }

  const handleEdit = (loc: WorkLocation) => {
    setSelectedLoc(loc)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedLoc(null)
    setIsModalOpen(true)
  }

  return (
    <Layout title="Locais de Atuação" desc="Gerencie as unidades e frentes de trabalho">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleCreate}>
            <Plus size={18} />
            Novo Local
          </Button>
        </div>

        <LocationModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          type="work" 
          location={selectedLoc} 
          onSuccess={fetchLocations} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="glass-card h-48 rounded-3xl animate-pulse" />
            ))
          ) : (
            locations.map((loc) => (
              <div key={loc.id} className="glass-card p-6 rounded-3xl group hover:shadow-md transition-all animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="p-1.5 text-slate-400 hover:text-primary transition-colors bg-slate-50 rounded-lg"
                      onClick={() => handleEdit(loc)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-lg"
                      onClick={() => handleDelete(loc.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{loc.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{loc.city} - {loc.state}</p>
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <p className="text-xs text-slate-400 line-clamp-1">{loc.address || 'Endereço não informado'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
