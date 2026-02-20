
import React, { useState } from 'react';
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
  const { upsertDatabase } = useApp();
  const [loading, setLoading] = useState(false);

  const parseBrazilianCurrency = (val: any): number => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return val;
    
    // Remove R$, espaços e converte formato BR (1.234,56) para US (1234.56)
    const clean = String(val)
      .replace(/R\$/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '.');
    
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  };

  const processFile = (file: File) => {
    setLoading(true);
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
          } else {
            // Planilha Geral: Saldo na Coluna Y (Consolidado), Provisão na Coluna Z
            cleanBalance = parseBrazilianCurrency(row['Y']);
            cleanProvision = parseBrazilianCurrency(row['Z']);
            socioName = String(row['E'] || '').trim().toUpperCase(); 
          }

          const cleanCPF = String(row['D'] || '').replace(/\D/g, '');
          const cleanManagerEmail = String(row['B'] || '').toLowerCase().trim().replace(/\s/g, '.') + "@sicoob.com.br";

          return {
            id: String(row[isCardImport ? 'M' : 'K'] || `ID-${index}-${Date.now()}`),
            clientName: socioName,
            socio: socioName,
            cpfCnpj: cleanCPF,
            phone: String(row['F'] || ''),
            product: isCardImport ? 'CARTÃO DE CRÉDITO' : String(row['J'] || 'CRÉDITO'),
            saldoDevedor: cleanBalance,
            valorProvisionado: cleanProvision,
            daysOverdue: parseInt(row[isCardImport ? 'N' : 'P']) || 0,
            dueDate: '', 
            status: ContractStatus.Overdue,
            pa: String(row['A'] || '0000').toUpperCase(),
            gerente: String(row['B'] || 'NÃO ATRIBUÍDO').toUpperCase(),
            managerEmail: cleanManagerEmail,
            managerId: 'sys',
            region: 'SUL',
            originSheet: isCardImport ? 'Cartoes' : 'Geral',
            timestamp: timestamp
          };
        }).filter(c => c.saldoDevedor > 0 || (isCardImport && c.socio !== ""));

        const signature = `SIG-${file.name}-${mapped.length}-${Date.now()}`;
        upsertDatabase(mapped, signature, isCardImport ? 'Cartoes' : 'Geral');
        onDataImported(mapped);
      } catch (err) {
        console.error("Erro no processamento:", err);
        alert("Erro ao processar planilha. Verifique as colunas.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="w-full">
      <label className={`flex flex-col items-center justify-center w-full h-48 border-4 border-dashed rounded-[3rem] cursor-pointer transition-all ${loading ? 'opacity-50' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <FeatherIcon name={isCardImport ? "package" : "upload"} className={`w-10 h-10 mb-4 ${isCardImport ? 'text-rose-500' : 'text-blue-500'}`} />
          <p className="mb-2 text-sm font-black text-slate-700 dark:text-slate-300 uppercase italic">{label}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-tight">
            {isCardImport ? 'Colunas Requeridas: C (Sócio), I (Exposição)' : 'Colunas Requeridas: Y (Saldo), Z (Provisão)'}
          </p>
        </div>
        <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={(e) => e.target.files && processFile(e.target.files[0])} />
      </label>
    </div>
  );
};

export default FileImporter;
