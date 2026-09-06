'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { XIcon, PlusIcon, CheckIcon } from '@/components/icons'
import { useThemeContext } from './ThemeProvider'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/time'
import type { Agent, AgentCreated, ProviderConfig, ProviderKind, User } from '@/lib/types'

interface AccountPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

const PROVIDER_OPTIONS: Array<{ kind: ProviderKind; enabled: boolean }> = [
  { kind: 'cloud-managed', enabled: true },
  { kind: 'self-hosted-vm', enabled: true },
  { kind: 'self-hosted-aws', enabled: false },
  { kind: 'self-hosted-gcp', enabled: false },
]

export function AccountPanel({ open, onOpenChange, user }: AccountPanelProps) {
  const { dict } = useThemeContext()
  const [tab, setTab] = useState<'profile' | 'provider'>('provider')
  const [config, setConfig] = useState<ProviderConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  const load = useCallback(() => {
    api.getProvider().then(setConfig).catch(() => {})
  }, [])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  async function selectKind(kind: ProviderKind) {
    if (saving || config?.kind === kind) return
    setSaving(true)
    try {
      setConfig(await api.setProvider(kind))
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 1500)
    } catch {
      load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side="right"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        className="gap-0 p-0"
        style={{ width: '50vw', maxWidth: '50vw', minWidth: 400 }}
      >
        <div className="flex items-center gap-3 px-7 pt-6">
          <SheetTitle className="flex-1 truncate text-lg font-semibold tracking-tight">{dict.account}</SheetTitle>
          {savedFlash && (
            <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
              <CheckIcon size={12} /> {dict.saved}
            </span>
          )}
          <Button onClick={() => onOpenChange(false)} aria-label="Close panel" variant="ghost" size="icon-sm">
            <XIcon size={16} />
          </Button>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'profile' | 'provider')} className="flex-1 gap-0 overflow-y-auto">
          <TabsList variant="line" className="mx-7 mt-4 h-auto justify-start gap-5 border-b border-border p-0">
            <TabsTrigger value="provider" className="px-0.5 pb-2.5 text-sm">{dict.provider}</TabsTrigger>
            <TabsTrigger value="profile" className="px-0.5 pb-2.5 text-sm">{dict.profile}</TabsTrigger>
          </TabsList>

          <TabsContent value="provider" className="px-7 py-6">
            <p className="mb-4 text-sm text-muted-foreground">{dict.providerDesc}</p>
            <div className="flex flex-col gap-2">
              {PROVIDER_OPTIONS.map(({ kind, enabled }) => (
                <ProviderOption
                  key={kind}
                  kind={kind}
                  enabled={enabled}
                  selected={config?.kind === kind}
                  onSelect={() => selectKind(kind)}
                />
              ))}
            </div>
            {config?.kind === 'self-hosted-vm' && <AgentsSection open={open} />}
          </TabsContent>

          <TabsContent value="profile" className="px-7 py-6">
            <dl className="flex flex-col gap-4 text-sm">
              <div>
                <dt className="mb-1 font-mono text-label uppercase tracking-[0.08em] text-ink-muted">{dict.name}</dt>
                <dd className="text-ink">{user?.name || '—'}</dd>
              </div>
              <div>
                <dt className="mb-1 font-mono text-label uppercase tracking-[0.08em] text-ink-muted">Email</dt>
                <dd className="text-ink">{user?.email}</dd>
              </div>
              <div>
                <dt className="mb-1 font-mono text-label uppercase tracking-[0.08em] text-ink-muted">Plan</dt>
                <dd className="text-ink capitalize">{user?.plan}</dd>
              </div>
            </dl>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

