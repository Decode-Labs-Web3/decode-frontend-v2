'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faIdBadge, faCamera, faPen, faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

interface PersonalProps {
  user?: {
    _id?: string;
    display_name?: string;
    username?: string;
    email?: string;
    role?: string;
    bio?: string;
    avatar_fallback_url?: string;
  };
}

export default function Personal({ user }: PersonalProps) {
  const [form, setForm] = useState({
    display_name: user?.display_name || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editSection, setEditSection] = useState<'none' | 'basic' | 'contact' | 'about' | 'photo'>('none');

  useEffect(() => {
    setForm({
      display_name: user?.display_name || '',
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
    });
  }, [user]);

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

      {/* Profile header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-6 mb-8">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 overflow-hidden">
              <img
                src={user?.avatar_fallback_url || '/images/icons/user-placeholder.png'}
                alt={user?.username || 'Avatar'}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => setEditSection(editSection === 'photo' ? 'none' : 'photo')}
              className="absolute -bottom-1 -right-1 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faCamera} />
              Change
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-semibold truncate">{form.display_name || user?.username || 'Your name'}</p>
            <p className="text-sm text-gray-400 truncate">{form.email || 'you@example.com'}</p>
          </div>
        </div>
        {message && (
          <div className="mt-4 text-sm px-3 py-2 rounded bg-white/10 border border-white/10 text-gray-200">
            {message}
          </div>
        )}
        {editSection === 'photo' && (
          <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
            Avatar upload is not implemented yet. Please provide a backend endpoint for avatar uploads and I will wire it up.
          </div>
        )}
      </div>

      {/* Sections grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Basic info */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <h3 className="font-semibold">Basic info</h3>
              <p className="text-xs text-gray-400">Name and username</p>
            </div>
            <button
              type="button"
              onClick={() => setEditSection(editSection === 'basic' ? 'none' : 'basic')}
              className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <FontAwesomeIcon icon={editSection === 'basic' ? faXmark : faPen} />
              {editSection === 'basic' ? 'Close' : 'Edit'}
            </button>
          </div>
          <div className="p-5 space-y-4">
            {editSection !== 'basic' ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Display name</p>
                    <p className="text-white font-medium">{user?.display_name || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Username</p>
                    <p className="text-white font-medium">{user?.username || '-'}</p>
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Display name</label>
                  <input
                    name="display_name"
                    value={form.display_name}
                    onChange={handleChange}
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Your display name"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Username</label>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Your username"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditSection('none'); setForm({
                      display_name: user?.display_name || '',
                      username: user?.username || '',
                      email: user?.email || '',
                      bio: user?.bio || '',
                    }); }}
                    className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Contact info */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <h3 className="font-semibold">Contact info</h3>
              <p className="text-xs text-gray-400">Email address</p>
            </div>
            <button
              type="button"
              onClick={() => setEditSection(editSection === 'contact' ? 'none' : 'contact')}
              className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <FontAwesomeIcon icon={editSection === 'contact' ? faXmark : faPen} />
              {editSection === 'contact' ? 'Close' : 'Edit'}
            </button>
          </div>
          <div className="p-5 space-y-4">
            {editSection !== 'contact' ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-green-400">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white font-medium">{user?.email || '-'}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditSection('none'); setForm({
                      display_name: user?.display_name || '',
                      username: user?.username || '',
                      email: user?.email || '',
                      bio: user?.bio || '',
                    }); }}
                    className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* About me */}
        <div className="rounded-2xl border border-white/10 bg-white/5 lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <h3 className="font-semibold">About me</h3>
              <p className="text-xs text-gray-400">A short description about you</p>
            </div>
            <button
              type="button"
              onClick={() => setEditSection(editSection === 'about' ? 'none' : 'about')}
              className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <FontAwesomeIcon icon={editSection === 'about' ? faXmark : faPen} />
              {editSection === 'about' ? 'Close' : 'Edit'}
            </button>
          </div>
          <div className="p-5">
            {editSection !== 'about' ? (
              <p className="text-sm text-gray-300 whitespace-pre-wrap min-h-[48px]">{user?.bio || '—'}</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Bio</label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="A short bio about you"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditSection('none'); setForm({
                      display_name: user?.display_name || '',
                      username: user?.username || '',
                      email: user?.email || '',
                      bio: user?.bio || '',
                    }); }}
                    className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
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


