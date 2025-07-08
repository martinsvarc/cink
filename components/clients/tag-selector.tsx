'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const commonTags = [
  'VIP', 'Premium', 'Regular', 'New Client', 'High Spender', 
  'Telegram', 'WhatsApp', 'Facebook', 'Instagram', 'OnlyFans',
  'Custom Content', 'Live Sessions', 'Video Calls', 'Chat Only'
];

export function TagSelector({ selectedTags, onChange, placeholder = "Přidat tag..." }: TagSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    // Filter out already selected tags
    const filtered = commonTags.filter(tag => !selectedTags.includes(tag));
    setAvailableTags(filtered);
  }, [selectedTags]);

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onChange([...selectedTags, tag]);
    }
    setShowDropdown(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleAddCustomTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      onChange([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };

  return (
    <div className="space-y-2">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--neon-orchid))] rounded text-xs border border-[rgba(var(--neon-orchid),0.3)]"
            >
              <Tag className="w-3 h-3" />
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-[rgb(var(--crimson))] transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add Tag Input */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 rounded-md text-sm bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)] transition-all duration-200"
          />
          <button
            type="button"
            onClick={handleAddCustomTag}
            disabled={!newTag.trim()}
            className={cn(
              'px-3 py-2 rounded-md border transition-all duration-200',
              newTag.trim()
                ? 'bg-[rgba(var(--neon-orchid),0.2)] border-[rgba(var(--neon-orchid),0.3)] text-[rgb(var(--neon-orchid))] hover:bg-[rgba(var(--neon-orchid),0.3)]'
                : 'bg-[rgba(var(--muted-foreground),0.1)] border-[rgba(var(--muted-foreground),0.2)] text-[rgb(var(--muted-foreground))] cursor-not-allowed'
            )}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Dropdown with suggestions */}
        {showDropdown && availableTags.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-[rgb(var(--charcoal))] border border-[rgba(var(--neon-orchid),0.3)] rounded-md shadow-lg max-h-32 overflow-y-auto">
            {availableTags
              .filter(tag => tag.toLowerCase().includes(newTag.toLowerCase()))
              .map((tag) => (
              <button
                key={tag}
                type="button"
                onMouseDown={() => handleAddTag(tag)}
                className="w-full px-3 py-2 text-left hover:bg-[rgba(var(--neon-orchid),0.1)] text-sm text-[rgb(var(--foreground))] flex items-center gap-2"
              >
                <Tag className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 