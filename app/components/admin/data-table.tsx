'use client';

import { useAdminRecords } from '@/app/services/queries/admin';
import { useEffect, useRef, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import type {
  AdminBulkSelection,
  AdminDataTableProps,
  AdminTableRecord,
  SelectionCheckboxProps,
} from '@/app/lib/types';

function SelectionCheckbox({
  label,
  checked,
  mixed,
  onChange,
}: SelectionCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(mixed);
  }, [mixed]);
  return (
    <input
      ref={ref}
      type='checkbox'
      aria-label={label}
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className='h-4 w-4 shrink-0 accent-slate-900'
    />
  );
}

export function AdminDataTable<T extends AdminTableRecord>({
  title,
  kind,
  columns,
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [selection, setSelection] = useState<AdminBulkSelection>({ mode: 'explicit', records: {} });
  const query = useAdminRecords<T>({ kind, search, page: pagination.pageIndex, pageSize: pagination.pageSize as 10 | 25 | 50, sort: sorting[0]?.id ?? 'createdAt', direction: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : 'desc' });
  const data = query.data?.rows ?? [];
  const matches = query.data?.totalCount ?? (selection.mode === 'all' ? selection.totalCount : 0);
  const busy = query.isFetching;
  useEffect(() => {
    if (query.data && query.data.page !== pagination.pageIndex) setPagination((current) => ({ ...current, pageIndex: query.data.page }));
  }, [query.data, pagination.pageIndex]);
  const isSelected = (id: string) => selection.mode === 'all' ? !selection.excluded[id] : id in selection.records;
  const toggleRows = (records: T[], checked: boolean) => setSelection((current) => {
    if (current.mode === 'all') {
      const excluded = { ...current.excluded };
      for (const row of records) { if (checked) delete excluded[row.id]; else excluded[row.id] = true; }
      return { ...current, excluded };
    }
    const selected = { ...current.records };
    for (const row of records) { if (checked) selected[row.id] = row.email; else delete selected[row.id]; }
    return { mode: 'explicit', records: selected };
  });
  const clearSelection = () => setSelection({ mode: 'explicit', records: {} });
  const table = useReactTable({
    data, columns,
    state: { sorting, pagination },
    onSortingChange: (updater) => { setSorting(updater); setPagination((current) => ({ ...current, pageIndex: 0 })); },
    onPaginationChange: setPagination,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableMultiSort: false,
    rowCount: matches,
  });
  const rows = table.getRowModel().rows;
  const selectedCount = selection.mode === 'all' ? Math.max(0, matches - Object.keys(selection.excluded).length) : Object.keys(selection.records).length;
  const recipients = selection.mode === 'explicit' ? [...new Set(Object.values(selection.records).map((email) => email.trim().toLowerCase()))] : [];
  const selectedOnPage = () => (
    <SelectionCheckbox
      label={`Select all ${title.toLowerCase()} on this page`}
      checked={data.length > 0 && data.every((row) => isSelected(row.id))}
      mixed={data.some((row) => isSelected(row.id)) && !data.every((row) => isSelected(row.id))}
      onChange={(checked) => { if (!busy) toggleRows(data, checked); }}
    />
  );
  return (
    <section
      aria-label={title}
      className='min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs'
    >
      <div className='space-y-4 border-b border-slate-100 p-4 sm:p-6'>
        <div>
          <h2 className='text-lg font-semibold'>{title}</h2>
        </div>
        <div className='flex flex-col gap-3 sm:flex-row'>
          <input
            type='search'
            aria-label={`Search ${title.toLowerCase()}`}
            placeholder='Search name, email, status…'
            maxLength={200}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              clearSelection();
              table.setPageIndex(0);
            }}
            className='min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm'
          />
          <select
            aria-label={`Sort ${title.toLowerCase()}`}
            value={sorting[0]?.id ?? ''}
            onChange={(event) => {
              table.setPageIndex(0);
              setSorting(
                event.target.value
                  ? [{ id: event.target.value, desc: false }]
                  : [],
              );
            }}
            className='rounded-lg border border-slate-300 px-3 py-2 text-sm'
          >
            <option value=''>Default order</option>
            {table
              .getAllLeafColumns()
              .filter((column) => column.getCanSort())
              .map((column) => (
                <option key={column.id} value={column.id}>
                  {String(column.columnDef.header)}
                </option>
              ))}
          </select>
          <button
            type='button'
            disabled={!sorting.length}
            onClick={() =>
              setSorting((current) =>
                current.map((sort) => ({ ...sort, desc: !sort.desc })),
              )
            }
            className='rounded-lg border px-3 py-2 text-sm disabled:opacity-40'
          >
            {sorting[0]?.desc ? 'Descending ↓' : 'Ascending ↑'}
          </button>
        </div>
        {selectedCount > 0 && (
          <div className='flex flex-wrap items-center gap-3 text-sm'>
            <span role='status'>
              {selection.mode === 'all' ? `${selectedCount} matching rows selected across all pages` : `${selectedCount} selected · ${recipients.length} unique email addresses`}
            </span>
            <button
              type='button'
              disabled={!matches || busy}
              onClick={() => setSelection({ mode: 'all', search, totalCount: matches, excluded: {} })}
              className='underline disabled:opacity-40'
            >
              Select all {matches} matching rows
            </button>
            <button
              type='button'
              disabled={!selectedCount}
              onClick={clearSelection}
              className='underline disabled:opacity-40'
            >
              Clear selection
            </button>
          </div>
        )}
        {recipients.length > 0 && (
          <details className='text-sm'>
            <summary className='cursor-pointer'>
              Review selected email addresses
            </summary>
            <ul className='mt-2 max-h-40 overflow-auto'>
              {recipients.map((email) => (
                <li key={email} className='break-all py-1'>
                  {email}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
      {query.isLoading && <p role='status' className='p-4 text-sm'>Loading records…</p>}
      {query.isError && <div role='alert' className='p-4 text-sm text-red-700'>Unable to load records. <button type='button' onClick={() => void query.refetch()} className='underline'>Retry</button></div>}
      <div className='hidden overflow-x-auto md:block'>
        <table aria-label={title} className='w-full text-left text-sm'>
          <thead className='bg-slate-50 text-slate-600'>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                <th scope='col' className='p-4'>
                  {selectedOnPage()}
                </th>
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    scope='col'
                    aria-sort={
                      header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                          ? 'descending'
                          : 'none'
                    }
                    className='whitespace-nowrap p-4 font-medium'
                  >
                    <button
                      type='button'
                      disabled={!header.column.getCanSort()}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === 'asc'
                        ? ' ↑'
                        : header.column.getIsSorted() === 'desc'
                          ? ' ↓'
                          : ''}
                    </button>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className='divide-y divide-slate-100'>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={isSelected(row.id) ? 'bg-blue-50' : ''}
              >
                <td className='p-4'>
                  <SelectionCheckbox
                    label={`Select ${row.original.email} (${row.id})`}
                    checked={isSelected(row.id)}
                    onChange={(checked) => { if (!busy) toggleRows([row.original], checked); }}
                  />
                </td>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className='max-w-64 wrap-break-word p-4'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='md:hidden'>
        <label className='flex items-center gap-3 border-b p-4 text-sm'>
          {selectedOnPage()} Select this page
        </label>
        <ul className='divide-y divide-slate-100'>
          {rows.map((row) => (
            <li
              key={row.id}
              className={`p-4 ${isSelected(row.id) ? 'bg-blue-50' : ''}`}
            >
              <label className='mb-3 flex items-center gap-3 text-sm font-medium'>
                <SelectionCheckbox
                  label={`Select ${row.original.email} (${row.id})`}
                  checked={isSelected(row.id)}
                  onChange={(checked) => { if (!busy) toggleRows([row.original], checked); }}
                />
                <span className='min-w-0 break-all'>{row.original.email}</span>
              </label>
              <dl className='space-y-2'>
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    className='grid grid-cols-[6rem_minmax(0,1fr)] gap-3 text-sm'
                  >
                    <dt className='text-slate-500'>
                      {String(cell.column.columnDef.header)}
                    </dt>
                    <dd className='min-w-0 wrap-break-word'>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </div>
      {!query.isLoading && !query.isError && rows.length === 0 && (
        <p className='p-8 text-center text-sm text-slate-500'>
          {search ? 'No matching records.' : 'No records yet.'}
        </p>
      )}
      <div className='flex flex-wrap items-center justify-between gap-3 border-t p-4 text-sm'>
        <label>
          Rows per page{' '}
          <select
            aria-label={`${title} rows per page`}
            value={table.getState().pagination.pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
            className='ml-2 rounded border p-1'
          >
            {[10, 25, 50].map((size) => (
              <option key={size}>{size}</option>
            ))}
          </select>
        </label>
        <span>
          Page {matches ? table.getState().pagination.pageIndex + 1 : 0} of{' '}
          {table.getPageCount()}
        </span>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={() => table.previousPage()}
            disabled={busy || !table.getCanPreviousPage()}
            className='rounded border px-3 py-2 disabled:opacity-40'
          >
            Previous
          </button>
          <button
            type='button'
            onClick={() => table.nextPage()}
            disabled={busy || !table.getCanNextPage()}
            className='rounded border px-3 py-2 disabled:opacity-40'
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
