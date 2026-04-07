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
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="py-12 px-6">
      <div className="max-w-4xl mx-auto pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-extrabold flex items-center gap-3 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            <SettingsIcon style={{ color: 'var(--accent)' }}/> Platform Settings
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure your LMS platform preferences, brand identity, and system API keys.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* General Settings */}
            <div className="p-8 rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Globe size={20} className="text-accent" /> General Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Platform Name</label>
                  <input 
                    name="platformName" 
                    value={formData.platformName} 
                    onChange={handleChange} 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-colors" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Support Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-3.5 text-secondary" />
                    <input 
                      type="email"
                      name="supportEmail" 
                      value={formData.supportEmail} 
                      onChange={handleChange} 
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-accent transition-colors" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* YouTube Configuration */}
            <div className="p-8 rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <SquarePlay size={20} className="text-[#FF0000]" /> YouTube API (Video Storage)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-secondary uppercase tracking-wider">Client ID</label>
                  <input 
                    name="youtubeClientId" 
                    value={formData.youtubeClientId} 
                    onChange={handleChange}
                    className="w-full bg-background border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-accent outline-none"
                  />
                </div>
                <div className="relative">
                  <label className="text-xs font-medium mb-1.5 block text-secondary uppercase tracking-wider">Client Secret</label>
                  <input 
                    type={showSecrets['youtubeClientSecret'] ? 'text' : 'password'}
                    name="youtubeClientSecret" 
                    value={formData.youtubeClientSecret} 
                    onChange={handleChange}
                    className="w-full bg-background border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-accent outline-none pr-12"
                  />
                  <button type="button" onClick={() => toggleSecret('youtubeClientSecret')} className="absolute right-4 top-9 text-secondary hover:text-white">
                    {showSecrets['youtubeClientSecret'] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative">
                  <label className="text-xs font-medium mb-1.5 block text-secondary uppercase tracking-wider">Refresh Token</label>
                  <input 
                    type={showSecrets['youtubeRefreshToken'] ? 'text' : 'password'}
                    name="youtubeRefreshToken" 
                    value={formData.youtubeRefreshToken} 
                    onChange={handleChange}
                    className="w-full bg-background border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-accent outline-none pr-12"
                  />
                  <button type="button" onClick={() => toggleSecret('youtubeRefreshToken')} className="absolute right-4 top-9 text-secondary hover:text-white">
                    {showSecrets['youtubeRefreshToken'] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-secondary italic">Obtain these from the Google OAuth Playground using the 'YouTube Data API v3' scope.</p>
              </div>
            </div>

            {/* Email Configuration (SMTP) */}
            <div className="p-8 rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Mail size={20} className="text-[#4285F4]" /> Email Configuration (SMTP - Gmail)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block text-secondary uppercase tracking-wider">Gmail Address</label>
                  <input 
                    name="smtpUser" 
                    value={formData.smtpUser} 
                    onChange={handleChange}
                    placeholder="your-email@gmail.com"
                    className="w-full bg-background border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-accent outline-none"
                  />
                </div>
                <div className="relative">
                  <label className="text-xs font-medium mb-1.5 block text-secondary uppercase tracking-wider">App Password</label>
                  <input 
                    type={showSecrets['smtpPass'] ? 'text' : 'password'}
                    name="smtpPass" 
                    value={formData.smtpPass} 
                    onChange={handleChange}
                    placeholder="16-character app password"
                    className="w-full bg-background border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-accent outline-none pr-12"
                  />
                  <button type="button" onClick={() => toggleSecret('smtpPass')} className="absolute right-4 top-9 text-secondary hover:text-white">
                    {showSecrets['smtpPass'] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-start pt-2">
                  <button
                    type="button"
                    onClick={handleTestSmtp}
                    disabled={testLoading}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  >
                    {testLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    Test SMTP Connection
                  </button>

                  {testResult && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`text-sm py-2 px-3 rounded-lg flex items-center gap-2 ${testResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      {testResult.success ? 'Connection Successful!' : testResult.error}
                    </motion.div>
                  )}
                </div>
                <p className="text-xs text-secondary italic">Used for sending Password Reset OTPs. Use a Google App Password, not your regular password.</p>
              </div>
            </div>

            {/* Google Drive Configuration */}
            <div className="p-8 rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileJson size={20} className="text-blue-400" /> Google Drive (PDF / Doc Storage)
              </h2>
              <div>
                <label className="block text-sm font-semibold mb-2">Service Account JSON</label>
                <div className="relative">
                  <textarea 
                    name="googleCredentialsJson" 
                    value={formData.googleCredentialsJson} 
                    onChange={handleChange} 
                    rows={4}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-colors font-mono text-xs resize-none" 
                    placeholder='{ "type": "service_account", ... }'
                  />
                  <button type="button" onClick={() => toggleSecret('googleCredentialsJson')} className="absolute right-4 bottom-4 text-secondary hover:text-white flex items-center gap-2 text-xs bg-black/50 px-2 py-1 rounded border border-white/5">
                    {showSecrets['googleCredentialsJson'] ? <EyeOff size={14} /> : <Eye size={14} />} 
                    {showSecrets['googleCredentialsJson'] ? 'Hide Content' : 'Show Content'}
                  </button>
                </div>
                <p className="text-xs text-secondary mt-2">Paste the entire content of your Service Account JSON file here.</p>
              </div>
            </div>

            {/* Infrastructure */}
            <div className="p-8 rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Database size={20} className="text-green-400" /> Database & Core Infrastructure
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">MongoDB Connection URI</label>
                  <div className="relative">
                    <input 
                      type={showSecrets['mongodbUri'] ? 'text' : 'password'}
                      name="mongodbUri" 
                      value={formData.mongodbUri} 
                      onChange={handleChange} 
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-colors font-mono text-xs" 
                    />
                    <button type="button" onClick={() => toggleSecret('mongodbUri')} className="absolute right-4 top-3 text-secondary hover:text-white">
                      {showSecrets['mongodbUri'] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-secondary mt-1">Changing this requires a server restart to take effect.</p>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Default Currency</label>
                    <select 
                      name="currency" 
                      value={formData.currency} 
                      onChange={handleChange} 
                      className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-colors cursor-pointer appearance-none min-w-[120px]"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="LKR">LKR (Rs)</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer group pt-6">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        name="allowRegistrations"
                        checked={formData.allowRegistrations}
                        onChange={handleChange}
                        className="peer sr-only" 
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-accent transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </div>
                    <span className="text-sm font-medium group-hover:text-white transition-colors">Enable new student registrations</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-6 flex items-center gap-4 bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl z-10">
              <button 
                type="submit" 
                disabled={loading} 
                className="px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-accent/20" 
                style={{ background: 'var(--accent)', color: 'var(--background)' }}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Save All Application Settings
              </button>
              
              {saved && (
                <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-green-400 font-semibold text-sm">
                  ✓ Config updated successfully
                </motion.span>
              )}
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
}
