import { useQuery } from "@tanstack/react-query"
import { pb } from "@/lib/pocketbase"
import type { Project } from "@/types"

// Fungsi Fetcher (Logika Murni)
const fetchDashboardStats = async () => {
    // 1. Request data ke PocketBase
    const records = await pb.collection('projects').getFullList<Project>();

    // 2. Lakukan perhitungan di sini (bukan di UI component)
    const totalOmzet = records.reduce((acc, curr) => acc + curr.value, 0);
    const totalProjects = records.length;

    // 3. Return data yang sudah siap saji
    return {
        records,
        totalOmzet,
        totalProjects
    };
};

// Hook Utama
export const useDashboardStats = () => {
    return useQuery({
        queryKey: ['dashboard-stats'], // Key unik untuk cache
        queryFn: fetchDashboardStats,
        staleTime: 1000 * 60 * 5, // Data dianggap "segar" selama 5 menit
    });
};