import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function RecentSales() {
  return (
    <div className="space-y-8">
      {/* Item 1 */}
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>OM</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Pak Omar (Renovasi)</p>
          <p className="text-sm text-muted-foreground">
            omar@example.com
          </p>
        </div>
        <div className="ml-auto font-medium">+Rp 15.000.000</div>
      </div>
      
      {/* Item 2 */}
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>JL</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Bu Julia (Interior)</p>
          <p className="text-sm text-muted-foreground">
            julia@example.com
          </p>
        </div>
        <div className="ml-auto font-medium">+Rp 45.000.000</div>
      </div>

      {/* Item 3 */}
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>WT</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Warkop Tunggal</p>
          <p className="text-sm text-muted-foreground">
            admin@warkoptunggal.com
          </p>
        </div>
        <div className="ml-auto font-medium">+Rp 2.500.000</div>
      </div>
    </div>
  )
}