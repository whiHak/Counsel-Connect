import * as React from "react"
import { Upload, X } from "lucide-react"
import { Button } from "./button"

interface FileUploadProps {
  accept?: string
  onChange: (file: File | null) => void
  value?: File | null
  label: string
  error?: string
}

export function FileUpload({
  accept = "image/*,application/pdf",
  onChange,
  value,
  label,
  error,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    onChange(file)
  }

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        ref={inputRef}
        className="hidden"
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {label}
        </Button>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {value && (
        <p className="text-sm text-muted-foreground">
          Selected: {value.name}
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive text-red-500">{error}</p>
      )}
    </div>
  )
}