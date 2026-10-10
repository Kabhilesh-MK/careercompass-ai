import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, BookOpen, Hammer, Award, Map, Briefcase, Trash2, ExternalLink, Search,
} from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card, CardHeader } from '@/components/Card';
import { Chip } from '@/components/Badge';
import { getFavorites, removeFavorite } from '@/services/engagementService';
import { useToast } from '@/context/ToastContext';
import { useNavigate } from 'react-router-dom';

interface FavoriteItem {
  _id?: string;
  item_type: string;
  item_id: string;
  item_title: string;
  item_meta?: Record<string, unknown>;
  created_at?: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; route: string }> = {
  course:        { label: 'Courses',        icon: BookOpen,  color: 'primary',   route: '/roadmap' },
  project:       { label: 'Projects',       icon: Hammer,    color: 'secondary', route: '/projects' },
  certification: { label: 'Certifications', icon: Award,     color: 'success',   route: '/certifications' },
  roadmap:       { label: 'Roadmaps',       icon: Map,       color: 'warning',   route: '/roadmap' },
  career:        { label: 'Careers',        icon: Briefcase, color: 'primary',   route: '/career' },
};

const MOCK_FAVORITES: FavoriteItem[] = [
  { _id: 'f1', item_type: 'course',        item_id: 'c1', item_title: 'Machine Learning Specialization', item_meta: { provider: 'Coursera' }, created_at: '2024-11-01T10:00:00Z' },
  { _id: 'f2', item_type: 'project',       item_id: 'p2', item_title: 'Resume Parser with NLP',          item_meta: { difficulty: 'Intermediate' }, created_at: '2024-10-28T14:00:00Z' },
  { _id: 'f3', item_type: 'certification', item_id: 'ce2', item_title: 'AWS Solutions Architect',        item_meta: { provider: 'Amazon' }, created_at: '2024-10-25T09:00:00Z' },
  { _id: 'f4', item_type: 'career',        item_id: 'ca1', item_title: 'ML Engineer',                   item_meta: { match: 86 }, created_at: '2024-10-20T11:00:00Z' },
  { _id: 'f5', item_type: 'course',        item_id: 'c3', item_title: 'Deep Learning with TensorFlow',  item_meta: { provider: 'Udemy' }, created_at: '2024-10-15T16:00:00Z' },
  { _id: 'f6', item_type: 'certification', item_id: 'ce3', item_title: 'Google Data Analytics',         item_meta: { provider: 'Google' }, created_at: '2024-10-10T08:00:00Z' },
];

function FavCard({ item, onRemove }: { item: FavoriteItem; onRemove: () => void }) {
  const cfg = TYPE_CONFIG[item.item_type] || TYPE_CONFIG.course;
  const Ic = cfg.icon;
  const navigate = useNavigate();
  const targetRoute = item.item_type === 'career' ? `/career/${item.item_id}` : cfg.route;

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="card p-4 hover:shadow-elevated transition-shadow group"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl bg-${cfg.color}/10 text-${cfg.color} flex items-center justify-center shrink-0`}>
          <Ic size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-slate-100 leading-snug">{item.item_title}</p>
          {Boolean(item.item_meta?.provider) && (
            <p className="text-xs text-gray-400 mt-0.5">{String(item.item_meta?.provider)}</p>
          )}
          {Boolean(item.item_meta?.difficulty) && (
            <p className="text-xs text-gray-400 mt-0.5">{String(item.item_meta?.difficulty)}</p>
          )}
          {Boolean(item.item_meta?.match) && (
            <p className="text-xs text-success font-medium mt-0.5">{String(item.item_meta?.match)}% match</p>
          )}
          <span className={`chip bg-${cfg.color}/10 text-${cfg.color} text-[10px] mt-2`}>{cfg.label.slice(0, -1)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
        <button
          onClick={() => navigate(targetRoute)}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink size={11} /> View
        </button>
        <button
          onClick={onRemove}
          className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-danger transition opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={11} /> Remove
        </button>
      </div>
    </motion.div>
  );
}

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    getFavorites()
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (item: FavoriteItem) => {
    try {
      await removeFavorite(item.item_type, item.item_id);
      setItems(prev => prev.filter(x => x._id !== item._id));
      addToast('Removed from favorites', 'info');
    } catch {
      addToast('Could not remove favorite', 'error');
    }
  };

  const types = ['all', ...Object.keys(TYPE_CONFIG)];

  const filtered = items.filter(item => {
    const matchType = filter === 'all' || item.item_type === filter;
    const matchSearch = !search || item.item_title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const countByType = (t: string) => items.filter(i => i.item_type === t).length;

  return (
    <PageContainer>
      <PageHeader title="Favorites" subtitle="All your bookmarked courses, projects, certifications and careers.">
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(TYPE_CONFIG).map(([key, cfg], i) => {
          const Ic = cfg.icon;
          const n = countByType(key);
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => setFilter(key === filter ? 'all' : key)}
              className={`card p-4 text-left transition ${filter === key ? `border-${cfg.color} bg-${cfg.color}/5` : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl bg-${cfg.color}/10 text-${cfg.color} flex items-center justify-center mb-2`}><Ic size={16} /></div>
              <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{n}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{cfg.label}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search favorites…"
            className="input pl-9 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map(t => (
            <Chip key={t} active={filter === t} onClick={() => setFilter(t)}>
              {t === 'all' ? 'All' : (TYPE_CONFIG[t]?.label || t)}
            </Chip>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <Heart size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No favorites yet</p>
            <p className="text-sm text-gray-400 mt-1">
              {search ? 'No matches for your search.' : 'Bookmark courses, projects, and certifications to see them here.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <FavCard key={item._id} item={item} onRemove={() => handleRemove(item)} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
