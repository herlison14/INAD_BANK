
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Contract, ContractStatus } from '../types';
import FeatherIcon from './FeatherIcon';
import { useApp } from '../context/AppContext';

declare const XLSX: any;

interface FileImporterProps {
  onDataImported: (data: Contract[]) => void;
  label?: string;
  isCardImport?: boolean;
}

interface ProcessingFile {
  name: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string;
}

const FileImporter: React.FC<FileImporterProps> = ({ onDataImported, label = "Clique para carregar", isCardImport = false }) => {
  const { syncManagersFromData, upsertDatabase, importHashes } = useApp();
  const [fileQueue, setFileQueue] = useState<ProcessingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const generateFingerprint = (data: any[], mode: string): string => {
    const total = data.length;
    const sample = JSON.stringify(data.slice(0, 5));
    return btoa(`SICOOB-V6-${mode}-${total}-${sample}`).substring(0, 64);
  };

  const processSingleFile = async (file: File): Promise<ProcessingFile> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const dataBytes = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(dataBytes, { type: 'array' });
          
          // Se for importação de cartões, busca especificamente a aba "CARTÕES EM ATRASO"
          // Caso contrário, pega a primeira aba disponível
          let sheetName = workbook.SheetNames[0];
          if (isCardImport) {
            const cardSheet = workbook.SheetNames.find(n => n.toUpperCase().includes("CARTÃO") || n.toUpperCase().includes("CARTAO"));
            if (cardSheet) sheetName = cardSheet;
          }

          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 'A', defval: '', range: 0 });

          if (!Array.isArray(json) || json.length < 2) {
            throw new Error("Arquivo vazio ou sem dados na aba principal.");
          }

          const dataRows = json.slice(1);
          const signature = generateFingerprint(dataRows, isCardImport ? 'CARD' : 'GERAL');
          
          if (importHashes.includes(signature)) {
            resolve({ name: file.name, status: 'error', message: "Arquivo já processado." });
            return;
          }

          const managersBuffer: { name: string, pa: string }[] = [];
          const parsedData: Contract[] = dataRows.map((row: any, index: number) => {
            const parseCurrency = (val: any) => {
              if (typeof val === 'number') return val;
              const clean = String(val).replace(/[R$\s.]/g, '').replace(',', '.');
              return parseFloat(clean) || 0;
            };
            const parseNumber = (val: any) => {
              if (typeof val === 'number') return Math.floor(val);
              return parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0;
            };

            const pa = String(row['A'] || 'PA DESCONHECIDO').trim().toUpperCase();
            const gerente = String(row['B'] || 'GERENTE NÃO ATRIBUÍDO').trim().toUpperCase();
            
            if (gerente !== 'GERENTE NÃO ATRIBUÍDO') {
              managersBuffer.push({ name: gerente, pa });
            }

            // Mapeamento Condicional por Fluxo
            let contractId, clientName, product, saldo, atraso, provisao, cpf;

            if (isCardImport) {
              // PROTOCOLO CARTÕES (A, B, C, D, I, N)
              clientName = String(row['C'] || 'CLIENTE CARTÃO');
              cpf = String(row['D'] || 'N/A');
              contractId = String(row['M'] || `CARD-${index}-${Date.now()}`); // Se M estiver vazio, gera ID
              product = 'Cartão de Crédito';
              saldo = parseCurrency(row['I']); // Coluna I
              atraso = parseNumber(row['N']); // Coluna N
              provisao = saldo * 0.15;
            } else {
              // PROTOCOLO GERAL (A, B, D, L, F, M, R, AA, AB)
              clientName = String(row['C'] || 'CLIENTE GERAL');
              cpf = String(row['D'] || 'N/A');
              contractId = String(row['M'] || `CTR-${index}-${Date.now()}`);
              product = String(row['L'] || 'Crédito Geral');
              saldo = parseCurrency(row['AA']); // Coluna AA
              atraso = parseNumber(row['R']);  // Coluna R
              provisao = parseCurrency(row['AB']); // Coluna AB
            }
            
            const today = new Date();
            const dueDate = new Date(today.setDate(today.getDate() - atraso)).toISOString().split('T')[0];

            return {
              id: contractId,
              clientName,
              cpfCnpj: cpf,
              product,
              saldoDevedor: saldo,
              valorProvisionado: provisao || (saldo * 0.15),
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

          syncManagersFromData(managersBuffer);
          const result = upsertDatabase(parsedData, signature);

          if (result.success) {
            resolve({ 
              name: file.name, 
              status: 'success', 
              message: `Sucesso: ${result.summary?.inserted} novos, ${result.summary?.updated} atualizados.` 
            });
            onDataImported(parsedData);
          } else {
            resolve({ name: file.name, status: 'error', message: "Falha na persistência." });
          }
        } catch (err: any) {
          resolve({ name: file.name, status: 'error', message: err.message });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const initialQueue: ProcessingFile[] = Array.from(files).map(f => ({ name: f.name, status: 'loading' }));
    setFileQueue(initialQueue);

    for (let i = 0; i < files.length; i++) {
      const result = await processSingleFile(files[i]);
      setFileQueue(prev => prev.map((item, idx) => idx === i ? result : item));
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div 
        className={`bg-white dark:bg-slate-800 p-10 rounded-[3rem] border-2 border-dashed transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 shadow-xl'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
      >
        <label className="cursor-pointer block text-center">
          <div className="flex flex-col items-center">
            <div className={`w-20 h-20 mb-6 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110 ${isCardImport ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
              <FeatherIcon name={isCardImport ? "package" : "upload"} className="w-10 h-10" />
            </div>
            <h4 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">{label}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
              {isCardImport ? 'Mapeamento: A, B, C, D, I, N' : 'Mapeamento: A, B, D, L, F, M, R, AA, AB'}
            </p>
          </div>
          <input type="file" className="sr-only" onChange={(e) => handleFiles(e.target.files)} multiple accept=".xlsx, .xls, .csv" />
        </label>
      </div>

      <AnimatePresence>
        {fileQueue.length > 0 && (
          <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {fileQueue.map((file, idx) => (
              <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                file.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                file.status === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-600' :
                'bg-blue-500/10 border-blue-500/20 text-blue-600 animate-pulse'
              }`}>
                <div className="flex items-center gap-3 overflow-hidden">
                  <FeatherIcon name={file.status === 'success' ? 'check-circle' : file.status === 'error' ? 'alert-circle' : 'refresh-cw'} className={`w-4 h-4 flex-shrink-0 ${file.status === 'loading' ? 'animate-spin' : ''}`} />
                  <span className="text-[11px] font-black uppercase truncate italic">{file.name}</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest ml-4">{file.message || ''}</span>
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileImporter;
