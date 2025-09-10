'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faCamera, faPen, faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

export default function Page() {
  const [form, setForm] = useState({
    display_name: '',
    username: '',
    role: '',
    email: '',
    bio: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string>('/images/icons/user-placeholder.png');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editSection, setEditSection] = useState<'avartar'| 'displayName' | 'username' | 'email' | 'bio' | 'none'>('none');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/users/overview');
        const data = await res.json();
        const user = data?.data || {};
        setForm({
          display_name: user.display_name || '',
          username: user.username || '',
          role: user.role || '',
          email: user.email || '',
          bio: user.bio || '',
        });
        setAvatarUrl(user.avatar_fallback_url || '/images/icons/user-placeholder.png');
      } catch {}
    };
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/users/overview', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        setMessage(data?.message || 'Update failed');
      } else {
        setMessage('Profile updated');
        setEditSection('none');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Personal info</h2>
        <p className="text-gray-400 text-sm">Manage your personal details and how they appear.</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-6 mb-8 shadow-xl">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 overflow-hidden ring-2 ring-blue-500/30">
              <img src={avatarUrl} alt={'Avatar'} className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => setEditSection(editSection === 'avartar' ? 'none' : 'avartar')}
              className="absolute -bottom-1 -right-1 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faCamera} />
              Change
            </button>
          </div>
          <div className="min-w-0 flex-1">
            {editSection !== 'displayName' ? (
              <div className="flex items-center gap-3">
                <p className="text-xl md:text-2xl font-semibold tracking-tight truncate">{form.display_name || 'Your name'}</p>
                {form.role && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-300 text-xs font-medium inline-block ring-1 ring-blue-300/20">
                    {form.role.charAt(0).toUpperCase() + form.role.slice(1)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setEditSection('displayName')}
                  className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1 rounded-full"
                >
                  Edit
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  name="display_name"
                  value={form.display_name}
                  onChange={handleChange}
                  className="w-64 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                  placeholder="Your display name"
                />
                <button type="submit" disabled={saving} className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-3 rounded-full">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setEditSection('none')} className="text-xs bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-3 rounded-full">
                  Close
                </button>
              </form>
            )}
          </div>
        </div>
        {message && (
          <div className="mt-4 text-sm px-3 py-2 rounded bg-white/10 border border-white/10 text-gray-200">
            {message}
          </div>
        )}
        {editSection === 'avartar' && (
          <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
            Avatar upload is not implemented yet.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 h-full min-h-[240px] hover:bg-white/[0.06] transition shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <h3 className="font-semibold tracking-tight">Username info</h3>
              <p className="text-xs text-gray-400">Username</p>
            </div>
            <button type="button" onClick={() => setEditSection(editSection === 'username' ? 'none' : 'username')} className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1">
              <FontAwesomeIcon icon={editSection === 'username' ? faXmark : faPen} />
              {editSection === 'username' ? 'Close' : 'Edit'}
            </button>
          </div>
          <div className="p-5 space-y-4">
            {editSection !== 'username' ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Username</p>
                  <p className="text-white font-medium">{form.username || '-'}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Username</label>
                  <input name="username" value={form.username} onChange={handleChange} className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40" placeholder="Your username" />
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-full transition-colors flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 h-full min-h-[240px] hover:bg-white/[0.06] transition shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <h3 className="font-semibold tracking-tight">Contact info</h3>
              <p className="text-xs text-gray-400">Email address</p>
            </div>
            <button type="button" onClick={() => setEditSection(editSection === 'email' ? 'none' : 'email')} className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1">
              <FontAwesomeIcon icon={editSection === 'email' ? faXmark : faPen} />
              {editSection === 'email' ? 'Close' : 'Edit'}
            </button>
          </div>
          <div className="p-5 space-y-4">
            {editSection !== 'email' ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-green-400">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white font-medium">{form.email || '-'}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40" placeholder="you@example.com" />
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-full transition-colors flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 lg:col-span-2 hover:bg-white/[0.06] transition shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <h3 className="font-semibold tracking-tight">About me</h3>
              <p className="text-xs text-gray-400">A short description about you</p>
            </div>
            <button type="button" onClick={() => setEditSection(editSection === 'bio' ? 'none' : 'bio')} className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1">
              <FontAwesomeIcon icon={faXmark} />
              {editSection === 'bio' ? 'Close' : 'Edit'}
            </button>
          </div>
          <div className="p-5">
            {editSection !== 'bio' ? (
              <p className="text-sm text-gray-300 whitespace-pre-wrap min-h-[48px] leading-6">{form.bio || '—'}</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Bio</label>
                  <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40" placeholder="A short bio about you" />
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-full transition-colors flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


