import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { pb } from "@/lib/pocketbase"
import type { User } from "@/types"
import { toast } from "sonner"

// UI Components
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, Plus, UserCog } from "lucide-react"

// Import Sub-Components
import { UserForm } from "./components/UserForm"
import { UserList } from "./components/UserList"

export default function UserManagementPage() {
    const queryClient = useQueryClient();
    
    // States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Fetch Data
    const { data: users, isLoading } = useQuery({
        queryKey: ['users-management'],
        queryFn: async () => await pb.collection('users').getFullList<User>({ sort: 'created' }),
    });

    // Delete Logic
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => await pb.collection('users').delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-management'] });
            toast.success("User berhasil dihapus");
            setDeleteId(null);
        },
        onError: () => toast.error("Gagal menghapus user")
    });

    // Handlers
    const handleCreate = () => { 
        setEditingUser(null); 
        setIsDialogOpen(true); 
    }
    
    const handleEdit = (user: User) => { 
        setEditingUser(user); 
        setIsDialogOpen(true); 
    }

    if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            {/* Header Page */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <UserCog className="h-6 w-6" /> User Management
                    </h1>
                    <p className="text-muted-foreground">Kelola akun, role, dan divisi karyawan.</p>
                </div>
                <Button onClick={handleCreate} className="shadow-sm"><Plus className="mr-2 h-4 w-4" /> Tambah User</Button>
            </div>

            {/* List Table Component */}
            <UserList 
                users={users} 
                onEdit={handleEdit} 
                onDelete={(id) => setDeleteId(id)} 
            />

            {/* Form Dialog Component */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? "Edit User" : "Tambah User Baru"}</DialogTitle>
                    </DialogHeader>
                    <UserForm 
                        initialData={editingUser} 
                        onSuccess={() => setIsDialogOpen(false)} 
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus User ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                            User yang dihapus tidak bisa login kembali. Pastikan tidak ada data krusial yang bergantung pada user ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-red-600 hover:bg-red-700">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}