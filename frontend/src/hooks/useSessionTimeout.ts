import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { pb } from "@/lib/pocketbase";
import { toast } from "sonner";

// 1 Jam (3.6 Juta ms)
const TIMEOUT_DURATION = 1000 * 60 * 60;
// const TIMEOUT_DURATION = 10000;

export function useSessionTimeout() {
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        if (pb.authStore.isValid) {
            pb.authStore.clear();
            toast.warning("Sesi berakhir karena tidak aktif. Silakan login kembali.");
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        if (!pb.authStore.isValid) return;

        // --- PERBAIKAN DI SINI (Ganti NodeJS.Timeout jadi any) ---
        let timeoutId: any;

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(handleLogout, TIMEOUT_DURATION);
        };

        const events = ["click", "mousemove", "keydown", "scroll", "touchstart"];

        events.forEach((event) => window.addEventListener(event, resetTimer));

        resetTimer();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach((event) => window.removeEventListener(event, resetTimer));
        };
    }, [handleLogout]);
}