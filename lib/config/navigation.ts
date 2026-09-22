import type { Role } from '@/lib/domain/types'

export interface NavItem {
  label: string
  href: string
  icon: string // lucide icon name
  roles: Role[]
}

const ALL: Role[] = ['MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'ADMIN']

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/app/dashboard', icon: 'LayoutDashboard', roles: ALL },
  { label: 'Medicines', href: '/app/medicines', icon: 'Pill', roles: ['MANUFACTURER'] },
  {
    label: 'Batches',
    href: '/app/batches',
    icon: 'Package',
    roles: ['MANUFACTURER', 'ADMIN'],
  },
  {
    label: 'Inventory',
    href: '/app/inventory',
    icon: 'Boxes',
    roles: ['DISTRIBUTOR', 'RETAILER'],
  },
  {
    label: 'Shipments',
    href: '/app/shipments',
    icon: 'Truck',
    roles: ['MANUFACTURER', 'DISTRIBUTOR', 'RETAILER'],
  },
  {
    label: 'Transfers',
    href: '/app/transfers',
    icon: 'ArrowLeftRight',
    roles: ['DISTRIBUTOR'],
  },
  {
    label: 'Invoices',
    href: '/app/invoices',
    icon: 'FileText',
    roles: ['MANUFACTURER', 'DISTRIBUTOR', 'RETAILER'],
  },
  { label: 'Organizations', href: '/app/organizations', icon: 'Building2', roles: ['ADMIN'] },
  { label: 'Verification', href: '/app/verification', icon: 'ShieldCheck', roles: ALL },
  { label: 'Blockchain', href: '/app/blockchain', icon: 'Link2', roles: ALL },
  { label: 'Recalls', href: '/app/recalls', icon: 'ShieldAlert', roles: ['ADMIN'] },
  { label: 'Alerts', href: '/app/alerts', icon: 'Bell', roles: ALL },
  {
    label: 'Audit logs',
    href: '/app/audit-logs',
    icon: 'ScrollText',
    roles: ['ADMIN'],
  },
]

export const roleLabels: Record<Role, string> = {
  MANUFACTURER: 'Manufacturer',
  DISTRIBUTOR: 'Distributor',
  RETAILER: 'Retailer',
  ADMIN: 'Admin / Regulator',
}

export interface DemoUser {
  role: Role
  name: string
  email: string
  organizationName: string
}

export const demoUsers: Record<Role, DemoUser> = {
  MANUFACTURER: {
    role: 'MANUFACTURER',
    name: 'Ana Rivera',
    email: 'a.rivera@example-pharma.com',
    organizationName: 'Example Pharmaceuticals Ltd.',
  },
  DISTRIBUTOR: {
    role: 'DISTRIBUTOR',
    name: 'Kwame Osei',
    email: 'k.osei@medsupply.com',
    organizationName: 'MedSupply Distribution',
  },
  RETAILER: {
    role: 'RETAILER',
    name: 'Lena Park',
    email: 'l.park@citypharmacy.com',
    organizationName: 'City Pharmacy',
  },
  ADMIN: {
    role: 'ADMIN',
    name: 'Inspector Doyle',
    email: 'inspector@nmr.gov',
    organizationName: 'National Medicines Regulator',
  },
}

export function navForRole(role: Role): NavItem[] {
  return navItems.filter((item) => item.roles.includes(role))
}

// Maps the active demo role to the organization it represents.
export const roleOrgId: Record<Role, string> = {
  MANUFACTURER: 'org-mfr',
  DISTRIBUTOR: 'org-dist',
  RETAILER: 'org-ret',
  ADMIN: 'org-reg',
}
