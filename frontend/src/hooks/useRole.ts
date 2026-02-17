import { useAuth } from "@/contexts/AuthContext"

export const useRole = () => {
    const { user } = useAuth()
    const isSuperAdmin = user?.isSuperAdmin
    return { isSuperAdmin, user }
}