export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    division?: string;
    role: string;
    phone?: string;
    isSuperAdmin?: boolean;
}

export interface Client {
    id: string;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    address?: string;
}

export interface Project {
    id: string;
    // name: string; // HAPUS, diganti client relation
    client: string; // Relation ID
    type: 'arsitektur' | 'sipil' | 'interior';
    status: string;
    value: number; // Contract Value
    contract_value: number; // Contract Value
    deadline: string;
    start_date?: string;
    end_date?: string;
    assignee?: string; // User ID

    // JSON FIELD (Penting!)
    meta_data: {
        luas_tanah?: number;
        luas_bangunan?: number;
        pic_lapangan?: string; // Untuk Sipil
        pic_interior?: string; // Untuk Interior
        area_scope?: string;   // Untuk Interior
        notes?: string;
        [key: string]: any;    // Flexible
    };

    expand?: {
        client?: Client; // Perhatikan nama field relation di PB (client atau client_id)
        assignee?: User;
    };
    created: string;
    updated: string;
}