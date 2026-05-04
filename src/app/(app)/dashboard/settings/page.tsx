'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, Loader2, Globe, Mail, DollarSign, Key, SquarePlay, Database, FileJson, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PlatformSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  
  const [formData, setFormData] = useState({
    platformName: 'Antigravity LMS',
    supportEmail: '',
    currency: 'USD',
    allowRegistrations: true,
    smtpUser: '',
    smtpPass: '',
    // Sensitive fields
    youtubeClientId: '',
    youtubeClientSecret: '',
    youtubeRefreshToken: '',
    googleCredentialsJson: '',
    mongodbUri: '',
  });
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; error?: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!formData.smtpUser || !formData.smtpPass) {
      setTestResult({ error: 'Please enter SMTP User and App Password first' });
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/settings/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpUser: formData.smtpUser,
          smtpPass: formData.smtpPass
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setTestResult({ success: true });
      } else {
        setTestResult({ error: data.error || 'Connection failed' });
      }
    } catch (err) {
      setTestResult({ error: 'Failed to reach API' });
    } finally {
      setTestLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        // Re-fetch to get masked values
        fetchSettings();
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleSecret = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin" style={{ color: 'var(--primary)' }} size={40} />
      </div>
    );
  }

  return (
    <div className="py-12 px-6">
      <div className="max-w-4xl mx-auto pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black flex items-center gap-3 mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            <SettingsIcon style={{ color: 'var(--primary)' }}/> Platform Settings
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Configure your LMS platform preferences, brand identity, and system API keys.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* General Settings */}
            <div className="p-8 rounded-3xl border shadow-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Globe size={20} style={{ color: 'var(--primary)' }} /> General Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Platform Name</label>
                  <input 
                    name="platformName" 
                    value={formData.platformName} 
                    onChange={handleChange} 
                    className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors text-sm font-medium" 
                    style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Support Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-3.5" style={{ color: 'var(--text-muted)' }} />
                    <input 
                      type="email"
                      name="supportEmail" 
                      value={formData.supportEmail} 
                      onChange={handleChange} 
                      className="w-full rounded-xl pl-11 pr-4 py-3 focus:outline-none transition-colors text-sm font-medium"
                      style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* YouTube Configuration */}
            <div className="p-8 rounded-3xl border shadow-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <SquarePlay size={20} className="text-[#FF0000]" /> YouTube API (Video Storage)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold mb-1.5 block uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Client ID</label>
                  <input 
                    name="youtubeClientId" 
                    value={formData.youtubeClientId} 
                    onChange={handleChange}
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-colors"
                    style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                  />
                </div>
                <div className="relative">
                  <label className="text-[11px] font-bold mb-1.5 block uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Client Secret</label>
                  <input 
                    type={showSecrets['youtubeClientSecret'] ? 'text' : 'password'}
                    name="youtubeClientSecret" 
                    value={formData.youtubeClientSecret} 
                    onChange={handleChange}
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-colors pr-12"
                    style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                  />
                  <button type="button" onClick={() => toggleSecret('youtubeClientSecret')} className="absolute right-4 top-9 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                    {showSecrets['youtubeClientSecret'] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative">
                  <label className="text-[11px] font-bold mb-1.5 block uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Refresh Token</label>
                  <input 
                    type={showSecrets['youtubeRefreshToken'] ? 'text' : 'password'}
                    name="youtubeRefreshToken" 
                    value={formData.youtubeRefreshToken} 
                    onChange={handleChange}
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-colors pr-12"
                    style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                  />
                  <button type="button" onClick={() => toggleSecret('youtubeRefreshToken')} className="absolute right-4 top-9 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                    {showSecrets['youtubeRefreshToken'] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-[10px] font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <AlertCircle size={12} /> Obtain these from the Google OAuth Playground using the 'YouTube Data API v3' scope.
                </p>
              </div>
            </div>

            {/* Email Configuration (SMTP) */}
            <div className="p-8 rounded-3xl border shadow-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Globe size={20} className="text-[#4285F4]" /> Email Configuration (SMTP - Gmail)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold mb-1.5 block uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Gmail Address</label>
                  <input 
                    name="smtpUser" 
                    value={formData.smtpUser} 
                    onChange={handleChange}
                    placeholder="your-email@gmail.com"
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-colors"
                    style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                  />
                </div>
                <div className="relative">
                  <label className="text-[11px] font-bold mb-1.5 block uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>App Password</label>
                  <input 
                    type={showSecrets['smtpPass'] ? 'text' : 'password'}
                    name="smtpPass" 
                    value={formData.smtpPass} 
                    onChange={handleChange}
                    placeholder="16-character app password"
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-colors pr-12"
                    style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                  />
                  <button type="button" onClick={() => toggleSecret('smtpPass')} className="absolute right-4 top-9 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                    {showSecrets['smtpPass'] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-start pt-2">
                  <button
                    type="button"
                    onClick={handleTestSmtp}
                    disabled={testLoading}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                  >
                    {testLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    Test SMTP Connection
                  </button>

                  {testResult && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-2 ${testResult.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      {testResult.success ? 'Connection Successful!' : testResult.error}
                    </motion.div>
                  )}
                </div>
                <p className="text-[10px] font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <AlertCircle size={12} /> Used for sending Password Reset OTPs. Use a Google App Password, not your regular password.
                </p>
              </div>
            </div>

            {/* Google Drive Configuration */}
            <div className="p-8 rounded-3xl border shadow-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <FileJson size={20} className="text-blue-500" /> Google Drive (PDF / Doc Storage)
              </h2>
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Service Account JSON</label>
                <div className="relative">
                  <textarea 
                    name="googleCredentialsJson" 
                    value={formData.googleCredentialsJson} 
                    onChange={handleChange} 
                    rows={4}
                    className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors font-mono text-xs font-medium resize-none" 
                    style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                    placeholder='{ "type": "service_account", ... }'
                  />
                  <button type="button" onClick={() => toggleSecret('googleCredentialsJson')} className="absolute right-4 bottom-4 hover:opacity-80 flex items-center gap-2 text-[10px] font-bold px-2.5 py-1.5 rounded-lg" style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    {showSecrets['googleCredentialsJson'] ? <EyeOff size={14} /> : <Eye size={14} />} 
                    {showSecrets['googleCredentialsJson'] ? 'Hide Content' : 'Show Content'}
                  </button>
                </div>
                <p className="text-[10px] font-semibold mt-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}><AlertCircle size={12} /> Paste the entire content of your Service Account JSON file here.</p>
              </div>
            </div>

            {/* Infrastructure */}
            <div className="p-8 rounded-3xl border shadow-sm" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Database size={20} className="text-green-500" /> Database & Core Infrastructure
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-muted)' }}>MongoDB Connection URI</label>
                  <div className="relative">
                    <input 
                      type={showSecrets['mongodbUri'] ? 'text' : 'password'}
                      name="mongodbUri" 
                      value={formData.mongodbUri} 
                      onChange={handleChange} 
                      className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors font-mono text-xs font-medium pr-12" 
                      style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                    />
                    <button type="button" onClick={() => toggleSecret('mongodbUri')} className="absolute right-4 top-3 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                      {showSecrets['mongodbUri'] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-[10px] font-semibold mt-2 flex items-center gap-1.5" style={{ color: 'red' }}><AlertCircle size={12} /> Changing this requires a server restart to take effect.</p>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Default Currency</label>
                    <select 
                      name="currency" 
                      value={formData.currency} 
                      onChange={handleChange} 
                      className="rounded-xl px-4 py-3 focus:outline-none transition-colors cursor-pointer appearance-none min-w-[120px] text-sm font-bold"
                      style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="LKR">LKR (Rs)</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer group mt-4 md:mt-0 pt-0 md:pt-6">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        name="allowRegistrations"
                        checked={formData.allowRegistrations}
                        onChange={handleChange}
                        className="peer sr-only" 
                      />
                      <div className="w-11 h-6 rounded-full peer transition-colors" style={{ background: formData.allowRegistrations ? 'var(--primary)' : 'var(--border-subtle)' }}></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </div>
                    <span className="text-sm font-bold group-hover:opacity-80 transition-opacity" style={{ color: 'var(--foreground)' }}>Enable new student registrations</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-6 flex items-center gap-4 p-4 rounded-2xl border shadow-xl z-10" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
              <button 
                type="submit" 
                disabled={loading} 
                className="px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 flex items-center gap-2 text-white" 
                style={{ background: 'var(--primary)', boxShadow: '0 4px 12px var(--primary-glow)' }}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Save Settings
              </button>
              
              {saved && (
                <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-green-500 font-bold text-sm flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Config updated successfully
                </motion.span>
              )}
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
}
