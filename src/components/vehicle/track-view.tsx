'use client'

import { useEffect } from 'react'

export function TrackView({ vehicleId }: { vehicleId: string }) {
  useEffect(() => {
    fetch('/api/stats/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'VEHICLE_VIEW', vehicleId }),
    }).catch(() => {})
  }, [vehicleId])

  return null
}
