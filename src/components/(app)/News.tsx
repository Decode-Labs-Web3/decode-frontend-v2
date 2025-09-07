'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faClock, faThumbsUp, faComment, faShare } from '@fortawesome/free-solid-svg-icons';

export default function News() {
  const posts = [
    {
      title: 'Decode Portal v1.2 released',
      description: 'We shipped device trust improvements, new wallet linking flow and UI polish across the portal.',
      time: 'Just now',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
      tag: 'Release',
      source: 'Decode Team',
      likes: 128,
      comments: 24,
    },
    {
      title: 'Maintenance window – Saturday 9PM UTC',
      description: 'Short downtime expected while we migrate our auth database for improved resilience.',
      time: '6 hours ago',
      image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop',
      tag: 'Status',
      source: 'Decode Ops',
      likes: 52,
      comments: 9,
    },
    {
      title: 'New: dApp connections page',
      description: 'Review and revoke third‑party app access from a single, easy place.',
      time: 'Yesterday',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
      tag: 'Feature',
      source: 'Product',
      likes: 203,
      comments: 31,
    },
    {
      title: 'API rate limits increased for all plans',
      description: 'Higher burst limits and more consistent throughput for production workloads.',
      time: '2 days ago',
      image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop',
      tag: 'Update',
      source: 'Engineering',
      likes: 77,
      comments: 12,
    },
  ];

  const number = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`);

  return (
    <div className="px-4 md:pl-72 md:pr-8 pt-24 pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">News</h2>
        <p className="text-gray-400 text-sm">Latest updates from the Decode team.</p>
      </div>

      {/* Responsive grid of cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {posts.map((p, i) => (
          <article key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
            {/* Image */}
            {p.image && (
              <div className="relative aspect-video overflow-hidden">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0" />
                <span className="absolute left-3 top-3 text-xs px-2 py-1 rounded-md bg-blue-500/80 text-white">{p.tag}</span>
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-1">
                <FontAwesomeIcon icon={faNewspaper} />
                <span className="uppercase tracking-wide">{p.source}</span>
                <span>•</span>
                <FontAwesomeIcon icon={faClock} />
                <span>{p.time}</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold leading-snug mb-1">{p.title}</h3>
              <p className="text-sm text-gray-300 line-clamp-3">{p.description}</p>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <div className="flex items-center gap-4 text-gray-300">
                  <button className="flex items-center gap-1.5 text-xs hover:text-white">
                    <FontAwesomeIcon icon={faThumbsUp} />
                    <span>{number(p.likes)}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-xs hover:text-white">
                    <FontAwesomeIcon icon={faComment} />
                    <span>{number(p.comments)}</span>
                  </button>
                </div>
                <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  <FontAwesomeIcon icon={faShare} /> Share
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}


