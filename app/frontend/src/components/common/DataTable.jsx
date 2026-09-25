import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

/**
 * DataTable Reutilizável (OO - Abstração de listagens e coleções)
 * Recebe colunas configuráveis, dados e funções de renderização customizadas.
 */
export default function DataTable({
  data = [],
  columns = [],
  searchPlaceholder = 'Buscar registros...',
  searchKeys = ['nome', 'email', 'numQuarto', 'tipo'],
  emptyMessage = 'Nenhum registro encontrado.',
  actions = null,
  toolbar = null,
  className = ''
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase().trim();

    return data.filter((item) => {
      return searchKeys.some((key) => {
        // Suporta tanto métodos de classe POO quanto propriedades
        const val = typeof item[key] === 'function' ? item[key]() : item[key];
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, searchKeys]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de Busca e Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#663f46] focus:ring-1 focus:ring-[#663f46]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500 justify-between sm:justify-end">
          <span>{filteredData.length} {filteredData.length === 1 ? 'item' : 'itens'}</span>
          {toolbar}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[11px] border-b border-stone-200/80">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className={`py-3 px-4 font-semibold ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
                {actions && (
                  <th className="py-3 px-4 text-right font-semibold">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="py-8 text-center text-stone-400 italic"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredData.map((row, rowIdx) => (
                  <tr key={row.id || rowIdx} className="hover:bg-stone-50/70 transition-colors">
                    {columns.map((col, colIdx) => {
                      const cellValue = typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : row[col.accessor];

                      return (
                        <td key={colIdx} className={`py-3.5 px-4 ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.className || ''}`}>
                          {col.render ? col.render(cellValue, row) : (cellValue ?? '-')}
                        </td>
                      );
                    })}
                    {actions && (
                      <td className="py-3.5 px-4 text-right">
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
