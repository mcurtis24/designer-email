import EditorLayout from './components/layout/EditorLayout'
import { useAutoSave } from './hooks/useAutoSave'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { Toaster } from 'react-hot-toast'

function App() {
  // Enable auto-save
  useAutoSave()

  // Enable keyboard shortcuts (Cmd+Z, Cmd+Shift+Z, etc.)
  useKeyboardShortcuts()

  return (
    <div className="h-screen w-screen overflow-hidden">
      <EditorLayout />
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
  )
}

export default App
