
import React, { useState } from 'react';
import { Contract, ContractStatus } from '../types';
import FeatherIcon from './FeatherIcon';
import { useApp, ImportSyncResult } from '../context/AppContext';

import * as XLSX from 'xlsx';

interface FileImporterProps {
  onDataImported: (data: Contract[], result: ImportSyncResult) => void;
  label?: string;
  isCardImport?: boolean;
  isPrejuizoImport?: boolean;
}

const FileImporter: React.FC<FileImporterProps> = ({ onDataImported, label = "Clique para carregar", isCardImport = false, isPrejuizoImport = false }) => {
  const { upsertDatabase } = useApp();
  const [loading, setLoading] = useState(false);

  const parseBrazilianCurrency = (val: any): number => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return val;
    
    // Remove R$, espaços e normaliza separadores
    let clean = String(val)
      .replace(/R\$/g, '')
      .replace(/\s/g, '');
    
    // Heurística para detectar o separador decimal
    // Se houver vírgula e ponto, o último é o decimal
    const lastComma = clean.lastIndexOf(',');
    const lastDot = clean.lastIndexOf('.');
    
    if (lastComma > lastDot) {
      // Formato BR: 1.234,56 -> 1234.56
      clean = clean.replace(/\./g, '').replace(/,/g, '.');
    } else if (lastDot > lastComma) {
      // Formato US: 1,234.56 -> 1234.56
      clean = clean.replace(/,/g, '');
    } else if (lastComma !== -1) {
      // Apenas vírgula: 1234,56 -> 1234.56
      clean = clean.replace(/,/g, '.');
    }
    // Se apenas ponto ou nenhum, parseFloat resolve
    
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  };

  const readFile = (file: File): Promise<Contract[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const dataBytes = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(dataBytes, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 'A', defval: '' });

          // Processamento rigoroso a partir da Linha 2 (index 1)
          const rows = json.slice(1);
          const timestamp = new Date().toISOString();

          const mapped: Contract[] = rows.map((row: any, index: number) => {
            let cleanBalance = 0;
            let cleanProvision = 0;
            let socioName = "";

            if (isCardImport) {
              // Planilha de Cartões: Dívida na Coluna I, Sócio na Coluna C
              cleanBalance = parseBrazilianCurrency(row['I']);
              socioName = String(row['C'] || '').trim().toUpperCase();
            } else if (isPrejuizoImport) {
              // Planilha Prejuízo: Valor na Coluna M, Sócio na Coluna C (assumindo C como padrão se não especificado)
              cleanBalance = parseBrazilianCurrency(row['M']);
              socioName = String(row['C'] || '').trim().toUpperCase();
            } else {
              // Planilha Geral: Saldo na Coluna Y (Consolidado), Provisão na Coluna Z
              // Sócio geralmente na C ou E. Tentamos C primeiro, depois E.
              cleanBalance = parseBrazilianCurrency(row['Y']);
              cleanProvision = parseBrazilianCurrency(row['Z']);
              socioName = String(row['C'] || row['E'] || '').trim().toUpperCase(); 
            }

            const cleanCPF = String(row['D'] || '').replace(/\D/g, '');
            const cleanManagerEmail = String(row['B'] || '').toLowerCase().trim().replace(/\s/g, '.') + "@sicoob.com.br";

            // Geração de ID robusta: Tenta usar a coluna de ID, senão compõe com CPF + Index
            let generatedId = "";
            if (isCardImport) {
              generatedId = String(row['M'] || `CARD-${cleanCPF}-${index}`);
            } else if (isPrejuizoImport) {
              // Prejuízo não tem ID claro, usamos CPF + Index para garantir unicidade
              generatedId = `PREJ-${cleanCPF}-${index}`;
            } else {
              generatedId = String(row['K'] || `GERAL-${cleanCPF}-${index}`);
            }

            return {
              id: generatedId,
              clientName: socioName,
              socio: socioName,
              cpfCnpj: cleanCPF,
              phone: String(row['F'] || ''),
              product: isCardImport ? 'CARTÃO DE CRÉDITO' : (isPrejuizoImport ? 'PREJUÍZO' : String(row['J'] || 'CRÉDITO')),
              saldoDevedor: cleanBalance,
              valorProvisionado: cleanProvision,
              daysOverdue: parseInt(row[isCardImport ? 'N' : (isPrejuizoImport ? 'N' : 'P')]) || 0,
              dueDate: '', 
              status: ContractStatus.Overdue,
              pa: String(row['A'] || '0000').toUpperCase(),
              gerente: String(row['B'] || 'NÃO ATRIBUÍDO').toUpperCase(),
              managerEmail: cleanManagerEmail,
              managerId: 'sys',
              region: 'SUL',
              originSheet: (isCardImport ? 'Cartoes' : (isPrejuizoImport ? 'Prejuizo' : 'Geral')) as 'Geral' | 'Cartoes' | 'Prejuizo',
              timestamp: timestamp
            };
          }).filter((c: Contract) => c.saldoDevedor > 0 || (isCardImport && c.socio !== "") || (isPrejuizoImport && c.socio !== ""));
          
          resolve(mapped);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const processFiles = async (files: FileList) => {
    setLoading(true);
    try {
      const allMapped: Contract[] = [];
      for (let i = 0; i < files.length; i++) {
        const mapped = await readFile(files[i]);
        allMapped.push(...mapped);
      }

      if (allMapped.length === 0) {
        alert("Nenhum dado válido encontrado nas planilhas.");
        return;
      }

      const signature = `SIG-BATCH-${allMapped.length}-${Date.now()}`;
      const origin = isCardImport ? 'Cartoes' : (isPrejuizoImport ? 'Prejuizo' : 'Geral');
      const result = upsertDatabase(allMapped, signature, origin);
      onDataImported(allMapped, result);
    } catch (err) {
      console.error("Erro no processamento:", err);
      alert("Erro ao processar planilhas. Verifique o formato e as colunas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <label className={`flex flex-col items-center justify-center w-full h-48 border-4 border-dashed rounded-[3rem] cursor-pointer transition-all ${loading ? 'opacity-50' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <FeatherIcon name={loading ? "loader" : (isCardImport ? "package" : (isPrejuizoImport ? "alert-octagon" : "upload"))} className={`w-10 h-10 mb-4 ${loading ? 'animate-spin text-slate-400' : (isCardImport ? 'text-rose-500' : (isPrejuizoImport ? 'text-amber-500' : 'text-blue-500'))}`} />
          <p className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300 uppercase italic">{loading ? 'Processando Lote...' : label}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-tight">
            {isCardImport ? 'Colunas Requeridas: C (Sócio), I (Exposição)' : (isPrejuizoImport ? 'Colunas Requeridas: C (Sócio), M (Prejuízo)' : 'Colunas Requeridas: Y (Saldo), Z (Provisão)')}
          </p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept=".xlsx, .xls, .csv" 
          multiple
          onChange={(e) => e.target.files && processFiles(e.target.files)} 
        />
      </label>
    </div>
  );
};

export default FileImporter;
