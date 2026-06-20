import s from './Breadcrumb.module.css'

interface Crumb {
  label: string
  onClick?: () => void
}

interface BreadcrumbProps {
  crumbs: Crumb[]
}

export default function Breadcrumb({ crumbs }: BreadcrumbProps) {
  return (
    <div className={s.bc}>
      {crumbs.map((c, i) => (
        <span key={i} className={s.item}>
          {i > 0 && <span className={s.sep}>/</span>}
          {c.onClick ? (
            <button className={s.link} onClick={c.onClick}>{c.label}</button>
          ) : (
            <span className={s.current}>{c.label}</span>
          )}
        </span>
      ))}
    </div>
  )
}
