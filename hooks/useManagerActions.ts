
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export const useManagerActions = () => {
  const { setUsers } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);

  const deleteManager = async (managerId: string) => {
    setIsSyncing(true);
    
    // --- PASSO 1: ATUALIZAÇÃO OTIMISTA ---
    let previousUsers: any[] = [];
    
    setUsers((current: any[]) => {
      previousUsers = [...current];
      return current.filter(user => user.id !== managerId);
    });

    // --- PASSO 2: COMUNICAÇÃO EM SEGUNDO PLANO ---
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', managerId);

      if (error) throw error;
      console.log("Gerente removido e sincronizado com sucesso!");
    } catch (error) {
      // --- PASSO 3: ROLLBACK EM CASO DE ERRO ---
      console.error("Falha ao deletar, revertendo interface...", error);
      setUsers(previousUsers);
      // Aqui poderíamos disparar um toast de erro global
    } finally {
      setIsSyncing(false);
    }
  };

  return { deleteManager, isSyncing };
};
