import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  responsiveMode?: 'scroll' | 'cards';
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data found',
  className = '',
  responsiveMode = 'cards',
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ column }: { column: Column<T> }) => {
    if (!column.sortable) return null;
    if (sortKey !== column.key) return <ChevronsUpDown className="w-4 h-4 text-gray-300" />;
    return sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className={`w-full ${responsiveMode === 'scroll' ? 'overflow-x-auto' : ''} ${className}`}>
      <table className="w-full text-start border-collapse">
        <thead className={responsiveMode === 'cards' ? 'hidden md:table-header-group' : ''}>
          <tr className="border-b border-border-base">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-xs font-semibold text-text-muted uppercase tracking-wider py-3 px-4 first:ps-4 last:pe-4 md:first:ps-0 md:last:pe-0 ${col.className || ''} ${col.sortable ? 'cursor-pointer select-none hover:text-text-base transition-colors' : ''} sticky top-0 bg-bg-surface z-10`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1.5">
                  {col.header}
                  <SortIcon column={col} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-base md:divide-y md:divide-border-base">
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-16 text-sm text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item, _index) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`
                  ${onRowClick ? 'cursor-pointer hover:bg-bg-surface-hover transition-colors' : ''}
                  ${responsiveMode === 'cards' 
                    ? 'block md:table-row bg-bg-surface border border-border-base md:border-none rounded-xl md:rounded-none mb-4 md:mb-0 shadow-sm md:shadow-none overflow-hidden' 
                    : ''}
                `}
              >
                {columns.map((col, _colIndex) => (
                  <td 
                    key={col.key} 
                    className={`
                      ${responsiveMode === 'cards'
                        ? 'flex md:table-cell justify-between items-center p-3 md:py-3.5 md:px-4 border-b border-border-base md:border-b-0 last:border-b-0'
                        : 'py-3.5 px-4'} 
                      text-sm md:first:ps-0 md:last:pe-0
                      ${col.className || ''}
                    `}
                  >
                    {responsiveMode === 'cards' && (
                      <span className="md:hidden font-medium text-xs text-text-muted uppercase tracking-wider pe-4 whitespace-nowrap">
                        {col.header}
                      </span>
                    )}
                    <div className={responsiveMode === 'cards' ? 'text-end md:text-start wrap-break-word max-w-[60%]' : ''}>
                      {col.render ? col.render(item) : item[col.key]}
                    </div>
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
