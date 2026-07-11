export type WeatherIconKind = 'rain' | 'heat' | 'smoke' | 'wind' | 'cloud' | 'alert' | 'clear'

export function weatherObservedLabel(value?: string): string {
  if (!value) return 'Latest weather'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Latest weather'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function firstWeatherMetric(summary: string | undefined, pattern: RegExp): string | null {
  const match = summary?.match(pattern)
  return match?.[1] ?? null
}

export function weatherTemperatureLabel(summary?: string): string {
  const high = firstWeatherMetric(summary, /high\s+([0-9.]+)F-equivalent/i)
  if (high) return `${Math.round(Number(high))}`
  return '--'
}

export function weatherIconKind(summary?: string, alerts?: string): WeatherIconKind {
  const text = `${summary ?? ''} ${alerts ?? ''}`.toLowerCase()
  if (text.includes('smoke') || text.includes('air quality')) return 'smoke'
  if (text.includes('heat')) return 'heat'
  if (text.includes('rain')) return 'rain'
  if (text.includes('wind') || text.includes('breezy')) return 'wind'
  if (text.includes('cloud') || text.includes('overcast')) return 'cloud'
  if (text.includes('storm') || text.includes('alert') || text.includes('warning')) return 'alert'
  return 'clear'
}
