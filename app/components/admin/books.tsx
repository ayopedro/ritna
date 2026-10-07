'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetBooks } from '@/app/services/queries/book';
import { QUERY_KEYS } from '@/app/lib/constants';
import { formatPrice } from '@/app/lib/utils';
import type { Book } from '@/app/lib/types';
import { Modal } from '@/app/components/modal';

function BookEditor({ book, onSaved, onClose }: { book: Book; onSaved: () => void; onClose: () => void }) {
  const [title, setTitle] = useState(book.title);
  const [description, setDescription] = useState(book.description ?? '');
  const [type, setType] = useState<string>(book.type);
  const [image, setImage] = useState(book.image ?? '');
  const [price, setPrice] = useState(String(book.price));
  const [available, setAvailable] = useState(book.available);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const fieldClass = 'mt-1 w-full rounded-lg border border-slate-300 p-2';

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/books/${book.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: description.trim() || null, type, image: image.trim() || null, price: Number(price), available }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to save book.');
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.books });
      onSaved();
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to save book.'); }
    finally { setSaving(false); }
  }

  return <Modal isOpen onClose={() => { if (!saving) onClose(); }} title='Update book details' description={`Edit ${book.title}. Changes apply to new orders.`}>
    <form onSubmit={save} className='space-y-4 text-slate-900'>
      <label className='block text-sm'>Title<input required maxLength={255} value={title} onChange={(event) => setTitle(event.target.value)} className={fieldClass} /></label>
      <label className='block text-sm'>Description<textarea maxLength={1000} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className={fieldClass} /></label>
      <div className='grid gap-4 sm:grid-cols-2'>
        <label className='block text-sm'>Edition<select value={type} onChange={(event) => setType(event.target.value)} className={fieldClass}><option value='hardcover'>Hardcover</option><option value='softcover'>Softcover</option><option value='institutional'>Institutional</option></select></label>
        <label className='block text-sm'>Price (NGN, whole naira)<input type='number' required min={available ? 1 : 0} max={2147483647} step={1} value={price} onChange={(event) => setPrice(event.target.value)} className={fieldClass} /></label>
      </div>
      <label className='block text-sm'>Cover image<input maxLength={255} placeholder='/assets/cover.jpg or https://…' value={image} onChange={(event) => setImage(event.target.value)} className={fieldClass} /></label>
      <label className='flex items-center gap-2 text-sm'><input type='checkbox' checked={available} onChange={(event) => setAvailable(event.target.checked)} />Available for preorder</label>
      {error && <p role='alert' className='text-sm text-red-700'>{error}</p>}
      <div className='flex justify-end gap-3'>
        <button type='button' disabled={saving} onClick={onClose} className='rounded-lg border border-slate-300 px-4 py-2 text-sm'>Cancel</button>
        <button disabled={saving} className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50'>{saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </form>
  </Modal>;
}

export function AdminBooks() {
  const { data: books = [], isLoading, isError, refetch } = useGetBooks<Book[]>();
  const [editing, setEditing] = useState<Book | null>(null);
  const [message, setMessage] = useState('');
  return <section aria-label='Book management' className='mb-8 min-w-0 rounded-2xl border border-slate-200 bg-white p-5'>
    <h2 className='mb-4 text-xl font-semibold'>Books</h2>
    {isLoading && <p role='status'>Loading books…</p>}
    {isError && <p role='alert'>Unable to load books. <button onClick={() => void refetch()} className='underline'>Retry</button></p>}
    {message && <p role='status' className='mb-4 text-sm text-emerald-700'>{message}</p>}
    {!isLoading && !isError && <div className='overflow-x-auto'>
      <table aria-label='Books' className='w-full text-left text-sm'>
        <thead className='border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500'><tr>{['Book', 'Edition', 'Price', 'Availability', 'Edit'].map((title) => <th key={title} scope='col' className='px-3 py-3 font-medium'>{title}</th>)}</tr></thead>
        <tbody className='divide-y divide-slate-100'>
          {books.map((book) => <tr key={book.id}>
            <td className='min-w-44 px-3 py-4 font-medium'>{book.title}</td>
            <td className='px-3 py-4 capitalize'>{book.type}</td>
            <td className='whitespace-nowrap px-3 py-4 tabular-nums'>{formatPrice(book.price)}</td>
            <td className='px-3 py-4'><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${book.available ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20'}`}>{book.available ? 'Available' : 'Unavailable'}</span></td>
            <td className='px-3 py-4'><button type='button' aria-label={`Edit ${book.title}`} title='Edit book' onClick={() => { setMessage(''); setEditing(book); }} className='inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'><Pencil aria-hidden='true' className='h-4 w-4' /></button></td>
          </tr>)}
          {books.length === 0 && <tr><td colSpan={5} className='px-3 py-6 text-center text-slate-500'>No books found.</td></tr>}
        </tbody>
      </table>
    </div>}
    {editing && <BookEditor key={editing.id} book={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setMessage('Book details saved.'); }} />}
  </section>;
}
