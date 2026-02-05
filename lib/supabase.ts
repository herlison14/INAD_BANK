
// Mock do Supabase para ambiente de desenvolvimento/aperfeiçoamento
export const supabase = {
  from: (table: string) => ({
    delete: () => ({
      eq: async (column: string, value: any) => {
        console.log(`[Supabase Mock] Deletando de ${table} onde ${column} = ${value}`);
        // Simula latência de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simulação de erro aleatório (descomente para testar o rollback)
        // if (Math.random() > 0.1) return { error: new Error("Erro de conexão com o banco de dados") };
        
        return { error: null };
      }
    })
  }),
  auth: {
    getSession: async () => {
      console.log("[Supabase Mock] Recuperando sessão ativa...");
      await new Promise(resolve => setTimeout(resolve, 500));
      return { data: { session: { user: { id: 'admin' } } }, error: null };
    }
  },
  channel: (name: string) => ({
    on: () => ({
      subscribe: () => ({})
    })
  }),
  removeChannel: () => {}
};
