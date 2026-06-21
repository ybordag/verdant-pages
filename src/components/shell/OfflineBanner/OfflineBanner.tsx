import { useConnectivity } from '@/lib/connectivity/connectivity'
import s from './OfflineBanner.module.css'

export default function OfflineBanner() {
  const offline = useConnectivity()
  if (!offline) return null

  return (
    <div className={s.banner} role="status">
      You're offline — changes won't save
    </div>
  )
}
