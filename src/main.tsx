import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GlobalContext } from './context/Context.tsx'
import { Provider } from "react-redux"
import { store } from './store/store.tsx'
import { BrowserRouter } from "react-router-dom"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { Toaster } from 'react-hot-toast'
import { CookiesProvider } from 'react-cookie'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 10
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <CookiesProvider>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <GlobalContext>
          <BrowserRouter>
            <Toaster position="top-center" reverseOrder={false} />
            <App />
          </BrowserRouter>
        </GlobalContext>
      </Provider>
    </QueryClientProvider>
  </CookiesProvider>
)
