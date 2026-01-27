import PocketBase from 'pocketbase';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8090';

export const pb = new PocketBase(apiUrl);
pb.autoCancellation(false);