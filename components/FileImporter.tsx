
import React, { useState, useCallback } from 'react';
import { Contract, ContractStatus } from '../types';
import FeatherIcon from './FeatherIcon';
import { useApp } from '../context/AppContext';

declare const XLSX: any;

interface FileImporterProps {
  onDataImported: (data: Contract[]) => void;
  label?: string;
  isCardImport?: boolean;
}

const FileImporter: React.FC<FileImporterProps> = ({ onDataImported, label = "Clique para carregar", isCardImport = false }) => {
  const { syncManagersFromData, upsertDatabase } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // GERAÇÃO DE ASSINATURA DIGITAL (Prevenção de Duplicidade de Arquivo)
  const generateFingerprint = (data: any[]): string => {
    const total = data.length;
    const sample = JSON.stringify(data.slice(0, 15));
    // Cria um identificador único baseado no conteúdo e tamanho para evitar re-imports
    return btoa(`SICOOB-v4-${total}-${sample}`).substring(0, 64);
  };

  const processFile = useCallback((file: File) => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dataBytes = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(dataBytes, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Mapeamento Rígido por Letras de Coluna (A, B, C...)
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 'A', defval: '', range: 0 });

        if (!Array.isArray(json) || json.length === 0) {
          throw new Error("Arquivo sem registros legíveis.");
        }

        const signature = generateFingerprint(json);
        const managersBuffer: { name: string, pa: string }[] = [];
        
        const parsedData: Contract[] = json.map((row: any, index: number) => {
          const parseCurrency = (val: any) => {
            if (typeof val === 'number') return val;
            return parseFloat(String(val).replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
          };
          const parseNumber = (val: any) => {
            if (typeof val === 'number') return Math.floor(val);
            return parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0;
          };

          // Colunas: A=PA, B=Gerente, C=Cliente, D=CPF/CNPJ, I=Saldo, N=Dias
          const pa = String(row['A'] || 'PA DESCONHECIDO').trim().toUpperCase();
          const gerente = String(row['B'] || 'GERENTE NÃO ATRIBUÍDO').trim().toUpperCase();
          const contractId = String(row['E'] || `${isCardImport ? 'CARD' : 'CTR'}-${index}-${Date.now()}`); // Usando coluna E como ID se disponível ou gerando um

          if (gerente !== 'GERENTE NÃO ATRIBUÍDO') {
            managersBuffer.push({ name: gerente, pa });
          }

          const saldo = parseCurrency(row['I']);
          const atraso = parseNumber(row['N']);
          const today = new Date();
          const dueDate = new Date(today.setDate(today.getDate() - atraso)).toISOString().split('T')[0];

          return {
            id: contractId,
            clientName: String(row['C'] || 'CLIENTE NÃO IDENTIFICADO'),
            cpfCnpj: String(row['D'] || 'N/A'),
            product: isCardImport ? 'Cartão de Crédito' : 'Crédito Geral',
            saldoDevedor: saldo,
            valorProvisionado: saldo * 0.15,
            dueDate,
            daysOverdue: atraso,
            status: ContractStatus.Overdue,
            pa,
            gerente,
            managerId: 'linked',
            region: 'N/A',
            originSheet: isCardImport ? 'Cartoes' : 'Geral'
          };
        });

        // 1. Sincroniza identidades (Novos Acessos)
        syncManagersFromData(managersBuffer);

        // 2. Executa Lógica Master (UPSERT)
        const result = upsertDatabase(parsedData, signature);

        if (result.success && result.summary) {
          setSuccessMsg(`IMPORTAÇÃO CONCLUÍDA: ${result.summary.inserted} NOVOS, ${result.summary.updated} ATUALIZADOS.`);
          onDataImported(parsedData);
        } else {
          setError("⚠️ ARQUIVO JÁ IMPORTADO. O PROTOCOLO DE DUPLICIDADE IMPEDIU A OPERAÇÃO.");
        }

      } catch (err: any) {
        setError(`Falha na Auditoria: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [onDataImported, isCardImport, syncManagersFromData, upsertDatabase]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className={`bg-white dark:bg-slate-800 p-8 rounded-[3rem] border-2 border-dashed transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'}`}>
      <label className="cursor-pointer block text-center">
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); }}
        >
          <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110 ${isCardImport ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
            <FeatherIcon name="upload" className="w-10 h-10" />
          </div>
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-1">{label}</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Protocolo UPSERT & Fingerprint Ativo</p>
        </div>
        <input type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx, .xls, .csv" />
      </label>
      
      {loading && (
        <div className="mt-6 flex flex-col items-center gap-2 animate-pulse">
           <div className="w-6 h-6 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
           <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Sincronizando com contratos_ativos...</span>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-500/10 rounded-2xl mt-6 text-[10px] text-red-600 font-black uppercase text-center border border-red-500/20 italic">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 rounded-2xl mt-6 text-[10px] text-emerald-600 font-black uppercase text-center border border-emerald-500/20">
          {successMsg}
        </div>
      )}
    </div>
  );
};

export default FileImporter;
