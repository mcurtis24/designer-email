/**
 * Design Mode Context
 * Shared context for desktop/mobile editing mode across all responsive controls
 * Ensures consistent behavior across all sections without duplicate toggles
 */

import { createContext, useContext, useState, ReactNode } from 'react'

type DesignMode = 'desktop' | 'mobile'

interface DesignModeContextType {
  mode: DesignMode
  setMode: (mode: DesignMode) => void
}

const DesignModeContext = createContext<DesignModeContextType | undefined>(undefined)

export function DesignModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DesignMode>('desktop')

  return (
    <DesignModeContext.Provider value={{ mode, setMode }}>
      {children}
    </DesignModeContext.Provider>
  )
}

export function useDesignMode() {
  const context = useContext(DesignModeContext)
  if (context === undefined) {
    throw new Error('useDesignMode must be used within a DesignModeProvider')
  }
  return context
}
