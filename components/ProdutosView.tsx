
import React from 'react';
import { useApp } from '../context/AppContext';

const ProdutosView: React.FC = () => {
  const { products } = useApp();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Catálogo de Produtos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-[#1a1f2e] p-6 rounded-xl border border-[#2e3347]">
            <div className="w-full aspect-square bg-[#2e3347] rounded-lg mb-4 flex items-center justify-center text-slate-500">
              Sem Imagem
            </div>
            <h3 className="font-bold mb-1">{product.name}</h3>
            <p className="text-xs text-slate-400 mb-4">{product.category}</p>
            <p className="text-lg font-black text-blue-400">
              {product.price.toLocaleString('pt-BR', { style: 'currency', currency: product.currency })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProdutosView;
