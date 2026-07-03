import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Mail, FileText, Users, ClipboardList,
  ChevronDown, ChevronRight, PenLine, Inbox, History,
} from 'lucide-react';

const menuConfig = {
  ADMIN_TU: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      label: 'Surat Masuk', icon: Mail,
      children: [
        { to: '/surat', label: 'Daftar Surat', icon: Inbox },
        { to: '/surat/tambah', label: 'Input Surat Baru', icon: PenLine },
      ],
    },
    { to: '/laporan', label: 'Laporan', icon: FileText },
    { to: '/audit-log', label: 'Audit Log', icon: History },
    { to: '/pengguna', label: 'Manajemen Pengguna', icon: Users },
  ],
  KEPALA_SEKOLAH: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      label: 'Surat Masuk', icon: Mail,
      children: [{ to: '/surat', label: 'Daftar Surat', icon: Inbox }],
    },
    {
      label: 'Disposisi', icon: ClipboardList,
      children: [
        { to: '/disposisi', label: 'Disposisi', icon: ClipboardList },
        { to: '/disposisi/riwayat', label: 'Riwayat Disposisi', icon: FileText },
      ],
    },
    { to: '/audit-log', label: 'Audit Log', icon: History },
  ],
  GURU_STAF: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/disposisi/saya', label: 'Disposisi Saya', icon: ClipboardList },
  ],
  WAKASEK: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/surat', label: 'Surat Masuk (Bidang Saya)', icon: Mail },
    { to: '/disposisi/bidang', label: 'Disposisi Bidang', icon: ClipboardList },
  ],
};

function MenuItem({ item, pathname }) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  if (!hasChildren) {
    const isActive = pathname === item.to || pathname.startsWith(item.to + '/');
    return (
      <Link
        to={item.to}
        className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors no-underline"
        style={{
          backgroundColor: isActive ? '#1D4ED8' : undefined,
          color: isActive ? '#FFFFFF' : '#334155',
        }}
      >
        <Icon size={18} />
        {item.label}
      </Link>
    );
  }

  const isChildActive = item.children.some(
    (child) => pathname === child.to || pathname.startsWith(child.to + '/')
  );

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors"
        style={{
          backgroundColor: isChildActive ? '#EFF6FF' : undefined,
          color: isChildActive ? '#1D4ED8' : '#334155',
        }}
      >
        <Icon size={18} />
        <span className="flex-1 text-left">{item.label}</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {open && (
        <div className="ml-4 mt-0.5 space-y-0.5 pl-3" style={{ borderLeft: '1px solid #E2E8F0' }}>
          {item.children.map((child) => {
            const ChildIcon = child.icon;
            const isActive = pathname === child.to || pathname.startsWith(child.to + '/');
            return (
              <Link
                key={child.to}
                to={child.to}
                className="flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors no-underline"
                style={{
                  backgroundColor: isActive ? '#1D4ED8' : undefined,
                  color: isActive ? '#FFFFFF' : '#475569',
                }}
              >
                <ChildIcon size={16} />
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const items = menuConfig[user?.role] || [];

  return (
    <aside className="w-60 min-h-screen flex-shrink-0" style={{ backgroundColor: '#F1F5F9', borderRight: '1px solid #E2E8F0', width: '240px' }}>
      <nav className="p-4 space-y-1">
        {items.map((item, idx) => (
          <MenuItem key={idx} item={item} pathname={pathname} />
        ))}
      </nav>
    </aside>
  );
}
