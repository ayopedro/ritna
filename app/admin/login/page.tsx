'use client';

import { useEffect, useRef, useState } from 'react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const verifying = useRef(false);
  const [signingIn, setSigningIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const secret = new URLSearchParams(window.location.hash.slice(1)).get('token');
    if (!secret || verifying.current) return;
    verifying.current = true;
    window.history.replaceState(null, '', '/admin/login');
    setSigningIn(true);
    async function signIn() {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: secret }),
        });
        const result = await response.json();
        if (response.ok) { window.location.replace('/admin'); return; }
        setMessage(result.message || 'Unable to sign in. Request a new login link.');
      } catch { setMessage('Unable to connect. Please request a new login link.'); }
      setSigningIn(false);
    }
    void signIn();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      setMessage(result.message || 'Unable to sign in. Please try again.');
    } catch { setMessage('Unable to connect. Please try again.'); }
    finally { setBusy(false); }
  }

  return (
    <main className='min-h-screen bg-slate-50 px-4 py-20 text-slate-900'>
      <form onSubmit={submit} className='mx-auto max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm'>
        <p className='text-xs font-semibold uppercase tracking-widest text-blue-600'>RITNA</p>
        <h1 className='text-3xl font-semibold'>Admin login</h1>
        <p className='text-sm text-slate-500'>{signingIn ? 'Signing you in…' : 'Enter your admin email to receive a secure login link.'}</p>
        {!signingIn && <label className='block text-sm font-medium'>Email address
          <input type='email' required autoComplete='email' maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} className='mt-2 w-full rounded-lg border border-slate-300 p-3' />
        </label>}
        {message && <p role='status' className='text-sm'>{message}</p>}
        {!signingIn && <button disabled={busy} className='w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-50'>{busy ? 'Please wait…' : 'Send login link'}</button>}
      </form>
    </main>
  );
}
