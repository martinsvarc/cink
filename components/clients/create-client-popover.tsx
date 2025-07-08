'use client';

import { useState } from 'react';
import { X, User, Calendar, Link, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagSelector } from './tag-selector';

interface CreateClientPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  defaultName?: string;
  onClientCreated: (client: any) => void;
}

export function CreateClientPopover({ 
  isOpen, 
  onClose, 
  defaultName = '', 
  onClientCreated 
}: CreateClientPopoverProps) {
  const [formData, setFormData] = useState({
    name: defaultName,
    socialLink: '',
    payday: 1,
    tags: [] as string[],
    summary: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Jméno klienta je povinné');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('🔄 Creating client with data:', {
        name: formData.name.trim(),
        socialLink: formData.socialLink || null,
        payday: formData.payday,
        summary: formData.summary || null,
        tags: formData.tags
      });

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          socialLink: formData.socialLink || null,
          payday: formData.payday,
          summary: formData.summary || null,
          tags: formData.tags
        })
      });

      console.log('📡 API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error Response:', errorData);
        throw new Error(errorData.error || 'Nepodařilo se vytvořit klienta');
      }

      const newClient = await response.json();
      console.log('✅ Client created successfully:', newClient);
      
      // Verify the client has a proper ID
      if (!newClient.id) {
        console.error('❌ Client created but no ID returned:', newClient);
        throw new Error('Klient byl vytvořen, ale bez ID');
      }

      // Callback to parent component with the REAL client from database
      console.log('🔄 Calling onClientCreated with:', newClient);
      onClientCreated(newClient);
      
      // Reset form and close
      setFormData({
        name: '',
        socialLink: '',
        payday: 1,
        tags: [],
        summary: ''
      });
      onClose();
    } catch (error) {
      console.error('❌ Client creation failed:', error);
      setError(error instanceof Error ? error.message : 'Nepodařilo se vytvořit klienta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      socialLink: '',
      payday: 1,
      tags: [],
      summary: ''
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[rgb(var(--charcoal))] rounded-lg p-6 w-full max-w-md border border-[rgba(var(--neon-orchid),0.3)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[rgb(var(--foreground))] flex items-center gap-2">
            <User className="w-5 h-5 text-[rgb(var(--neon-orchid))]" />
            Přidat nového klienta
          </h3>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-[rgba(var(--muted-foreground),0.1)] transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-[rgba(var(--crimson),0.1)] border border-[rgba(var(--crimson),0.3)] rounded text-[rgb(var(--crimson))] text-sm">
            {error}
          </div>
        )}

        {/* Form fields */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
              Jméno klienta *
            </label>
            <input 
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 rounded-md text-sm bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)] transition-all duration-200"
              placeholder="Zadejte jméno klienta"
              autoFocus
            />
          </div>

          {/* Social Link */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1 flex items-center gap-1">
              <Link className="w-3 h-3" />
              Sociální odkaz
            </label>
            <input 
              type="url"
              value={formData.socialLink}
              placeholder="https://instagram.com/username"
              onChange={(e) => setFormData({...formData, socialLink: e.target.value})}
              className="w-full px-3 py-2 rounded-md text-sm bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)] transition-all duration-200"
            />
          </div>

          {/* Payday */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Den výplaty
            </label>
            <select 
              value={formData.payday}
              onChange={(e) => setFormData({...formData, payday: parseInt(e.target.value)})}
              className="w-full px-3 py-2 rounded-md text-sm bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)] transition-all duration-200 cursor-pointer"
            >
              {[...Array(31)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}. den v měsíci</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
              Tagy
            </label>
            <TagSelector 
              selectedTags={formData.tags}
              onChange={(tags) => setFormData({...formData, tags})}
              placeholder="Přidat tag (VIP, Premium, atd.)"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Poznámka
            </label>
            <textarea 
              value={formData.summary}
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
              className="w-full px-3 py-2 rounded-md text-sm bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)] transition-all duration-200 resize-none"
              placeholder="Dodatečné informace o klientovi..."
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md text-sm font-medium bg-[rgba(var(--muted-foreground),0.1)] border border-[rgba(var(--muted-foreground),0.2)] text-[rgb(var(--muted-foreground))] hover:bg-[rgba(var(--muted-foreground),0.2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Zrušit
          </button>
          <button 
            onClick={handleSave}
            disabled={isSubmitting || !formData.name.trim()}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2',
              'bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--sunset-gold))] text-white shadow-md',
              'hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
            )}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Ukládání...' : 'Uložit klienta'}
          </button>
        </div>
      </div>
    </div>
  );
} 