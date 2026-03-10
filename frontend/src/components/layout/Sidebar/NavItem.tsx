import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export const NavItem = ({
  to,
  icon: Icon,
  label,
  collapsed,
  isActive,
  onClick,
}: {
  to: string
  icon: any
  label: string
  collapsed: boolean
  isActive: boolean
  onClick?: () => void
}) => {
  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link to={to} onClick={onClick} className="flex justify-center mb-1">
            <Button
              variant={isActive ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                'h-9 w-9 transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="sr-only">{label}</span>
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Link to={to} onClick={onClick} className="mb-1 block">
      <Button
        variant={isActive ? 'default' : 'ghost'}
        className={cn(
          'w-full justify-start transition-all',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 font-semibold'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
        )}
      >
        <Icon
          className={cn(
            'mr-2 h-4 w-4',
            isActive ? 'text-primary-foreground' : 'text-slate-400'
          )}
        />
        {label}
      </Button>
    </Link>
  )
}
