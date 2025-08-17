'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white'
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const colorClasses = {
    primary: 'border-primary-600',
    secondary: 'border-gray-600',
    white: 'border-white'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-200 ${sizeClasses[size]} ${colorClasses[color]} border-t-transparent ${className}`} />
  )
}

// Full page loading spinner
export function FullPageSpinner({ message = 'جاري التحميل...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="xl" />
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  )
}

// Inline loading spinner
export function InlineSpinner({ size = 'sm', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  return (
    <div className={`inline-flex items-center space-x-2 space-x-reverse ${className}`}>
      <LoadingSpinner size={size} />
      <span className="text-sm text-gray-600">جاري التحميل...</span>
    </div>
  )
}
