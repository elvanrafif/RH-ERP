import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip"

export const NavItem = ({ 
  to, icon: Icon, label, collapsed, isActive, onClick 
}: { 
  to: string, icon: any, label: string, collapsed: boolean, isActive: boolean, onClick?: () => void 
}) => {
  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link to={to} onClick={onClick} className="flex justify-center mb-1">
            <Button 
              variant={isActive ? "secondary" : "ghost"} 
              size="icon" 
              className={cn("h-9 w-9", isActive && "bg-primary/10 text-primary hover:bg-primary/20")}
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
        variant={isActive ? "secondary" : "ghost"} 
        className={cn("w-full justify-start", isActive && "bg-primary/10 text-primary hover:bg-primary/20 font-medium")}
      >
        <Icon className={cn("mr-2 h-4 w-4", isActive ? "text-primary" : "text-slate-500")} />
        {label}
      </Button>
    </Link>
  )
}