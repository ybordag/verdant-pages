import s from '../RhizomeWorkbench.module.css'

export function contextTypeClass(type: string): string {
  const classes: Record<string, string> = {
    plant: s.contextTypePlant,
    batch: s.contextTypeBatch,
    bed: s.contextTypeBed,
    container: s.contextTypeContainer,
    task: s.contextTypeTask,
    project: s.contextTypeProject,
    incident: s.contextTypeIncident,
  }
  return classes[type] ?? ''
}
