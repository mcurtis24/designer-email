import EditorLayout from './components/layout/EditorLayout'
import { useAutoSave } from './hooks/useAutoSave'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { Toaster } from 'react-hot-toast'
import { AIProvider } from './lib/ai/AIContext'
import { AIFloatingButton } from './components/ai/AIFloatingButton'
import { AISidebar } from './components/ai/AISidebar'

function App() {
  // Enable auto-save
  useAutoSave()

  // Enable keyboard shortcuts (Cmd+Z, Cmd+Shift+Z, etc.)
  useKeyboardShortcuts()

  return (
    <AIProvider>
      <div className="h-screen w-screen overflow-hidden">
        <EditorLayout />

        {/* AI Components */}
        <AIFloatingButton />
        <AISidebar />

        <Toaster
          position="bottom-left"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </AIProvider>
  )
}

export default App
