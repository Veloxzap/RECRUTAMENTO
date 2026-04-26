import { type ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users as UsersIcon, 
  MapPin, 
  TestTube, 
  LogOut,
  Menu,
  X,
  Briefcase
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { clsx } from 'clsx'
import logoHm from '../../assets/logo_hm.png'

interface LayoutProps {
  children: ReactNode
  title: string
  desc?: string
}

export function Layout({ children, title, desc }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { signOut } = useAuthStore()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Candidatos', path: '/candidatos', icon: UsersIcon },
    { label: 'Vagas Disponíveis', path: '/vagas', icon: Briefcase },
    { label: 'Locais de Atuação', path: '/locais-atuacao', icon: MapPin },
    { label: 'Locais de Teste', path: '/locais-teste', icon: TestTube },
  ]

  return (
    <div className="min-h-screen bg-bg-main flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-72 bg-primary text-white flex-col fixed inset-y-0 shadow-2xl">
        <div className="p-8">
          <div className="bg-white p-3 rounded-2xl flex items-center gap-3 mb-10 shadow-sm">
            <img src={logoHm} alt="Logo HM" className="h-8 w-auto object-contain" />
            <span className="font-display font-bold text-lg tracking-tight text-primary">Recrutamento</span>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium",
                  location.pathname === item.path 
                    ? "bg-white/10 text-accent translate-x-2" 
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-white/10">
          <button 
            onClick={signOut}
            className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors w-full px-4 py-3"
          >
            <LogOut size={20} />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 min-h-screen flex flex-col">
        {/* Header Mobile */}
        <header className="md:hidden bg-primary p-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-sm">
            <img src={logoHm} alt="Logo HM" className="h-6 w-auto object-contain" />
            <span className="text-primary font-bold text-xs uppercase tracking-widest">Recrutamento</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-primary animate-in fade-in duration-300">
            <div className="p-8 pt-20 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    "flex items-center gap-4 p-4 rounded-2xl text-xl font-bold",
                    location.pathname === item.path ? "bg-white text-primary" : "text-white/70"
                  )}
                >
                  <item.icon size={24} />
                  {item.label}
                </Link>
              ))}
              <button 
                onClick={signOut}
                className="flex items-center gap-4 p-4 text-white/50 w-full text-xl font-bold pt-10 border-t border-white/10"
              >
                <LogOut size={24} />
                Sair
              </button>
            </div>
          </div>
        )}

        <div className="p-6 md:p-12 max-w-7xl w-full mx-auto space-y-8 flex-1">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {desc && <p className="text-slate-500 text-lg">{desc}</p>}
          </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
        
        {/* Mobile Bottom Nav */}
        <nav className="md:hidden bg-white border-t border-slate-200 p-2 flex justify-around sticky bottom-0 z-50 shadow-2xl">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex flex-col items-center p-2 rounded-xl transition-colors",
                location.pathname === item.path ? "text-primary bg-primary/5" : "text-slate-400"
              )}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </nav>
      </main>
    </div>
  )
}
