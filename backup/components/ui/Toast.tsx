'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

// Toast interface
export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

// Toast context interface
interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Toast provider component
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    }
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearToasts = () => {
    setToasts([])
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast container component
function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

// Individual toast item component
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const getToastStyles = () => {
    const baseStyles = "transform transition-all duration-300 ease-in-out rounded-lg shadow-lg border-l-4 p-4"
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-500 text-green-800`
      case 'error':
        return `${baseStyles} bg-red-50 border-red-500 text-red-800`
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`
      default:
        return `${baseStyles} bg-gray-50 border-gray-500 text-gray-800`
    }
  }

  const getIcon = () => {
    const iconClasses = "h-5 w-5"
    
    switch (toast.type) {
      case 'success':
        return <CheckCircle className={`${iconClasses} text-green-500`} />
      case 'error':
        return <AlertCircle className={`${iconClasses} text-red-500`} />
      case 'warning':
        return <AlertTriangle className={`${iconClasses} text-yellow-500`} />
      case 'info':
        return <Info className={`${iconClasses} text-blue-500`} />
      default:
        return <Info className={`${iconClasses} text-gray-500`} />
    }
  }

  return (
    <div
      className={`${getToastStyles()} ${
        isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className="flex items-start space-x-3 space-x-reverse">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">
            {toast.title}
          </div>
          {toast.message && (
            <div className="mt-1 text-sm opacity-90">
              {toast.message}
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => onRemove(toast.id)}
            className="inline-flex text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-gray-500 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Utility functions for common toast types
export const toast = {
  success: (title: string, message?: string) => {
    // This will be used with the useToast hook
    return { type: 'success' as const, title, message }
  },
  error: (title: string, message?: string) => {
    return { type: 'error' as const, title, message }
  },
  warning: (title: string, message?: string) => {
    return { type: 'warning' as const, title, message }
  },
  info: (title: string, message?: string) => {
    return { type: 'info' as const, title, message }
  }
}
