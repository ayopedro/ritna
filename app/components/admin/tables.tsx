'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type {
  AdminOrderRow,
  AdminWaitlistRow,
  AdminTablesProps,
} from '@/app/lib/types';
import { AdminDataTable } from './data-table';

function formatDate(date: string | null) {
  return date ? new Date(date).toLocaleDateString('en-GB') : '—';
}

export function AdminTables({ data }: AdminTablesProps) {
  const orders = useMemo<ColumnDef<AdminOrderRow>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Order',
        cell: ({ row }) => (
          <span title={row.id} className='font-mono text-xs'>
            #{row.id.slice(0, 8)}
          </span>
        ),
      },
      {
        id: 'customer',
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        header: 'Customer',
      },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'status',
        header: 'Order status',
        cell: ({ row }) => (
          <span className='capitalize'>{row.original.status}</span>
        ),
      },
      {
        id: 'payment',
        accessorFn: (row) =>
          row.paymentStatus === 'succeeded' ? 'Paid' : row.paymentStatus,
        header: 'Payment status',
        cell: ({ getValue }) => (
          <span className='capitalize'>{String(getValue())}</span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Placed',
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
    ],
    [],
  );
  const waitlist = useMemo<ColumnDef<AdminWaitlistRow>[]>(
    () => [
      {
        id: 'name',
        accessorFn: (row) => `${row.firstName} ${row.lastName ?? ''}`,
        header: 'Name',
      },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ getValue }) => getValue() ?? '—',
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <span className='capitalize'>{row.original.category}</span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Joined',
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
    ],
    [],
  );
  return (
    <div className='min-w-0 space-y-6'>
      <AdminDataTable
        title='Orders'
        data={data.orderRows}
        columns={orders}
        totalCount={data.orderCount}
      />
      <AdminDataTable
        title='Waitlist'
        data={data.waitlistRows}
        columns={waitlist}
        totalCount={data.waitlistCount}
      />
    </div>
  );
}
