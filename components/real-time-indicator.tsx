"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

export function RealTimeIndicator() {
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    // Simulate connection status
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Badge variant="outline" className="gap-2 bg-card">
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3 text-chart-2" />
          <span className="text-xs">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3 text-destructive" />
          <span className="text-xs">Offline</span>
        </>
      )}
    </Badge>
  )
}
