import { Fragment } from 'react'
import type { LucideIcon } from 'lucide-react'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface RowAction {
  label: string
  icon: LucideIcon
  onClick: () => void
  variant?: 'default' | 'destructive'
  separator?: boolean
}

interface RowActionsProps {
  actions: RowAction[]
  stopPropagation?: boolean
}

export function RowActions({ actions, stopPropagation }: RowActionsProps) {
  if (actions.length === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
          onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <Fragment key={action.label}>
            {action.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={(e) => {
                if (stopPropagation) e.stopPropagation()
                action.onClick()
              }}
              className={
                action.variant === 'destructive'
                  ? 'text-red-600 focus:text-red-600 focus:bg-red-50'
                  : undefined
              }
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
