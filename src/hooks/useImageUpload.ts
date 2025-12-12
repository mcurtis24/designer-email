import { useCallback, useRef, useState } from 'react'
import { uploadImageToCloudinary, validateImageFile } from '@/lib/cloudinary'

interface UseImageUploadProps {
  onImageSelect: (url: string, publicId?: string) => void
  maxSizeMB?: number
}

interface UploadState {
  isUploading: boolean
  previewUrl: string | null
  fileName: string | null
  progress: number
}

export function useImageUpload({ onImageSelect, maxSizeMB = 10 }: UseImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const onImageSelectRef = useRef(onImageSelect)
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    previewUrl: null,
    fileName: null,
    progress: 0
  })

  // Keep the ref updated with the latest callback
  onImageSelectRef.current = onImageSelect

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)

    // Set upload state
    setUploadState({
      isUploading: true,
      previewUrl,
      fileName: file.name,
      progress: 0
    })

    try {
      // Simulate progress updates
      setUploadState(prev => ({ ...prev, progress: 30 }))

      const response = await uploadImageToCloudinary(file)

      setUploadState(prev => ({ ...prev, progress: 80 }))

      setUploadState(prev => ({ ...prev, progress: 100 }))

      // Small delay to show completion
      setTimeout(() => {
        // Use the ref to get the latest callback
        onImageSelectRef.current(response.secure_url, response.public_id)

        // Reset upload state
        setUploadState({
          isUploading: false,
          previewUrl: null,
          fileName: null,
          progress: 0
        })

        // Clean up preview URL
        URL.revokeObjectURL(previewUrl)
      }, 500)

    } catch (error) {
      console.error('Upload failed:', error)
      alert(error instanceof Error ? error.message : 'Upload failed. Please try again.')

      // Reset upload state on error
      setUploadState({
        isUploading: false,
        previewUrl: null,
        fileName: null,
        progress: 0
      })

      // Clean up preview URL
      URL.revokeObjectURL(previewUrl)
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [maxSizeMB])

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return {
    openFilePicker,
    fileInputRef,
    handleFileSelect,
    uploadState
  }
}
