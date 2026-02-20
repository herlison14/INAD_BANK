
import { Contract, ContractStatus } from './types';

const today = new Date();
const timestamp = today.toISOString();

const formatDate = (date: Date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};


// Fix: Added missing 'socio', 'managerEmail', and 'timestamp' properties to all mock contracts.
export const mockContracts: Contract[] = [
  { id: 'C001', clientName: 'Tech Solutions Ltda.', socio: 'Tech Solutions Ltda.', cpfCnpj: '12.345.678/0001-90', product: 'Crédito Pessoal', saldoDevedor: 1500.75, valorProvisionado: 150.08, dueDate: formatDate(new Date(today.getTime() - (15 * 24 * 60 * 60 * 1000))), daysOverdue: 15, status: ContractStatus.Overdue, pa: 'PA Centro', gerente: 'Roberto Lima', managerEmail: 'roberto.lima@sicoob.com.br', managerId: 'manager-1', region: 'Sudeste', timestamp },
  { id: 'C002', clientName: 'Fazenda Santa Fé', socio: 'Fazenda Santa Fé', cpfCnpj: '98.765.432/0001-10', product: 'Crédito Rural', saldoDevedor: 150000.00, valorProvisionado: 1500.00, dueDate: formatDate(new Date(today.getTime() - (25 * 24 * 60 * 60 * 1000))), daysOverdue: 25, status: ContractStatus.Overdue, pa: 'PA Rural', gerente: 'Roberto Lima', managerEmail: 'roberto.lima@sicoob.com.br', managerId: 'manager-1', region: 'Centro-Oeste', timestamp },
  { id: 'C003', clientName: 'Constru Bem Ltda.', socio: 'Constru Bem Ltda.', cpfCnpj: '11.222.333/0001-44', product: 'Capital de Giro', saldoDevedor: 12500.50, valorProvisionado: 1250.05, dueDate: formatDate(new Date(today.getTime() - (70 * 24 * 60 * 60 * 1000))), daysOverdue: 70, status: ContractStatus.Overdue, pa: 'PA Industrial', gerente: 'Roberto Lima', managerEmail: 'roberto.lima@sicoob.com.br', managerId: 'manager-1', region: 'Sudeste', timestamp },
  { id: 'C004', clientName: 'Maria Santos', socio: 'Maria Santos', cpfCnpj: '123.456.789-00', product: 'Cartão de Crédito', saldoDevedor: 3500.00, valorProvisionado: 350.00, dueDate: formatDate(new Date(today.getTime() - (65 * 24 * 60 * 60 * 1000))), daysOverdue: 65, status: ContractStatus.Overdue, pa: 'PA Centro', gerente: 'Roberto Lima', managerEmail: 'roberto.lima@sicoob.com.br', managerId: 'manager-1', region: 'Sudeste', timestamp },
  { id: 'C005', clientName: 'Global Imports', socio: 'Global Imports', cpfCnpj: '55.666.777/0001-88', product: 'Financiamento PJ', saldoDevedor: 50000.00, valorProvisionado: 5000.00, dueDate: formatDate(new Date(today.getTime() - (110 * 24 * 60 * 60 * 1000))), daysOverdue: 110, status: ContractStatus.Overdue, pa: 'PA Norte', gerente: 'Fernanda Souza', managerEmail: 'fernanda.souza@sicoob.com.br', managerId: 'manager-2', region: 'Nordeste', timestamp },
  { id: 'C006', clientName: 'Serralheria Irmãos', socio: 'Serralheria Irmãos', cpfCnpj: '22.333.444/0001-55', product: 'Cartão de Crédito', saldoDevedor: 4500.20, valorProvisionado: 450.02, dueDate: formatDate(new Date(today.getTime() - (25 * 24 * 60 * 60 * 1000))), daysOverdue: 25, status: ContractStatus.Resolved, pa: 'PA Norte', gerente: 'Fernanda Souza', managerEmail: 'fernanda.souza@sicoob.com.br', managerId: 'manager-2', region: 'Nordeste', timestamp },
  { id: 'C007', clientName: 'Padaria Doce Pão', socio: 'Padaria Doce Pão', cpfCnpj: '44.555.666/0001-22', product: 'Crédito Pessoal', saldoDevedor: 2200.00, valorProvisionado: 220.00, dueDate: formatDate(new Date(today.getTime() - (45 * 24 * 60 * 60 * 1000))), daysOverdue: 45, status: ContractStatus.Negotiating, pa: 'PA Centro', gerente: 'Roberto Lima', managerEmail: 'roberto.lima@sicoob.com.br', managerId: 'manager-1', region: 'Sudeste', timestamp },
  { id: 'C008', clientName: 'Agro Forte S.A.', socio: 'Agro Forte S.A.', cpfCnpj: '77.888.999/0001-00', product: 'Crédito Rural', saldoDevedor: 75000.00, valorProvisionado: 7500.00, dueDate: formatDate(new Date(today.getTime() - (95 * 24 * 60 * 60 * 1000))), daysOverdue: 95, status: ContractStatus.Overdue, pa: 'PA Rural', gerente: 'Roberto Lima', managerEmail: 'roberto.lima@sicoob.com.br', managerId: 'manager-1', region: 'Sudeste', timestamp },
  { id: 'C009', clientName: 'João da Silva', socio: 'João da Silva', cpfCnpj: '000.111.222-33', product: 'Crédito Pessoal', saldoDevedor: 900.00, valorProvisionado: 90.00, dueDate: formatDate(new Date(today.getTime() - (10 * 24 * 60 * 60 * 1000))), daysOverdue: 10, status: ContractStatus.Overdue, pa: 'PA Norte', gerente: 'Fernanda Souza', managerEmail: 'fernanda.souza@sicoob.com.br', managerId: 'manager-2', region: 'Nordeste', timestamp },
  { id: 'C010', clientName: 'Restaurante Sabor', socio: 'Restaurante Sabor', cpfCnpj: '33.444.555/0001-66', product: 'Capital de Giro', saldoDevedor: 7300.80, valorProvisionado: 730.08, dueDate: formatDate(new Date(today.getTime() - (12 * 24 * 60 * 60 * 1000))), daysOverdue: 12, status: ContractStatus.Resolved, pa: 'PA Centro', gerente: 'Roberto Lima', managerEmail: 'roberto.lima@sicoob.com.br', managerId: 'manager-1', region: 'Sudeste', timestamp },
];
