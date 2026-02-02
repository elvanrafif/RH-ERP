import { useState, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { pb } from "@/lib/pocketbase"
import type { User } from "@/types"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, Camera, Trash2, Eye, MoreVertical, UploadCloud } from "lucide-react"

interface ProfileAvatarProps {
    user: User;
    className?: string;
}

export function ProfileAvatar({ user, className }: ProfileAvatarProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Helpers
    const getInitials = (name?: string) => name ? name.substring(0, 2).toUpperCase() : "??";
    const avatarUrl = user.avatar ? pb.files.getUrl(user, user.avatar) : null;

    // --- MUTATION: UPLOAD ---
    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("avatar", file);
            return await pb.collection('users').update(user.id, formData);
        },
        onSuccess: (data) => {
            pb.authStore.save(pb.authStore.token, data); // Update session
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            toast.success("Foto profil diperbarui");
        },
        onError: () => toast.error("Gagal mengupload foto")
    });

    // --- MUTATION: DELETE ---
    const deleteMutation = useMutation({
        mutationFn: async () => {
            return await pb.collection('users').update(user.id, { avatar: null });
        },
        onSuccess: (data) => {
            pb.authStore.save(pb.authStore.token, data);
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            toast.success("Foto profil dihapus");
            setIsPreviewOpen(false); // Tutup preview jika dihapus dari sana
        },
        onError: () => toast.error("Gagal menghapus foto")
    });

    // HANDLERS
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB Limit
                toast.error("File terlalu besar (Max 5MB)");
                return;
            }
            uploadMutation.mutate(file);
        }
    };

    const triggerUpload = () => fileInputRef.current?.click();

    const isLoading = uploadMutation.isPending || deleteMutation.isPending;

    return (
        <div className={`flex flex-col items-center gap-3 ${className}`}>
            
            {/* 1. AREA AVATAR UTAMA (HOVERABLE) */}
            <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-sm cursor-pointer" onClick={() => setIsPreviewOpen(true)}>
                    <AvatarImage src={avatarUrl || ""} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-slate-100 text-slate-400">
                        {getInitials(user.name)}
                    </AvatarFallback>
                    
                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full z-20">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                        </div>
                    )}

                    {/* Hover Overlay (Edit Hint) */}
                    {!isLoading && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                            <Eye className="h-6 w-6 text-white mb-1" />
                            <span className="text-[10px] text-white font-medium">Lihat</span>
                        </div>
                    )}
                </Avatar>

                {/* Tombol Mini "Edit" di Pojok Kanan Bawah Avatar */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            size="icon" 
                            variant="secondary" 
                            className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md border border-white hover:bg-slate-100 z-20"
                        >
                            <Camera className="h-4 w-4 text-slate-600" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsPreviewOpen(true)}>
                            <Eye className="mr-2 h-4 w-4" /> Lihat Foto
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={triggerUpload}>
                            <UploadCloud className="mr-2 h-4 w-4" /> Ganti Foto
                        </DropdownMenuItem>
                        {user.avatar && (
                            <DropdownMenuItem 
                                onClick={() => deleteMutation.mutate()}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus Foto
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Hidden Input File */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
            />

            {/* 2. DIALOG PREVIEW (FULL IMAGE) */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none p-0 flex flex-col items-center justify-center">
                     {/* Gambar Full Size */}
                     <div className="relative rounded-lg overflow-hidden shadow-2xl bg-black">
                        {avatarUrl ? (
                            <img 
                                src={avatarUrl} 
                                alt="Profile Full" 
                                className="max-h-[80vh] w-auto object-contain" 
                            />
                        ) : (
                            <div className="h-64 w-64 flex items-center justify-center bg-slate-800 text-slate-400">
                                <span className="text-xl">Tidak ada foto</span>
                            </div>
                        )}
                     </div>

                     {/* Action Buttons di Bawah Preview */}
                     <div className="flex gap-2 mt-4">
                        <Button variant="secondary" onClick={triggerUpload} disabled={isLoading}>
                            <Camera className="mr-2 h-4 w-4" /> Ganti Foto
                        </Button>
                        {user.avatar && (
                            <Button 
                                variant="destructive" 
                                onClick={() => {
                                    if(confirm("Hapus foto profil?")) deleteMutation.mutate();
                                }} 
                                disabled={isLoading}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                            </Button>
                        )}
                     </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}