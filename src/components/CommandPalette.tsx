'use client'

import { useRouter } from 'next/navigation'
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command'
import type { Project } from '@/lib/types'

interface CommandPaletteProps {
  projects: Project[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ projects, open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Jump to a project"
      description="Search projects by name or slug"
    >
      <Command>
        <CommandInput placeholder="Jump to a project…" />
        <CommandList>
          <CommandEmpty>No projects found.</CommandEmpty>
          <CommandGroup heading="Projects">
            {projects.map((project) => (
              <CommandItem
                key={project.id}
                value={`${project.name} ${project.slug}`}
                onSelect={() => {
                  router.push(`/projects/${project.slug}`)
                  onOpenChange(false)
                }}
              >
                {project.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
