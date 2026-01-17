import PocketBase from 'pocketbase';

// Alamat default PocketBase local
export const pb = new PocketBase('http://127.0.0.1:8090');

// Opsional: Matikan auto-cancellation agar request tidak cancel otomatis saat komponen re-render (React Strict Mode issue)
pb.autoCancellation(false);