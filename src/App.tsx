import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { AuthProvider } from '@/lib/auth/context'
import { createQueryClient } from '@/lib/query/queryClient'
import { router } from '@/routes/router'

const queryClient = createQueryClient()

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
