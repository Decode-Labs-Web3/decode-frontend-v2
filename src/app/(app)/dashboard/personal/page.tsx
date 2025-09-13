'use client';

import Image from 'next/image';
import App from '@/components/(app)';
import { UserInfoContext } from '../layout';
import { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faCamera, faPen, faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';

export default function Page() {
  const user = useContext(UserInfoContext);
  const [form, setForm] = useState({
    display_name: user?.display_name || '',
    username: user?.username || '',
    role: user?.role || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar_fallback_url || '/images/icons/user-placeholder.png');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editSection, setEditSection] = useState<'profile' | 'username' | 'email' | 'none'>('none');

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
        headers: { 
          'Content-Type': 'application/json',
          'Frontend-Internal-Request': 'true'
        },
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
      <App.PageHeader 
        title="Personal info" 
        description="Manage your personal details and how they appear." 
      />

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 backdrop-blur-sm p-8 mb-8 shadow-2xl">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Profile Information</h3>
            <p className="text-sm text-gray-400">Manage your personal details and appearance</p>
          </div>
          {editSection !== 'profile' ? (
            <button
              type="button"
              onClick={() => setEditSection('profile')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <FontAwesomeIcon icon={faPen} className="text-sm" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setEditSection('none')} 
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-white/20 overflow-hidden shadow-xl">
                <Image src={avatarUrl} alt={'Avatar'} width={128} height={128} className="w-full h-full object-cover" unoptimized />
              </div>
              {editSection === 'profile' && (
                <button
                  type="button"
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl flex items-center justify-center"
                >
                  <div className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
                    <FontAwesomeIcon icon={faCamera} />
                    Change Photo
                  </div>
                </button>
              )}
            </div>
            {editSection === 'profile' && (
              <p className="text-xs text-gray-400 mt-3 text-center lg:text-left">Click to change avatar</p>
            )}
          </div>

          {/* Profile Info Section */}
          <div className="flex-1 space-y-6">
            {/* Display Name */}
            <div>
              {editSection !== 'profile' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-white">{form.display_name || 'Your name'}</h2>
                    {form.role && (
                      <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-300 text-sm font-medium border border-blue-500/30">
                        {form.role.charAt(0).toUpperCase() + form.role.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-300">Display Name</label>
                  <input
                    name="display_name"
                    value={form.display_name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
                    placeholder="Enter your display name"
                  />
                </div>
              )}
            </div>

            {/* Bio Section */}
            <div className="pt-6 border-t border-white/10">
              {editSection !== 'profile' ? (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white">About me</h4>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-gray-200 leading-relaxed">
                      {form.bio || 'No bio added yet. Click edit to add a short description about yourself.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-300">About me</label>
                  <textarea 
                    name="bio" 
                    value={form.bio} 
                    onChange={handleChange} 
                    rows={4} 
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 resize-none" 
                    placeholder="Tell us about yourself..." 
                  />
                  <div className="flex justify-end">
                    <button type="submit" disabled={saving} onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200">
                      <FontAwesomeIcon icon={faCheck} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {message && (
          <div className="mt-8 p-4 rounded-xl bg-white/10 border border-white/20 text-sm text-gray-200">
            {message}
          </div>
        )}
        
        {editSection === 'profile' && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCamera} />
              Avatar upload functionality will be available soon
            </div>
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

      </div>
    </div>
  );
}


