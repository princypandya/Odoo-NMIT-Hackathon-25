/*
 * Typing Indicator Component
 * Shows when users are typing in chat
 */
"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface TypingUser {
  userId: string
  userName: string
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[]
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  const [dots, setDots] = useState("")

  useEffect(() => {
    if (typingUsers.length === 0) return

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return ""
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [typingUsers.length])

  if (typingUsers.length === 0) return null

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} is typing${dots}`
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing${dots}`
    } else {
      return `${typingUsers[0].userName} and ${typingUsers.length - 1} others are typing${dots}`
    }
  }

  return (
    <div className="px-6 py-2 border-t bg-muted/30">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>{getTypingText()}</span>
      </div>
    </div>
  )
}
