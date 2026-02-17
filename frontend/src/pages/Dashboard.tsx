// import { useEffect, useState } from "react" <-- Hapus ini
import { useDashboardStats } from '@/hooks/useDashboard' // <-- Ganti dengan ini
// import { pb } from "@/lib/pocketbase" <-- Hapus ini (sudah pindah ke hooks)
// import type { Project } from "@/types" <-- Hapus ini

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, CreditCard, Activity, DollarSign, Download } from 'lucide-react'
import { Overview } from '@/components/dashboard/Overview'
import { RecentSales } from '@/components/dashboard/RecentSales'
import { formatRupiah } from '@/lib/helpers'

export default function Dashboard() {
  // 1. GANTI LOGIC LAMA DENGAN HOOK BARU
  // isLoading otomatis true saat data ditarik
  // data akan undefined di awal, lalu terisi otomatis
  const { data, isLoading, error } = useDashboardStats()

  // Handle Error (Opsional, biar clean)
  if (error) return <div className="p-8 text-red-500">Gagal memuat data.</div>

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* ... Header ... */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Laporan
          </Button>
          <Button
            size="sm"
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            + Buat Project Baru
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="design">Tracking Design</TabsTrigger>
          <TabsTrigger value="sipil">Tracking Sipil</TabsTrigger>
          <TabsTrigger value="finance">Keuangan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* KARTU 1: TOTAL PENDAPATAN (REAL) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Pendapatan
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {/* Gunakan data?.totalOmzet karena data mungkin null saat loading */}
                  {isLoading
                    ? 'Loading...'
                    : formatRupiah(data?.totalOmzet || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Data Realtime Database
                </p>
              </CardContent>
            </Card>

            {/* KARTU 2: PROJECT AKTIF (REAL) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Project Aktif
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : data?.totalProjects || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total Project Terdaftar
                </p>
              </CardContent>
            </Card>

            {/* ... Kartu sisa biarkan hardcoded ... */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tagihan Pending
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 85.000.000</div>
                <p className="text-xs text-muted-foreground">
                  Hardcoded (Next Task)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Klien
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">573</div>
                <p className="text-xs text-muted-foreground">Hardcoded</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
