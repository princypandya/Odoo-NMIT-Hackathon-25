/*
 * File Upload Component
 * Handles file uploads for projects and messages
 */
"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, type File } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploadProps {
  onFileUploaded?: (file: UploadedFile) => void
  maxSize?: number // in MB
  acceptedTypes?: string[]
  multiple?: boolean
}

interface UploadedFile {
  name: string
  url: string
  type: string
  size: number
}

export default function FileUpload({
  onFileUploaded,
  maxSize = 10,
  acceptedTypes = ["image/*", "application/pdf", ".doc", ".docx", ".txt"],
  multiple = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files)

    // Validate files
    for (const file of fileArray) {
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than ${maxSize}MB`,
          variant: "destructive",
        })
        return
      }
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]

        // Simulate file upload progress
        const uploadedFile = await simulateFileUpload(file)

        if (onFileUploaded) {
          onFileUploaded(uploadedFile)
        }

        setUploadProgress(((i + 1) / fileArray.length) * 100)
      }

      toast({
        title: "Upload successful",
        description: `${fileArray.length} file(s) uploaded successfully`,
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const simulateFileUpload = async (file: File): Promise<UploadedFile> => {
    // In a real app, this would upload to a cloud storage service
    return new Promise((resolve) => {
      setTimeout(
        () => {
          resolve({
            name: file.name,
            url: URL.createObjectURL(file), // Mock URL
            type: file.type,
            size: file.size,
          })
        },
        1000 + Math.random() * 2000,
      )
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        } ${uploading ? "pointer-events-none opacity-50" : "cursor-pointer hover:border-primary/50"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          {uploading ? (
            <div className="space-y-4 w-full max-w-xs">
              <div className="animate-spin">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploading files...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">{Math.round(uploadProgress)}% complete</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Drop files here or click to browse</p>
                <p className="text-xs text-muted-foreground">
                  Max file size: {maxSize}MB
                  {multiple && " • Multiple files allowed"}
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {acceptedTypes.map((type, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(",")}
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  )
}
