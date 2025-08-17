'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import { AlertTriangle, CheckCircle, X } from 'lucide-react'

// Confirmation dialog interface
export interface ConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

// Context interface
interface ConfirmDialogContextType {
  showConfirm: (options: ConfirmDialogOptions) => void
}

// Create context
const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined)

// Provider component
export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const showConfirm = (newOptions: ConfirmDialogOptions) => {
    setOptions(newOptions)
    setIsOpen(true)
  }

  const handleConfirm = async () => {
    if (!options) return

    setIsLoading(true)
    try {
      await options.onConfirm()
      setIsOpen(false)
      setOptions(null)
    } catch (error) {
      console.error('Confirmation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (options?.onCancel) {
      options.onCancel()
    }
    setIsOpen(false)
    setOptions(null)
  }

  const handleClose = () => {
    if (!isLoading) {
      setIsOpen(false)
      setOptions(null)
    }
  }

  const getTypeStyles = () => {
    if (!options) return {}

    switch (options.type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          title: 'text-red-900'
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-red-500',
          title: 'text-yellow-900'
        }
      case 'info':
      default:
        return {
          icon: <CheckCircle className="h-6 w-6 text-blue-500" />,
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          title: 'text-blue-900'
        }
    }
  }

  const typeStyles = getTypeStyles()

  return (
    <ConfirmDialogContext.Provider value={{ showConfirm }}>
      {/* Always render children */}
      {children}

      {/* Only render dialog when needed */}
      {isOpen && options && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleClose}
            />

            {/* Dialog */}
            <div className="relative transform overflow-hidden rounded-lg bg-white text-right shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              {/* Header */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    {typeStyles.icon}
                    <h3 className={`text-lg font-medium ${typeStyles.title}`}>
                      {options.title}
                    </h3>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="rounded-md bg-gray-50 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 py-5 sm:p-6">
                <div className="mt-2">
                  <p className="text-sm text-gray-700">
                    {options.message}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mr-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed ${typeStyles.confirmButton}`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>جاري التحميل...</span>
                    </div>
                  ) : (
                    options.confirmText || 'تأكيد'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {options.cancelText || 'إلغاء'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  )
}

// Hook to use confirm dialog
export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider')
  }
  return context
}

// Utility function for common confirmations
export const confirm = {
  delete: (itemName: string, onConfirm: () => void | Promise<void>) => ({
    title: 'تأكيد الحذف',
    message: `هل أنت متأكد من حذف "${itemName}"؟ لا يمكن التراجع عن هذا الإجراء.`,
    type: 'danger' as const,
    confirmText: 'حذف',
    cancelText: 'إلغاء',
    onConfirm
  }),

  save: (onConfirm: () => void | Promise<void>) => ({
    title: 'تأكيد الحفظ',
    message: 'هل تريد حفظ التغييرات؟',
    type: 'info' as const,
    confirmText: 'حفظ',
    cancelText: 'إلغاء',
    onConfirm
  }),

  reset: (onConfirm: () => void | Promise<void>) => ({
    title: 'تأكيد إعادة التعيين',
    message: 'هل أنت متأكد من إعادة تعيين جميع البيانات؟ سيتم فقدان جميع التغييرات.',
    type: 'warning' as const,
    confirmText: 'إعادة تعيين',
    cancelText: 'إلغاء',
    onConfirm
  })
}
