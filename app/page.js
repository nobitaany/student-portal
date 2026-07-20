'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ rollNumber: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('student_session', JSON.stringify(data.student));
        router.push('/dashboard');
      } else {
        setError(data.error || 'Authentication credential mismatch.');
      }
    } catch {
      setError('Communication loss with auth service.');
    }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '330px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <h2 style={{ margin: 0, textAlign: 'center', color: '#1e3a8a', fontSize: '1.5rem' }}>Student Allocation Login</h2>
        {error && <p style={{ color: '#b91c1c', fontSize: '0.85rem', margin: 0, backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', textAlign: 'center', fontWeight: '500' }}>{error}</p>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '6px', color: '#4b5563' }}>Roll Number</label>
          <input placeholder="e.g., 23/CS/01" required value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '6px', color: '#4b5563' }}>Password</label>
          <input placeholder="password" type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }} />
        </div>
        
        <button type="submit" disabled={loading} style={{ background: '#2563eb', color: 'white', padding: '0.8rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '0.5rem' }}>
          {loading ? 'Opening Database Session...' : 'Sign In'}
        </button>
      </form>
    </main>
  );
}
