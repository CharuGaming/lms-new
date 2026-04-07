'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Loader2, Shield, User as UserIcon, Calendar, FileDown, Key } from 'lucide-react';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function ManageUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchUsers = () => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/admin/users/export');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      alert('Error exporting data');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if ((session.user as any).role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchUsers();
    }
  }, [status, router, session]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    
    setUpdating(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        alert('Failed to update user role');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating user role');
    } finally {
      setUpdating(null);
    }
  };

  const handleAdminResetPassword = async (userId: string, userName: string) => {
    const newPassword = prompt(`Enter new password for ${userName}:`, 'Welcome@123');
    if (!newPassword) return;

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      
      if (res.ok) {
        alert(`Password for ${userName} has been reset successfully.`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to reset password');
      }
    } catch (e) {
      console.error(e);
      alert('Error resetting password');
    } finally {
      setUpdating(null);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              <Users style={{ color: 'var(--accent)' }}/> Manage Users
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>View and manage student and administrator accounts.</p>
          </div>
          
          <button
            onClick={handleExport}
            disabled={exporting || users.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid rgba(245,166,35,0.2)' }}
          >
            {exporting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <FileDown size={18} />
            )}
            Download User Data (Excel)
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl overflow-hidden border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ background: 'var(--background)' }}>
                <tr>
                  <th className="p-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Name</th>
                  <th className="p-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Email</th>
                  <th className="p-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Role</th>
                  <th className="p-4 font-semibold" style={{ color: 'var(--text-muted)' }}>Joined Date</th>
                  <th className="p-4 font-semibold text-right" style={{ color: 'var(--text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map(user => (
                  <tr key={user._id} className="transition-colors hover:bg-black/10 dark:hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-bold">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-secondary">{user.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                        {user.role === 'admin' ? <Shield size={12}/> : <UserIcon size={12}/>}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-muted flex items-center gap-2">
                      <Calendar size={14}/> {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {updating === user._id ? (
                        <Loader2 size={16} className="animate-spin inline-block" style={{ color: 'var(--accent)' }}/>
                      ) : (
                        <div className="flex items-center justify-end">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="bg-black/20 border text-xs rounded-lg px-2 py-1 outline-none"
                            style={{ borderColor: 'var(--border)' }}
                            disabled={user._id === (session?.user as any)?.id}
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleAdminResetPassword(user._id, user.name)}
                            className="p-1 rounded-md hover:bg-white/10 transition-colors ml-2"
                            title="Reset Password"
                            disabled={updating === user._id}
                          >
                            <Key size={14} className="text-accent" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
                No users found.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
