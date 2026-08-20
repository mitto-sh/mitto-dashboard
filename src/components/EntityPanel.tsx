'use client'

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { XIcon } from '@/components/icons'

export type EntityPanelTab = 'overview' | 'settings'

interface EntityPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  statusColor?: string
  meta?: React.ReactNode
  tab: EntityPanelTab
  onTabChange: (tab: EntityPanelTab) => void
  overviewLabel: string
  settingsLabel: string
  overview: React.ReactNode
  settings: React.ReactNode
  footer?: React.ReactNode
}

export function EntityPanel({
  open,
  onOpenChange,
  title,
  statusColor,
  meta,
  tab,
  onTabChange,
  overviewLabel,
  settingsLabel,
  overview,
  settings,
  footer,
}: EntityPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side="right"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        className="w-1/2 min-w-[400px] gap-0 p-0"
      >
        <div className="px-7 pt-6">
          <div className="flex items-center gap-3">
            {statusColor && (
              <span className="h-[9px] w-[9px] flex-none rounded-full" style={{ backgroundColor: statusColor }} />
            )}
            <SheetTitle className="flex-1 truncate text-lg font-semibold tracking-tight">{title}</SheetTitle>
            <Button
              onClick={() => onOpenChange(false)}
              aria-label="Close panel"
              variant="ghost"
              size="icon-sm"
            >
              <XIcon size={16} />
            </Button>
          </div>
          {meta}
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => onTabChange(v as EntityPanelTab)}
          className="flex-1 gap-0 overflow-y-auto"
        >
          <TabsList variant="line" className="mx-7 mt-4 h-auto justify-start gap-5 border-b border-border p-0">
            <TabsTrigger value="overview" className="px-0.5 pb-2.5 text-sm">
              {overviewLabel}
            </TabsTrigger>
            <TabsTrigger value="settings" className="px-0.5 pb-2.5 text-sm">
              {settingsLabel}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">{overview}</TabsContent>
          <TabsContent value="settings">{settings}</TabsContent>
        </Tabs>

        {footer && <div className="flex-none">{footer}</div>}
      </SheetContent>
    </Sheet>
  )
}
