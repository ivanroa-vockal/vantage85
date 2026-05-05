import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PenTool, Key } from 'lucide-react'

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-[--color-muted-foreground] mt-1">Manage your integrations and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-purple-500" />
            Figma Integration
          </CardTitle>
          <CardDescription>
            Configure your Figma API key to access files and components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">MCP Server</Badge>
            <span className="text-sm text-[--color-muted-foreground]">
              Figma MCP is configured in <code className="text-xs bg-[--color-muted] px-1 py-0.5 rounded">~/.cursor/mcp.json</code>
            </span>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Figma API Key</label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-md border border-[--color-input] bg-[--color-muted] px-3 py-2">
                <Key className="h-4 w-4 text-[--color-muted-foreground]" />
                <span className="text-sm text-[--color-muted-foreground]">Configure via FIGMA_API_KEY in .env</span>
              </div>
              <Button variant="outline" size="sm">Update</Button>
            </div>
          </div>
          <p className="text-xs text-[--color-muted-foreground]">
            Get your API key from{' '}
            <a
              href="https://www.figma.com/developers/api#access-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[--color-primary] underline"
            >
              Figma Developer Settings
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