function ProviderOption({
  kind,
  enabled,
  selected,
  onSelect,
}: {
  kind: ProviderKind
  enabled: boolean
  selected: boolean
  onSelect: () => void
}) {
  const { dict } = useThemeContext()
  const label = kind === 'cloud-managed' ? dict.providerCloudManaged : kind === 'self-hosted-vm' ? dict.providerSelfHostedVm : kind
  const desc = kind === 'cloud-managed' ? dict.providerCloudManagedDesc : kind === 'self-hosted-vm' ? dict.providerSelfHostedVmDesc : ''

  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex items-start gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors disabled:opacity-45 ${
        selected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
      }`}
    >
      <span
        className={`mt-0.5 h-[15px] w-[15px] flex-none rounded-full border ${
          selected ? 'border-primary bg-primary' : 'border-border'
        }`}
      />
      <span className="flex-1">
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          {label}
          {!enabled && <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{dict.comingSoon}</span>}
        </span>
        {desc && <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span>}
      </span>
    </button>
  )
}

function AgentsSection({ open }: { open: boolean }) {
  const { dict } = useThemeContext()
  const [agents, setAgents] = useState<Agent[]>([])
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [fresh, setFresh] = useState<AgentCreated | null>(null)
  const [copied, setCopied] = useState(false)

  const load = useCallback(() => {
    api.listAgents().then(setAgents).catch(() => {})
  }, [])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || busy) return
    setBusy(true)
    try {
      const created = await api.createAgent(name.trim())
      setFresh(created)
      setName('')
      setCreating(false)
      load()
    } finally {
      setBusy(false)
    }
  }

  async function revoke(id: string) {
    await api.revokeAgent(id).catch(() => {})
    load()
  }

  function copyToken() {
    if (!fresh) return
    navigator.clipboard?.writeText(fresh.token).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="mt-6 border-t border-border pt-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{dict.agents}</h3>
        {!creating && (
          <Button size="xs" variant="outline" onClick={() => setCreating(true)}>
            <PlusIcon size={12} /> {dict.newAgent}
          </Button>
        )}
      </div>
      <p className="mb-3 font-mono text-xs text-muted-foreground">{dict.agentsInstallHint}</p>

      {creating && (
        <form onSubmit={submit} className="mb-3 flex gap-2">
          <input
            autoFocus
            placeholder={dict.agentName}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-canvas px-3 py-[7px] text-sm text-ink outline-none"
          />
          <Button type="submit" size="sm" disabled={busy || !name.trim()}>{dict.create}</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => { setCreating(false); setName('') }}>{dict.cancel}</Button>
        </form>
      )}

      {fresh && (
        <div className="mb-3 rounded-lg border border-primary/40 bg-primary/5 p-3">
          <p className="mb-2 text-xs text-ink">{dict.tokenOnceWarning}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-canvas px-2 py-1.5 font-mono text-xs text-ink">{fresh.token}</code>
            <Button size="xs" variant="outline" onClick={copyToken}>
              {copied ? <><CheckIcon size={12} /> {dict.copied}</> : dict.copy}
            </Button>
          </div>
        </div>
      )}

      {agents.length === 0 ? (
        <p className="py-2 text-xs text-muted-foreground">{dict.noAgents}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {agents.map((a) => (
            <li key={a.id} className="flex items-center gap-3 py-2.5">
              <span
                className="h-2 w-2 flex-none rounded-full"
                style={{ backgroundColor: agentColor(a) }}
              />
              <span className="flex-1 truncate">
                <span className="text-sm text-ink">{a.name}</span>
                <span className="ml-2 font-mono text-[11px] text-muted-foreground">{a.tokenPrefix}…</span>
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">{agentStatusLabel(a, dict)}</span>
              {!a.revokedAt && (
                <Button size="xs" variant="destructive" onClick={() => revoke(a.id)}>{dict.revoke}</Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function agentColor(a: Agent): string {
  if (a.revokedAt) return 'var(--muted-foreground)'
  return a.status === 'online' ? '#22c55e' : '#9ca3af'
}

function agentStatusLabel(a: Agent, dict: ReturnType<typeof useThemeContext>['dict']): string {
  if (a.revokedAt) return dict.revoked
  if (a.status === 'online') return dict.online
  if (!a.lastSeenAt) return dict.neverConnected
  return `${dict.offline} · ${formatRelativeTime(a.lastSeenAt)}`
}
