/*
 * Chat Box Component
 * Real-time messaging for project collaboration
 */
"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Send, MoreHorizontal, Reply, Edit2, Trash2, Smile } from "lucide-react"
import { format, isToday, isYesterday } from "date-fns"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import io from "socket.io-client"
import TypingIndicator from "./TypingIndicator"
import OnlineStatus from "./OnlineStatus"

interface Message {
  _id: string
  projectId: string
  userId: string
  userName: string
  content: string
  type: "text" | "file" | "system"
  replyTo?: {
    _id: string
    content: string
    userName: string
    createdAt: string
  }
  reactions: Array<{
    userId: string
    emoji: string
    createdAt: string
  }>
  edited: {
    isEdited: boolean
    editedAt?: string
    originalContent?: string
  }
  createdAt: string
  updatedAt: string
}

interface ChatBoxProps {
  projectId: string
}

export default function ChatBox({ projectId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<any>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; userName: string }>>([])
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    fetchMessages()
    setupSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [projectId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const setupSocket = () => {
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000")

    socketRef.current.emit("joinProject", projectId)

    socketRef.current.emit("userOnline", {
      projectId,
      userId: user?.uid,
      userName: user?.displayName || user?.email,
    })

    socketRef.current.on("receiveMessage", (message: Message) => {
      setMessages((prev) => [...prev, message])
    })

    socketRef.current.on("messageEdited", (editedMessage: Message) => {
      setMessages((prev) => prev.map((msg) => (msg._id === editedMessage._id ? editedMessage : msg)))
    })

    socketRef.current.on("messageDeleted", ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId))
    })

    socketRef.current.on("messageReactionUpdated", ({ messageId, reactions }: any) => {
      setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, reactions } : msg)))
    })

    socketRef.current.on("userTyping", ({ userId, userName }: { userId: string; userName: string }) => {
      if (userId !== user?.uid) {
        setTypingUsers((prev) => {
          const exists = prev.find((u) => u.userId === userId)
          if (!exists) {
            return [...prev, { userId, userName }]
          }
          return prev
        })
      }
    })

    socketRef.current.on("userStoppedTyping", ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId))
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("userOffline", { projectId, userId: user?.uid })
      }
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/projects/${projectId}/messages`)
      setMessages(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      await api.post(`/projects/${projectId}/messages`, {
        content: newMessage.trim(),
        replyTo: replyingTo?._id || null,
      })

      setNewMessage("")
      setReplyingTo(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const editMessage = async (messageId: string) => {
    if (!editContent.trim()) return

    try {
      await api.put(`/messages/${messageId}`, {
        content: editContent.trim(),
      })

      setEditingMessage(null)
      setEditContent("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive",
      })
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      await api.delete(`/messages/${messageId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    }
  }

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      await api.post(`/messages/${messageId}/reactions`, { emoji })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date)
    if (isToday(messageDate)) {
      return format(messageDate, "HH:mm")
    } else if (isYesterday(messageDate)) {
      return `Yesterday ${format(messageDate, "HH:mm")}`
    } else {
      return format(messageDate, "MMM d, HH:mm")
    }
  }

  const groupReactions = (reactions: Message["reactions"]) => {
    const grouped: { [emoji: string]: { count: number; users: string[] } } = {}
    reactions.forEach((reaction) => {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = { count: 0, users: [] }
      }
      grouped[reaction.emoji].count++
      grouped[reaction.emoji].users.push(reaction.userId)
    })
    return grouped
  }

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      socketRef.current?.emit("startTyping", {
        projectId,
        userId: user?.uid,
        userName: user?.displayName || user?.email,
      })
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      socketRef.current?.emit("stopTyping", {
        projectId,
        userId: user?.uid,
      })
    }, 2000)
  }

  if (loading) {
    return (
      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle>Project Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Project Chat</CardTitle>
          <OnlineStatus projectId={projectId} currentUserId={user?.uid || ""} />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message._id} className="group">
              {message.replyTo && (
                <div className="ml-12 mb-2 p-2 bg-muted/50 rounded border-l-2 border-primary">
                  <p className="text-xs text-muted-foreground">
                    Replying to <span className="font-medium">{message.replyTo.userName}</span>
                  </p>
                  <p className="text-sm truncate">{message.replyTo.content}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{getInitials(message.userName)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.userName}</span>
                    <span className="text-xs text-muted-foreground">{formatMessageTime(message.createdAt)}</span>
                    {message.edited.isEdited && (
                      <Badge variant="outline" className="text-xs">
                        edited
                      </Badge>
                    )}
                  </div>

                  {editingMessage === message._id ? (
                    <div className="space-y-2">
                      <Input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            editMessage(message._id)
                          }
                        }}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => editMessage(message._id)}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingMessage(null)
                            setEditContent("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm break-words">{message.content}</p>
                  )}

                  {message.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(groupReactions(message.reactions)).map(([emoji, data]) => (
                        <Button
                          key={emoji}
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs bg-transparent"
                          onClick={() => addReaction(message._id, emoji)}
                        >
                          {emoji} {data.count}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setReplyingTo(message)}>
                        <Reply className="mr-2 h-4 w-4" />
                        Reply
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addReaction(message._id, "👍")}>
                        <Smile className="mr-2 h-4 w-4" />
                        React
                      </DropdownMenuItem>
                      {message.userId === user?.uid && (
                        <>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingMessage(message._id)
                              setEditContent(message.content)
                            }}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteMessage(message._id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <TypingIndicator typingUsers={typingUsers} />

      {replyingTo && (
        <div className="px-6 py-2 bg-muted/50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Reply className="h-4 w-4" />
              <span>
                Replying to <strong>{replyingTo.userName}</strong>
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
              Cancel
            </Button>
          </div>
          <p className="text-sm text-muted-foreground truncate mt-1">{replyingTo.content}</p>
        </div>
      )}

      <div className="p-6 border-t">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              if (e.target.value.trim()) {
                handleTyping()
              }
            }}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}
