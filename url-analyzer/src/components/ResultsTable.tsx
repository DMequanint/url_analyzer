import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';

interface UrlData {
  id: string;
  url: string;
  title: string;
  htmlVersion: string;
  internalLinks: number;
  externalLinks: number;
  status: string;
}

interface ResultsTableProps {
  data: UrlData[];
  onRowClick?: (row: UrlData) => void;
}

const columns: ColumnDef<UrlData>[] = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'htmlVersion', header: 'HTML Version' },
  { accessorKey: 'internalLinks', header: '# Internal Links' },
  { accessorKey: 'externalLinks', header: '# External Links' },
  { accessorKey: 'status', header: 'Status' },
];

const PAGE_SIZE = 10;

const ResultsTable: React.FC<ResultsTableProps> = ({ data, onRowClick }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);

  const pageCount = Math.ceil(data.length / PAGE_SIZE);
  const paginatedData = data.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);

  const table = useReactTable({
    data: paginatedData,
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    manualPagination: true,
    pageCount,
  });

  return (
    <div>
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ cursor: 'pointer' }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ? ' 🔼' : ' 🔽') : null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr
              key={row.id}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              onClick={() => onRowClick && onRowClick(row.original)}
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '8px' }}>
        <button onClick={() => setPageIndex(i => Math.max(i - 1, 0))} disabled={pageIndex === 0}>
          Previous
        </button>
        <span style={{ margin: '0 8px' }}>
          Page {pageIndex + 1} of {pageCount}
        </span>
        <button onClick={() => setPageIndex(i => Math.min(i + 1, pageCount - 1))} disabled={pageIndex >= pageCount - 1}>
          Next
        </button>
      </div>
    </div>
  );
};

export default ResultsTable;

