import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Workspace compartido: refresca solo para ver cambios de otros
      staleTime: 5_000,
      refetchInterval: 8_000, // consulta cambios cada 8s (solo con la ventana en foco)
      refetchIntervalInBackground: false, // no consulta si la app está en 2º plano (deja dormir el server)
      refetchOnWindowFocus: true, // al volver a la app, actualiza de inmediato
      retry: 1,
    },
    mutations: { retry: 0 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
