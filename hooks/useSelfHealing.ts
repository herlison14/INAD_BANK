
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSelfHealing = () => {
  const [healingError, setHealingError] = useState<string | null>(null);

  useEffect(() => {
    const handleError = async (event: ErrorEvent | PromiseRejectionEvent) => {
      const message = event instanceof ErrorEvent ? event.message : String(event.reason);
      console.warn("Auto-Corretor detectou um erro:", message);

      // CASO 1: Erro de Autenticação / Sessão / JWT
      if (message.includes("JWT") || message.includes("auth") || message.includes("401")) {
        setHealingError("Sessão Expirada");
        console.log("Tentando recuperar sessão e reiniciando contexto...");
        await supabase.auth.getSession();
        setTimeout(() => window.location.reload(), 2500); // Delay maior para mostrar o overlay
      }

      // CASO 2: Erro de Carregamento de Módulo (Problema de rede comum em SPAs)
      if (message.includes("loading chunk") || message.includes("Load failed")) {
        setHealingError("Recursos de Rede");
        console.log("Erro de rede/assets detectado. Limpando cache e reiniciando...");
        try {
          const cacheKeys = await caches.keys();
          await Promise.all(cacheKeys.map(key => caches.delete(key)));
        } catch (e) {
          console.error("Falha ao limpar cache:", e);
        }
        setTimeout(() => window.location.reload(), 2500);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  return { healingError };
};
