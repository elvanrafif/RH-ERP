export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  division?: string
  role: string
  roleId?: string
  phone?: string
  isSuperAdmin?: boolean
}

export interface Client {
  id: string
  salutation?: string
  company_name: string
  contact_person: string
  email: string
  phone: string
  address?: string
  maps_link?: string
  pic_users?: string[]
  expand?: {
    pic_users?: User[]
  }
}

export interface Vendor {
  id: string
  name: string
  phone: string
  project_type: 'civil' | 'interior'
  isActive: boolean
  notes?: string
  created: string
  updated: string
}

export interface Prospect {
  id: string
  instagram: string
  client_name: string
  phone: string
  address?: string
  land_size?: number
  needs: string[] // JSON array: ["Design", "Build"]
  floor?: string
  renovation_type?: string
  status: string
  notes?: string
  meeting_schedule?: string
  confirmation?: string
  quotation?: string
  survey_schedule?: string
  result?: string
  created: string
  updated: string
}

export interface Project {
  id: string
  client: string // Relation ID
  type: 'architecture' | 'civil' | 'interior'
  status: string
  value: number
  contract_value?: number
  deadline: string
  start_date?: string
  end_date?: string
  assignee?: string // User ID
  vendor?: string // Relation ID → vendors
  source_architecture?: string // Relation ID → projects (civil only)
  luas_tanah?: number
  luas_bangunan?: number
  notes?: string
  is_on_hold?: boolean
  hold_reason?: string
  held_at?: string
  invoice_id?: string // Relation ID → invoices

  meta_data: {
    area_scope?: string // Interior only
    additional_links?: Array<{ label?: string; url: string } | string>
    [key: string]: any
  }

  expand?: {
    client?: Client
    assignee?: User
    vendor?: Vendor
    source_architecture?: Project
    invoice_id?: {
      id: string
      invoice_number: string
      total_amount: number
      items: Array<{ amount: number; status?: string; paymentDate?: string }>
      type: string
    }
  }
  created: string
  updated: string
}

export interface Survey {
  id: string
  client: string // relation ID → clients
  surveyor: string // relation ID → users
  schedule: string // ISO datetime string
  status: 'pending' | 'done'
  notes?: string
  expand?: {
    client?: Client
    surveyor?: User
  }
  created: string
  updated: string
}

export interface Invoice {
  id: string
  invoice_number: string
  client_id: string
  type: string
  date: string | Date
  status: string
  active_termin: string
  price_per_meter: number
  project_area: number
  total_amount: number
  bank_details?: string
  items?: any[]
  payment_dates?: string[]
  expand?: {
    client_id?: Client
  }
  created: string
  updated: string
}
