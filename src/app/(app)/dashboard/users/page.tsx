'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Loader2, Shield, User as UserIcon, Calendar, FileDown, Key, UserPlus, Trash2, X } from 'lucide-react';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
  const [addingUser, setAddingUser] = useState(false);

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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'student' });
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add user');
      }
    } catch (e) {
      console.error(e);
      alert('Error adding user');
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete user "${userName}"? This action cannot be undone.`)) return;
    
    setUpdating(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting user');
    } finally {
      setUpdating(null);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3 mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              <Users style={{ color: 'var(--primary)' }}/> Manage Users
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>View and manage student and administrator accounts.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-transform hover:scale-105 active:scale-95 text-white"
              style={{ background: 'var(--primary)', boxShadow: '0 4px 12px var(--primary-glow)' }}
            >
              <UserPlus size={18} />
              Add New User
            </button>

            <button
              onClick={handleExport}
              disabled={exporting || users.length === 0}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm border transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--card-bg)', color: 'var(--foreground)' }}
            >
              {exporting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <FileDown size={18} />
              )}
              Export XLSX
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border shadow-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left bg-white dark:bg-black/20 text-sm">
              <thead style={{ background: 'var(--background)' }}>
                <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <th className="p-5 font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--text-muted)' }}>Name</th>
                  <th className="p-5 font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--text-muted)' }}>Email</th>
                  <th className="p-5 font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--text-muted)' }}>Role</th>
                  <th className="p-5 font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--text-muted)' }}>Joined Date</th>
                  <th className="p-5 font-bold uppercase tracking-wider text-[11px] text-right" style={{ color: 'var(--text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {users.map(user => (
                  <tr key={user._id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-bold text-[15px]" style={{ color: 'var(--foreground)' }}>{user.name}</span>
                      </div>
                    </td>
                    <td className="p-5 font-medium" style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                        {user.role === 'admin' ? <Shield size={12}/> : <UserIcon size={12}/>}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="p-5 font-medium flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <Calendar size={14}/> {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="p-5 text-right">
                      {updating === user._id ? (
                        <Loader2 size={16} className="animate-spin inline-block" style={{ color: 'var(--primary)' }}/>
                      ) : (
                        <div className="flex items-center justify-end gap-3">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="bg-transparent border text-xs font-bold rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                            style={{ borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                            disabled={user._id === (session?.user as any)?.id}
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleAdminResetPassword(user._id, user.name)}
                            className="p-1.5 rounded-lg transition-colors bg-[var(--primary-light)] hover:bg-[var(--primary)] hover:text-white"
                            style={{ color: 'var(--primary)' }}
                            title="Reset Password"
                            disabled={updating === user._id}
                          >
                            <Key size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            className="p-1.5 rounded-lg transition-colors hover:bg-red-500 hover:text-white"
                            style={{ color: 'rgb(239, 68, 68)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                            title="Delete User"
                            disabled={updating === user._id || user._id === (session?.user as any)?.id}
                          >
                            <Trash2 size={14} />
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

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md p-8 rounded-3xl shadow-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
              <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
              
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3" style={{ color: 'var(--foreground)' }}>
                <UserPlus className="text-[var(--primary)]" /> Add New User
              </h2>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 ml-1" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                    style={{ background: 'var(--background)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 ml-1" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                    style={{ background: 'var(--background)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 ml-1" style={{ color: 'var(--text-muted)' }}>Initial Password</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                    style={{ background: 'var(--background)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 ml-1" style={{ color: 'var(--text-muted)' }}>User Role</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all cursor-pointer"
                    style={{ background: 'var(--background)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={addingUser}
                    className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 text-white"
                    style={{ background: 'var(--primary)', boxShadow: '0 4px 20px var(--primary-glow)' }}
                  >
                    {addingUser ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                    Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
