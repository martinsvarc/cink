'use client';

import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddModel: (model: any) => void;
  editingModel?: any; // Model data for editing
  isEditing?: boolean; // Whether we're in edit mode
}

const availableOperators = [
  { name: 'Sarah Chen', avatar: 'SC' },
  { name: 'Emma Rodriguez', avatar: 'ER' },
  { name: 'Luna Park', avatar: 'LP' },
  { name: 'Alex Kim', avatar: 'AK' },
  { name: 'Maya Singh', avatar: 'MS' },
  { name: 'Zoe Williams', avatar: 'ZW' },
];

const availablePlatforms = [
  'Fanvue',
  'Facebook',
  'WhatsApp',
  'Telegram',
  'Instagram',
  'TikTok',
  'OnlyFans',
  'Twitter'
];

const commonTags = [
  'Soft Dom', 'Dominant', 'Brat', 'Playful', 'Sweet', 'Innocent',
  'Mean Bitch', 'Findom', 'Mysterious', 'Artistic', 'Premium',
  'Luxury', 'Girl Next Door', 'Teasing', 'Nurturing', 'Intellectual'
];

export function AddModelModal({ isOpen, onClose, onAddModel, editingModel, isEditing = false }: AddModelModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    assignedOperator: availableOperators[0],
    personalityTags: [] as string[],
    story: '',
    todayActivity: '',
    contentLink: '',
    channels: [] as any[]
  });

  const [newTag, setNewTag] = useState('');
  const [newChannel, setNewChannel] = useState({
    name: '',
    platform: availablePlatforms[0],
    assignedOperator: availableOperators[0].name,
    isActive: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form data when editing
  useEffect(() => {
    if (isEditing && editingModel) {
      setFormData({
        name: editingModel.name || '',
        assignedOperator: editingModel.assignedOperator || availableOperators[0],
        personalityTags: editingModel.personalityTags || [],
        story: editingModel.story || '',
        todayActivity: editingModel.todayActivity || '',
        contentLink: editingModel.contentLink || '',
        channels: editingModel.channels || []
      });
    } else {
      // Reset form for adding new model
      setFormData({
        name: '',
        assignedOperator: availableOperators[0],
        personalityTags: [],
        story: '',
        todayActivity: '',
        contentLink: '',
        channels: []
      });
    }
  }, [isEditing, editingModel, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a model name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = isEditing ? `/api/models/${editingModel.id}` : '/api/models';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} model`);
      }

      // Call the parent's callback with the created/updated model
      onAddModel(data.model);
      
      // Reset form
      setFormData({
        name: '',
        assignedOperator: availableOperators[0],
        personalityTags: [],
        story: '',
        todayActivity: '',
        contentLink: '',
        channels: []
      });
      setNewTag('');
      setNewChannel({
        name: '',
        platform: availablePlatforms[0],
        assignedOperator: availableOperators[0].name,
        isActive: true
      });
      
      onClose();
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} model:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} model`);
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.personalityTags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        personalityTags: [...prev.personalityTags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      personalityTags: prev.personalityTags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addNewTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  const addChannel = () => {
    if (newChannel.name.trim()) {
      setFormData(prev => ({
        ...prev,
        channels: [...prev.channels, { ...newChannel }]
      }));
      setNewChannel({
        name: '',
        platform: availablePlatforms[0],
        assignedOperator: availableOperators[0].name,
        isActive: true
      });
    }
  };

  const removeChannel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-[rgba(var(--charcoal),0.95)] border border-[rgba(var(--neon-orchid),0.3)] backdrop-blur-sm shadow-2xl">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-[rgb(var(--foreground))]">
              {isEditing ? 'Edit Model' : 'Add New Model'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[rgb(var(--foreground))]">Basic Information</h4>
                
                {/* Model Name */}
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                    placeholder="Enter model name"
                    required
                  />
                </div>

                {/* Assigned Operator */}
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Assigned Operator
                  </label>
                  <select
                    value={formData.assignedOperator.name}
                    onChange={(e) => {
                      const operator = availableOperators.find(op => op.name === e.target.value);
                      if (operator) {
                        setFormData(prev => ({ ...prev, assignedOperator: operator }));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                  >
                    {availableOperators.map((operator) => (
                      <option key={operator.name} value={operator.name}>
                        {operator.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content Link */}
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                    Content Link
                  </label>
                  <input
                    type="url"
                    value={formData.contentLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, contentLink: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                    placeholder="https://drive.google.com/folder/..."
                  />
                </div>
              </div>

              {/* Personality Tags */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[rgb(var(--foreground))]">Personality Tags</h4>
                
                {/* Selected Tags */}
                <div className="flex flex-wrap gap-2">
                  {formData.personalityTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-[rgb(var(--neon-orchid))]/20 text-[rgb(var(--neon-orchid))] border border-[rgb(var(--neon-orchid))]/30"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Common Tags */}
                <div>
                  <div className="text-sm text-[rgb(var(--muted-foreground))] mb-2">Quick Add:</div>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.filter(tag => !formData.personalityTags.includes(tag)).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="px-2 py-1 rounded-full text-xs font-medium bg-[rgba(var(--velvet-gray),0.3)] text-[rgb(var(--muted-foreground))] border border-[rgba(var(--velvet-gray),0.5)] hover:bg-[rgba(var(--neon-orchid),0.2)] hover:text-[rgb(var(--neon-orchid))] hover:border-[rgba(var(--neon-orchid),0.3)] transition-all duration-200"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Tag Input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Create custom tag..."
                    className="flex-1 px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] text-sm focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNewTag())}
                  />
                  <button
                    type="button"
                    onClick={addNewTag}
                    className="px-3 py-2 rounded-lg bg-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--neon-orchid))] border border-[rgba(var(--neon-orchid),0.3)] hover:bg-[rgba(var(--neon-orchid),0.3)] transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Story */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Persona Story
                </label>
                <textarea
                  value={formData.story}
                  onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
                  className="w-full h-32 p-3 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] resize-none focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                  placeholder="Describe the model's personality and character..."
                />
              </div>

              {/* Today's Activity */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Today's Activity
                </label>
                <textarea
                  value={formData.todayActivity}
                  onChange={(e) => setFormData(prev => ({ ...prev, todayActivity: e.target.value }))}
                  className="w-full h-24 p-3 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] resize-none focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                  placeholder="What is she doing today?"
                />
              </div>

              {/* Channels */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[rgb(var(--foreground))]">Distribution Channels</h4>
                
                {/* Existing Channels */}
                <div className="space-y-2">
                  {formData.channels.map((channel, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[rgba(var(--velvet-gray),0.3)] border border-[rgba(var(--neon-orchid),0.1)]">
                      <div>
                        <div className="font-medium text-[rgb(var(--foreground))]">{channel.name}</div>
                        <div className="text-sm text-[rgb(var(--muted-foreground))]">{channel.platform} • {channel.assignedOperator}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeChannel(index)}
                        className="p-1 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Channel */}
                <div className="p-3 rounded-lg bg-[rgba(var(--velvet-gray),0.2)] border border-[rgba(var(--neon-orchid),0.1)]">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newChannel.name}
                      onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Channel name (e.g., Isabella Fanvue)"
                      className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] text-sm focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newChannel.platform}
                        onChange={(e) => setNewChannel(prev => ({ ...prev, platform: e.target.value }))}
                        className="px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] text-sm focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                      >
                        {availablePlatforms.map((platform) => (
                          <option key={platform} value={platform}>{platform}</option>
                        ))}
                      </select>
                      
                      <select
                        value={newChannel.assignedOperator}
                        onChange={(e) => setNewChannel(prev => ({ ...prev, assignedOperator: e.target.value }))}
                        className="px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] text-sm focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                      >
                        {availableOperators.map((operator) => (
                          <option key={operator.name} value={operator.name}>{operator.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      type="button"
                      onClick={addChannel}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--neon-orchid))] border border-[rgba(var(--neon-orchid),0.3)] hover:bg-[rgba(var(--neon-orchid),0.3)] transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Channel</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-[rgba(var(--neon-orchid),0.2)]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save className="w-4 h-4" />
              <span>
                {isLoading 
                  ? (isEditing ? 'Updating...' : 'Creating...')
                  : (isEditing ? 'Update Model' : 'Create Model')
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}