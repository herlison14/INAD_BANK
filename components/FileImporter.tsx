
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
          const worksheet = workbook.Sheets[sheetName];
          
          // Obtemos como array de arrays para detectar cabeçalhos
          const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
          if (data.length < 2) {
            resolve([]);
            return;
          }

          const headers = data[0].map(h => String(h).toUpperCase().trim());
          const rows = data.slice(1);

          // Função auxiliar para encontrar índice por keywords
          const findIdx = (keywords: string[], fallback: number): number => {
            const idx = headers.findIndex(h => keywords.some(k => h.includes(k)));
            return idx !== -1 ? idx : fallback;
          };

          // Mapeamento Inteligente de Colunas
          const idx = {
            pa: findIdx(["PA", "UNIDADE", "AGÊNCIA", "AGENCIA"], 0), // Coluna A
            gerente: findIdx(["GERENTE", "GESTOR", "NOME GERENTE", "RESPONSÁVEL"], 1), // Coluna B
            cliente: findIdx(["SÓCIO", "SOCIO", "NOME", "CLIENTE", "NOME DO CLIENTE"], 2), // Coluna C
            cpf: findIdx(["CPF", "CNPJ", "CPF/CNPJ", "DOCUMENTO"], 3), // Coluna D
            phone: findIdx(["TELEFONE", "CELULAR", "FONE"], 5), // Coluna F
            id: findIdx(["CONTRATO", "ID", "NÚMERO", "NUMERO"], 10), // Coluna K
            saldo: isCardImport ? findIdx(["EXPOSIÇÃO", "DÍVIDA", "VALOR"], 8) : (isPrejuizoImport ? findIdx(["VALOR", "PREJUÍZO"], 12) : findIdx(["SALDO", "CONSOLIDADO"], 24)),
            provisao: findIdx(["PROVISÃO", "PCLD"], 25), // Coluna Z
            atraso: findIdx(["DIAS EM ATRASO", "ATRASO", "AGING", "DIAS"], isCardImport ? 13 : (isPrejuizoImport ? 13 : 15)), // N ou P
            produto: findIdx(["PRODUTO", "MODALIDADE"], 9) // Coluna J
          };

          const timestamp = new Date().toISOString();

          const mapped: Contract[] = rows.map((row: any[], rowIndex: number) => {
            const socioName = String(row[idx.cliente] || '').trim().toUpperCase();
            const cleanCPF = String(row[idx.cpf] || '').replace(/\D/g, '');
            const cleanBalance = parseBrazilianCurrency(row[idx.saldo]);
            const cleanProvision = parseBrazilianCurrency(row[idx.provisao]);
            const daysOverdue = parseInt(String(row[idx.atraso])) || 0;
            
            // Gerente e Email
            const gerenteRaw = String(row[idx.gerente] || 'NÃO ATRIBUÍDO').toUpperCase().trim();
            const cleanManagerEmail = gerenteRaw.toLowerCase().replace(/\s/g, '.') + "@sicoob.com.br";

            // ID do Contrato
            let generatedId = String(row[idx.id] || '');
            if (!generatedId) {
              const prefix = isCardImport ? 'CARD' : (isPrejuizoImport ? 'PREJ' : 'GERAL');
              generatedId = `${prefix}-${cleanCPF}-${rowIndex}`;
            }

            return {
              id: generatedId,
              clientName: socioName,
              socio: socioName,
              cpfCnpj: cleanCPF,
              phone: String(row[idx.phone] || ''),
              product: isCardImport ? 'CARTÃO DE CRÉDITO' : (isPrejuizoImport ? 'PREJUÍZO' : String(row[idx.produto] || 'CRÉDITO')),
              saldoDevedor: cleanBalance,
              valorProvisionado: cleanProvision,
              daysOverdue: daysOverdue,
              dueDate: '', 
              status: ContractStatus.Overdue,
              pa: String(row[idx.pa] || '0000').toUpperCase().trim().padStart(4, '0'),
              gerente: gerenteRaw,
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
      <label className={`flex flex-col items-center justify-center w-full h-48 border-4 border-dashed rounded-[3rem] cursor-pointer transition-all ${loading ? 'opacity-50' : 'hover:bg-[#242938] border-[#2e3347] hover:border-emerald-500'}`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <FeatherIcon name={loading ? "loader" : (isCardImport ? "package" : (isPrejuizoImport ? "alert-octagon" : "upload"))} className={`w-10 h-10 mb-4 ${loading ? 'animate-spin text-[#a0aec0]' : (isCardImport ? 'text-rose-500' : (isPrejuizoImport ? 'text-amber-500' : 'text-emerald-500'))}`} />
          <p className="mb-2 text-sm font-black text-[#f0f4ff] uppercase italic">{loading ? 'Processando Lote...' : label}</p>
          <p className="text-[9px] text-[#a0aec0] font-black uppercase tracking-widest leading-tight">
            {isCardImport ? 'Motor de Mapeamento Inteligente Ativo (Cartões)' : (isPrejuizoImport ? 'Motor de Mapeamento Inteligente Ativo (Prejuízo)' : 'Motor de Mapeamento Inteligente Ativo (Geral)')}
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
