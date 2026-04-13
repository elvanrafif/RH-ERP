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
  company_name: string
  contact_person: string
  email: string
  phone: string
  address?: string
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
  contract_value: number
  deadline: string
  start_date?: string
  end_date?: string
  assignee?: string // User ID
  vendor?: string // Relation ID → vendors
  luas_tanah?: number
  luas_bangunan?: number
  notes?: string

  meta_data: {
    area_scope?: string // Interior only
    [key: string]: any
  }

  expand?: {
    client?: Client
    assignee?: User
    vendor?: Vendor
  }
  created: string
  updated: string
}
