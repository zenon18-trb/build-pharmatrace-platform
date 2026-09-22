'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Role } from '@/lib/domain/types'
import { demoUsers, type DemoUser } from '@/lib/config/navigation'

const STORAGE_KEY = 'pharmatrace.role'

interface RoleContextValue {
  role: Role
  user: DemoUser
  setRole: (role: Role) => void
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('MANUFACTURER')

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Role | null
    if (stored && stored in demoUsers) setRoleState(stored)
  }, [])

  const setRole = useCallback((next: Role) => {
    setRoleState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  return (
    <RoleContext.Provider value={{ role, user: demoUsers[role], setRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
