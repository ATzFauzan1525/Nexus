import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { StatusBadge } from './UI';
import { Search, MapPin } from 'lucide-react';

export default function LacakWidget() {
  const [nomorSurat, setNomorSurat] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const currentRoomRef = useRef('');

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!nomorSurat.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await api.trackSurat(nomorSurat.trim());
      setResult(data);

      if (!socketRef.current) {
        const newSocket = io(window.location.origin, {
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          auth: { isPublic: true },
        });

        newSocket.on('connect', () => {
          newSocket.emit('lacak:join', nomorSurat.trim());
          currentRoomRef.current = nomorSurat.trim();
        });

        newSocket.on('lacak:update', (updateData) => {
          setResult((prev) => prev ? { ...prev, ...updateData } : prev);
        });

        socketRef.current = newSocket;
      } else {
        if (currentRoomRef.current) {
          socketRef.current.emit('lacak:leave', currentRoomRef.current);
        }
        if (socketRef.current.connected) {
          socketRef.current.emit('lacak:join', nomorSurat.trim());
        } else {
          socketRef.current.on('connect', () => {
            socketRef.current.emit('lacak:join', nomorSurat.trim());
          });
        }
        currentRoomRef.current = nomorSurat.trim();
      }
    } catch (err) {
      setError(err.message || 'Surat tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-ds-h4 mb-3">Lacak Surat</h2>
      <form onSubmit={handleTrack} className="flex gap-2 mb-3">
        <input
          type="text"
          value={nomorSurat}
          onChange={(e) => setNomorSurat(e.target.value)}
          placeholder="Masukkan nomor surat..."
          className="input-field flex-1"
        />
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2" style={{ padding: '8px 14px' }}>
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search size={16} />}
          Cek
        </button>
      </form>

      {error && (
        <div className="px-3 py-2 rounded-md text-sm mb-2" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC2626', color: '#991B1B' }}>
          {error}
        </div>
      )}

      {result && (
        <div className="p-3 rounded-md" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs" style={{ color: '#475569' }}>Nomor Surat</p>
              <p className="font-bold" style={{ color: '#0F172A' }}>{result.nomorSurat}</p>
            </div>
            <StatusBadge status={result.status} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm mb-2" style={{ color: '#334155' }}>
            <div><span style={{ color: '#475569' }}>Pengirim:</span> {result.pengirim}</div>
            <div><span style={{ color: '#475569' }}>Perihal:</span> {result.perihal}</div>
          </div>
          <div className="p-2 rounded-md" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#16A34A' }} />
              <span className="text-xs font-medium" style={{ color: '#16A34A' }}>Live</span>
            </div>
            <p className="text-xs" style={{ color: '#1D4ED8' }}>Posisi Saat Ini</p>
            <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{result.posisiSaatIni}</p>
          </div>
        </div>
      )}

      {!result && !error && (
        <div className="text-center py-4" style={{ color: '#94A3B8' }}>
          <MapPin size={24} className="mx-auto mb-1" />
          <p className="text-xs">Ketik nomor surat untuk melacak posisi</p>
        </div>
      )}
    </div>
  );
}
