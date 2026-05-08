import { Toaster } from '@repo/ui/components/sonner'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router'
import { HomePage } from '../pages/home-page'
import { UiKitPage } from '../pages/ui-kit-page'

function AppLayout() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <Outlet />
      <Toaster />
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="ui-kit" element={<UiKitPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export { App }
