import { pb } from "./pocketbase";

export const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', maximumFractionDigits: 0
    }).format(val);
}

export const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' });
}

export const formatDateShort = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export const formatDateLong = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const getInitials = (name?: string) => name ? name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "??";
export const getAvatarUrl = (user?: any) => user?.avatar ? pb.files.getUrl(user, user.avatar) : null;