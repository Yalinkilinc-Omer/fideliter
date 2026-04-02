'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Palette Brume & Ardoise
// #384959 fond sidebar (bleu pétrole foncé)
// #6A89A7 accent / actif  (bleu ardoise moyen)
// #88BDF2 texte clair / icônes
// #BDDDFC très clair / hover subtil

interface SidebarProps {
  businessName: string
  userEmail: string
}

const navItems = [
  { href: '/dashboard',      icon: '📊', label: 'Tableau de bord' },
  { href: '/cards',          icon: '💳', label: 'Mes cartes' },
  { href: '/notifications',  icon: '🔔', label: 'Notifications' },
  { href: '/settings',       icon: '⚙️', label: 'Paramètres' },
]

export default function Sidebar({ businessName, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="w-64 flex flex-col shadow-xl"
      style={{ background: 'linear-gradient(180deg, #384959 0%, #2e3d4a 100%)' }}
    >
      {/* ── Logo & Brand ── */}
      <div className="px-5 py-5 border-b border-[#6A89A7]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6A89A7, #384959)' }}>
            <span className="text-lg">💎</span>
          </div>
          <div className="min-w-0">
            <p className="font-black text-white text-sm leading-tight tracking-tight">Digital Fidélité</p>
            <p className="text-[#88BDF2] text-[11px] font-medium truncate mt-0.5" style={{ maxWidth: '120px' }}>
              {businessName}
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-white shadow-lg'
                  : 'text-[#88BDF2] hover:text-white hover:bg-white/8'
              }`}
              style={isActive
                ? { background: 'linear-gradient(135deg, #6A89A7, #4d6d87)' }
                : undefined
              }
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#BDDDFC]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── User section ── */}
      <div className="px-3 py-4 border-t border-[#6A89A7]/20">
        <div className="flex items-center gap-2.5 px-2 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-[#384959] flex-shrink-0"
            style={{ background: '#88BDF2' }}>
            {userEmail[0]?.toUpperCase()}
          </div>
          <p className="text-[11px] text-[#88BDF2] truncate flex-1">{userEmail}</p>
        </div>

        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#88BDF2] hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-200"
        >
          <span>🚪</span>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
