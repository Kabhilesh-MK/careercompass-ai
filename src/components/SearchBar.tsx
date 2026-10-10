import { Search } from 'lucide-react';

export function SearchBar({
  placeholder = 'Search...',
  value,
  onChange,
  className = '',
}: {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="input pl-9"
      />
    </div>
  );
}
