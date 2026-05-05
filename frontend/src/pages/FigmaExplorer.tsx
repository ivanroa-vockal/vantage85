import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PenTool, Search, Loader2, ExternalLink } from 'lucide-react'
import { figmaApi } from '@/services/api'

interface FigmaFile {
  name: string
  lastModified: string
  thumbnailUrl?: string
}

export default function FigmaExplorer() {
  const [fileKey, setFileKey] = useState('')
  const [fileData, setFileData] = useState<FigmaFile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetch = async () => {
    if (!fileKey.trim()) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await figmaApi.getFile(fileKey.trim())
      setFileData(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch Figma file'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <PenTool className="h-8 w-8 text-purple-500" />
          Figma Explorer
        </h1>
        <p className="text-[--color-muted-foreground] mt-1">
          Browse and inspect your Figma files, components, and assets
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Load a Figma File</CardTitle>
          <CardDescription>
            Enter a Figma file key (from the file URL: figma.com/file/<strong>FILE_KEY</strong>/...)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <input
              type="text"
              value={fileKey}
              onChange={(e) => setFileKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              placeholder="e.g. abc123XYZ..."
              className="flex-1 rounded-md border border-[--color-input] bg-[--color-background] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[--color-ring]"
            />
            <Button onClick={handleFetch} disabled={loading || !fileKey.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? 'Loading...' : 'Fetch File'}
            </Button>
          </div>

          {error && (
            <p className="mt-2 text-sm text-[--color-destructive]">{error}</p>
          )}
        </CardContent>
      </Card>

      {fileData && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{fileData.name}</CardTitle>
                <CardDescription>
                  Last modified: {new Date(fileData.lastModified).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Figma File</Badge>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://www.figma.com/file/${fileKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Figma
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </CardHeader>
          {fileData.thumbnailUrl && (
            <CardContent>
              <img
                src={fileData.thumbnailUrl}
                alt={fileData.name}
                className="rounded-md border w-full max-h-64 object-cover"
              />
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
