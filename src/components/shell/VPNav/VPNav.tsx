import { NavLink } from 'react-router-dom'
import {
  Leaf, Sun, CheckSquare, Calendar, FolderOpen, AlertTriangle, Activity,
  ChevronsLeft, ChevronsRight, MessageSquare, Plus, Play, Map, Flower2, LayoutGrid, Package,
  User, Bell,
} from 'lucide-react'
import { useNav } from './NavContext'
import { useTheme } from '@/lib/theme/ThemeProvider'
import s from './VPNav.module.css'

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  badge?: number
  end?: boolean
}

function NavItem({ to, icon, label, badge, end = false }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={s.item}
      data-active={undefined}
      style={({ isActive }) => isActive ? { color: 'var(--nav-accent)', borderLeftColor: 'var(--nav-accent)', background: 'var(--nav-active-bg)' } : {}}
    >
      <span className={s.itemIcon}>{icon}</span>
      <span className={s.itemLabel}>{label}</span>
      {badge !== undefined && badge > 0 && <span className={s.badge} aria-hidden="true">{badge}</span>}
    </NavLink>
  )
}

interface NavSectionProps {
  label: string
  children: React.ReactNode
}

function NavSection({ label, children }: NavSectionProps) {
  return (
    <div className={s.section}>
      <span className={s.sectionLabel}>{label}</span>
      {children}
    </div>
  )
}

function QuickActionsPanel() {
  return (
    <div style={{ padding: '8px 10px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <NavItem to="/app/rhizome" icon={<MessageSquare size={16} />} label="Ask Rhizome" />
      <NavItem to="/app/tasks/new" icon={<Plus size={16} />} label="New Task" />
      <button className={s.item} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
        <span className={s.itemIcon}><Play size={16} /></span>
        <span className={s.itemLabel}>Run Triage</span>
      </button>
    </div>
  )
}

function GardenProfileCard() {
  const { collapsed } = useNav()
  return (
    <div style={{ padding: '8px 10px', borderTop: '1px solid var(--line)' }}>
      {collapsed ? (
        <NavLink to="/app/garden" className={s.item} style={({ isActive }) => isActive ? { color: 'var(--nav-accent)' } : {}}>
          <span className={s.itemIcon}><Map size={16} /></span>
          <span className={s.itemLabel}>Garden</span>
        </NavLink>
      ) : (
        <>
          <div style={{ padding: '6px 4px 4px', fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Garden
          </div>
          <NavItem to="/app/garden" icon={<Map size={16} />} label="Overview" />
          <NavItem to="/app/plants" icon={<Flower2 size={16} />} label="Plants" />
          <NavItem to="/app/beds" icon={<LayoutGrid size={16} />} label="Beds" />
          <NavItem to="/app/containers" icon={<Package size={16} />} label="Containers" />
        </>
      )}
    </div>
  )
}

function NavFooter() {
  const { setDrawerOpen } = useNav()
  const { toggleTheme, theme } = useTheme()

  return (
    <div style={{ borderTop: '1px solid var(--line)', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
      <NavLink to="/app/settings" className={s.item} style={{ flex: 1, padding: '6px 4px', minHeight: 'auto' }}>
        <span className={s.itemIcon}><User size={16} /></span>
        <span className={s.itemLabel} style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Settings</span>
      </NavLink>
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', display: 'flex', flexShrink: 0 }}
        title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
      >
        <Sun size={15} />
      </button>
      <button
        onClick={() => setDrawerOpen(true)}
        aria-label="Notifications"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', display: 'flex', flexShrink: 0 }}
      >
        <Bell size={15} />
      </button>
    </div>
  )
}

export default function VPNav() {
  const { collapsed, toggle } = useNav()

  return (
    <nav className={s.nav} data-collapsed={collapsed} aria-label="Main navigation">
      {/* Brand */}
      <div className={s.brand}>
        <Leaf className={s.logo} />
        <span className={s.wordmark}>Verdant</span>
        <button className={s.collapseBtn} onClick={toggle} aria-label={collapsed ? 'Expand nav' : 'Collapse nav'}>
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      {/* Nav items */}
      <div className={s.scroll}>
        <NavSection label="Orientation">
          <NavItem to="/app/rhizome" icon={<Leaf size={16} />} label="Rhizome" badge={2} />
          <NavItem to="/app/today" icon={<Sun size={16} />} label="Today" end />
        </NavSection>

        <NavSection label="Work">
          <NavItem to="/app/tasks" icon={<CheckSquare size={16} />} label="Tasks" badge={12} />
          <NavItem to="/app/calendar" icon={<Calendar size={16} />} label="Calendar" />
          <NavItem to="/app/projects" icon={<FolderOpen size={16} />} label="Projects" badge={5} />
        </NavSection>

        <NavSection label="Operational">
          <NavItem to="/app/incidents" icon={<AlertTriangle size={16} />} label="Incidents" badge={2} />
          <NavItem to="/app/activity" icon={<Activity size={16} />} label="Activity" />
        </NavSection>

        <QuickActionsPanel />
        <GardenProfileCard />
      </div>

      <NavFooter />
    </nav>
  )
}
