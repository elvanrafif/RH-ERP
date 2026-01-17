// Tambahkan Interface User jika belum ada
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string; // URL atau filename avatar
}

export interface Client {
    id: string;
    company_name: string;
    email: string;
    phone: string;
    address: string;
    created: string;
}

export interface Project {
    id: string;
    name: string;
    status: 'todo' | 'doing' | 'review' | 'done' | 'cancel';
    type: 'design' | 'sipil' | 'others';
    value: number;
    deadline?: string;
    client_id: string;
    assignee?: string; // ID User
    expand?: {
        client_id?: Client;
        assignee?: User; // Data user lengkap hasil expand
    };
    created: string;
    updated: string;
}