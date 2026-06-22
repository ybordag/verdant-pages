import { NavLink } from 'react-router-dom'
import {
  Leaf, Sun, CheckSquare, Calendar, FolderOpen, AlertTriangle, Activity,
  ChevronsLeft, MessageSquare, Plus, Play, Map, Flower2, LayoutGrid, Package,
  User, Bell, LogOut,
} from 'lucide-react'
import { useNav } from './NavContext'
import { useAuth } from '@/lib/auth/context'
import ThemeToggle from '@/components/primitives/ThemeToggle/ThemeToggle'
import s from './AppNav.module.css'

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  badge?: number
  end?: boolean
}

function NavItem({ to, icon, label, badge, end = false }: NavItemProps) {
  const hasPending = badge !== undefined && badge > 0
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => [s.item, isActive ? s.activeItem : ''].filter(Boolean).join(' ')}
      data-has-badge={hasPending}
    >
      <span className={s.itemIcon}>{icon}</span>
      <span className={s.itemLabel}>{label}</span>
      {hasPending && <span className={s.badge} aria-hidden="true">{badge}</span>}
    </NavLink>
  )
}

interface QuickActionItemProps {
  to: string
  icon: React.ReactNode
  label: string
}

/** Like NavItem, but never shows the active/highlighted state — these are action triggers, not location indicators. */
function QuickActionItem({ to, icon, label }: QuickActionItemProps) {
  return (
    <NavLink to={to} className={s.item}>
      <span className={s.itemIcon}>{icon}</span>
      <span className={s.itemLabel}>{label}</span>
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
  const { collapsed } = useNav()

  if (collapsed) {
    return (
      <div className={s.widget}>
        <QuickActionItem to="/app/rhizome" icon={<MessageSquare size={16} />} label="Ask Rhizome" />
        <QuickActionItem to="/app/tasks/new" icon={<Plus size={16} />} label="New Task" />
        <button className={s.item}>
          <span className={s.itemIcon}><Play size={16} /></span>
          <span className={s.itemLabel}>Run Triage</span>
        </button>
      </div>
    )
  }

  return (
    <div className={s.card}>
      <span className={s.cardLabel}>Quick Actions</span>
      <NavLink to="/app/rhizome" className={`${s.cardBtn} ${s.cardBtnTertiary}`}>
        <span className={s.cardIcon}><MessageSquare size={14} /></span>
        Ask Rhizome
      </NavLink>
      <NavLink to="/app/tasks/new" className={`${s.cardBtn} ${s.cardBtnSecondary}`}>
        <span className={s.cardIcon}><Plus size={14} /></span>
        New Task
      </NavLink>
      <button className={`${s.cardBtn} ${s.cardBtnPrimary}`}>
        <span className={s.cardIcon}><Play size={14} /></span>
        Run Triage
      </button>
    </div>
  )
}

function GardenProfileCard() {
  const { collapsed } = useNav()

  if (collapsed) {
    return (
      <div className={s.widget}>
        <NavItem to="/app/garden" icon={<Map size={16} />} label="Overview" />
        <NavItem to="/app/plants" icon={<Flower2 size={16} />} label="Plants" />
        <NavItem to="/app/beds" icon={<LayoutGrid size={16} />} label="Beds" />
        <NavItem to="/app/containers" icon={<Package size={16} />} label="Containers" />
      </div>
    )
  }

  return (
    <div className={s.card}>
      <span className={s.cardLabel}>Garden Profile</span>
      <div className={s.cardGrid}>
        <NavLink
          to="/app/garden"
          className={({ isActive }) =>
            [s.cardGridBtn, s.cardGridChartreuse, isActive ? s.cardGridActiveChartreuse : '']
              .filter(Boolean)
              .join(' ')
          }
        >
          <span className={s.cardIcon}><Map size={16} /></span>
          Overview
        </NavLink>
        <span className={s.cardGridFiller} aria-hidden="true" />
        <NavLink
          to="/app/plants"
          className={({ isActive }) =>
            [s.cardGridBtn, s.cardGridPine, isActive ? s.cardGridActivePine : '']
              .filter(Boolean)
              .join(' ')
          }
        >
          <span className={s.cardIcon}><Flower2 size={16} /></span>
          Plants
        </NavLink>
        <NavLink
          to="/app/beds"
          className={({ isActive }) =>
            [s.cardGridBtn, s.cardGridPine, isActive ? s.cardGridActivePine : '']
              .filter(Boolean)
              .join(' ')
          }
        >
          <span className={s.cardIcon}><LayoutGrid size={16} /></span>
          Beds
        </NavLink>
        <span className={s.cardGridFiller} aria-hidden="true" />
        <NavLink
          to="/app/containers"
          className={({ isActive }) =>
            [s.cardGridBtn, s.cardGridChartreuse, isActive ? s.cardGridActiveChartreuse : '']
              .filter(Boolean)
              .join(' ')
          }
        >
          <span className={s.cardIcon}><Package size={16} /></span>
          Containers
        </NavLink>
      </div>
    </div>
  )
}

function NavFooter() {
  const { collapsed, setDrawerOpen } = useNav()
  const { logout } = useAuth()

  return (
    <div className={s.footer}>
      <NavLink to="/app/settings" className={s.item}>
        <span className={s.itemIcon}><User size={16} /></span>
        <span className={s.itemLabel}>Settings</span>
      </NavLink>
      <div className={s.footerRow}>
        <ThemeToggle vertical={collapsed} />
        <button className={s.bellBtn} onClick={() => setDrawerOpen(true)} aria-label="Notifications">
          <Bell size={16} />
        </button>
        <button className={s.bellBtn} onClick={() => logout()} aria-label="Log out" title="Log out">
          <LogOut size={16} />
        </button>
      </div>
    </div>
  )
}

export default function AppNav() {
  const { collapsed, toggle } = useNav()

  return (
    <nav className={s.nav} data-collapsed={collapsed} aria-label="Main navigation">
      {/* Brand */}
      <div className={s.brand}>
        {collapsed ? (
          <button className={s.logoBtn} onClick={toggle} aria-label="Expand nav" title="Expand nav">
            <span className={s.logoLetter}>V</span>
          </button>
        ) : (
          <>
            <span className={s.wordmark}>Verdant Pages</span>
            <button className={s.collapseBtn} onClick={toggle} aria-label="Collapse nav">
              <ChevronsLeft size={16} />
            </button>
          </>
        )}
      </div>

      {/* Nav items */}
      <div className={s.scroll}>
        <NavSection label="Orientation">
          <NavItem to="/app/rhizome" icon={<Leaf size={16} />} label="Rhizome" />
          <NavItem to="/app/today" icon={<Sun size={16} />} label="Today" end />
        </NavSection>

        <NavSection label="Work">
          <NavItem to="/app/tasks" icon={<CheckSquare size={16} />} label="Tasks" />
          <NavItem to="/app/calendar" icon={<Calendar size={16} />} label="Calendar" />
          <NavItem to="/app/projects" icon={<FolderOpen size={16} />} label="Projects" />
        </NavSection>

        <NavSection label="Operational">
          <NavItem to="/app/incidents" icon={<AlertTriangle size={16} />} label="Incidents" />
          <NavItem to="/app/activity" icon={<Activity size={16} />} label="Activity" />
        </NavSection>

        <QuickActionsPanel />
        <GardenProfileCard />
      </div>

      <NavFooter />
    </nav>
  )
}
