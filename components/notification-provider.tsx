"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { Bell, CheckCircle2, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "assignment" | "submission" | "grade"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  clearAll: () => void
  unreadCount: number
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}`,
      timestamp: new Date(),
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add notifications for demo purposes
      if (Math.random() > 0.95) {
        const types = ["assignment", "submission", "grade"] as const
        const type = types[Math.floor(Math.random() * types.length)]

        const messages = {
          assignment: {
            title: "Assignment Updated",
            message: "An assignment has been modified",
          },
          submission: {
            title: "New Submission",
            message: "A student submitted their work",
          },
          grade: {
            title: "Grading Complete",
            message: "You graded a submission",
          },
        }

        addNotification({
          type,
          ...messages[type],
        })
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [addNotification])

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "assignment":
        return <FileText className="h-4 w-4" />
      case "submission":
        return <Bell className="h-4 w-4" />
      case "grade":
        return <CheckCircle2 className="h-4 w-4" />
    }
  }

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, clearAll, unreadCount }}>
      {children}

      <div className="fixed top-4 right-4 z-50">
        <Button variant="outline" size="icon" className="relative bg-card" onClick={() => setIsOpen(!isOpen)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>

        {isOpen && (
          <Card className="absolute top-14 right-0 w-96 max-h-[500px] overflow-hidden flex flex-col shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
              </div>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    Clear all
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-accent/50 cursor-pointer transition-colors",
                        !notification.read && "bg-primary/5",
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="rounded-full bg-primary/10 p-2 h-fit">{getIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm text-foreground">{notification.title}</p>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </NotificationContext.Provider>
  )
}
