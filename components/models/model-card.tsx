'use client';

import { useState } from 'react';
import { ChannelCard } from './channel-card';
import { TagEditor } from './tag-editor';
import { OperatorSelector } from './operator-selector';
import { AddChannelModal } from './add-channel-modal';
import { 
  Edit3, 
  X, 
  Save,
  User,
  Sparkles,
  FolderOpen,
  Eye,
  EyeOff,
  Link,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Channel {
  id: number;
  name: string;
  platform: string;
  assignedOperator: string;
  isActive: boolean;
}

interface Model {
  id: number;
  name: string;
  assignedOperator: {
    name: string;
    avatar: string;
  };
  personalityTags: string[];
  story: string;
  todayActivity: string;
  contentLink: string;
  channels: Channel[];
}

interface ModelCardProps {
  model: Model;
  expandChannels: boolean;
  editMode: boolean;
  onUpdateStory: (modelId: number, story: string) => void;
  onUpdateTodayActivity: (modelId: number, activity: string) => void;
  onUpdatePersonalityTags: (modelId: number, tags: string[]) => void;
  onUpdateContentLink: (modelId: number, link: string) => void;
  onUpdateAssignedOperator: (modelId: number, operator: { name: string; avatar: string }) => void;
  onToggleChannelStatus: (modelId: number, channelId: number) => void;
  onAddChannel: (modelId: number, channel: any) => void;
  onRemoveChannel: (modelId: number, channelId: number) => void;
  onDeleteModel: (modelId: number) => void;
  onEditModel: (model: Model) => void;
}

// Story Modal Component
function StoryModal({ 
  model, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  model: Model | null; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (story: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [storyText, setStoryText] = useState(model?.story || '');

  // Update storyText when model changes
  useState(() => {
    if (model) {
      setStoryText(model.story);
    }
  });

  const handleSave = () => {
    if (model) {
      onSave(storyText);
      setIsEditing(false);
      onClose();
    }
  };

  if (!isOpen || !model) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl bg-[rgba(var(--charcoal),0.95)] border border-[rgba(var(--neon-orchid),0.3)] backdrop-blur-sm shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[rgb(var(--foreground))]">{model.name} - Persona Story</h3>
            <button
              onClick={onClose}
              className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-6">
            {isEditing ? (
              <textarea
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                className="w-full h-48 p-4 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] resize-none focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                placeholder="Enter persona story..."
              />
            ) : (
              <div className="p-4 rounded-lg bg-[rgba(var(--velvet-gray),0.3)] text-[rgb(var(--foreground))] min-h-[192px] leading-relaxed">
                {storyText}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-[rgb(var(--muted-foreground))]">
              Last updated by {model.assignedOperator.name} • 2 hours ago
            </div>
            <div className="flex items-center space-x-2">
              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setStoryText(model.story);
                  }}
                  className="px-4 py-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)] transition-all duration-200"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white font-medium hover:scale-105 transition-all duration-200"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Edit Story'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Activity Modal Component
function ActivityModal({ 
  model, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  model: Model | null; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (activity: string) => void;
}) {
  const [activityText, setActivityText] = useState(model?.todayActivity || '');

  // Update activityText when model changes
  useState(() => {
    if (model) {
      setActivityText(model.todayActivity);
    }
  });

  const handleSave = () => {
    if (model) {
      onSave(activityText);
      onClose();
    }
  };

  if (!isOpen || !model) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl bg-[rgba(var(--charcoal),0.95)] border border-[rgba(var(--neon-orchid),0.3)] backdrop-blur-sm shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[rgb(var(--foreground))]">{model.name} - Today's Activity</h3>
            <button
              onClick={onClose}
              className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-6">
            <textarea
              value={activityText}
              onChange={(e) => setActivityText(e.target.value)}
              className="w-full h-32 p-4 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] resize-none focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
              placeholder="What is she doing today?"
            />
          </div>
          
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white font-medium hover:scale-105 transition-all duration-200"
            >
              <Save className="w-4 h-4" />
              <span>Save Activity</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModelCard({ 
  model, 
  expandChannels,
  editMode,
  onUpdateStory, 
  onUpdateTodayActivity,
  onUpdatePersonalityTags,
  onUpdateContentLink,
  onUpdateAssignedOperator,
  onToggleChannelStatus,
  onAddChannel,
  onRemoveChannel,
  onDeleteModel,
  onEditModel
}: ModelCardProps) {
  const [storyModal, setStoryModal] = useState(false);
  const [activityModal, setActivityModal] = useState(false);
  const [showPersonaStory, setShowPersonaStory] = useState(false);
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);
  const [editingContentLink, setEditingContentLink] = useState(false);
  const [contentLinkValue, setContentLinkValue] = useState(model.contentLink);

  const getPersonalityTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'soft dom':
      case 'dominant':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'brat':
      case 'playful':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'mean bitch':
      case 'findom':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'sweet':
      case 'innocent':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'mysterious':
      case 'artistic':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'premium':
      case 'luxury':
        return 'bg-[rgb(var(--sunset-gold))]/20 text-[rgb(var(--sunset-gold))] border-[rgb(var(--sunset-gold))]/30';
      default:
        return 'bg-[rgba(var(--velvet-gray),0.3)] text-[rgb(var(--muted-foreground))] border-[rgba(var(--velvet-gray),0.5)]';
    }
  };

  // Truncate text for preview
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleContentLinkSave = () => {
    onUpdateContentLink(model.id, contentLinkValue);
    setEditingContentLink(false);
  };

  const handleDeleteModel = () => {
    if (window.confirm(`Are you sure you want to delete ${model.name}? This action cannot be undone.`)) {
      onDeleteModel(model.id);
    }
  };

  return (
    <div className={cn(
      'glow-card p-6 space-y-6 relative',
      editMode && 'border-2 border-[rgba(var(--neon-orchid),0.4)]'
    )}>
      {/* Edit and Delete Buttons - Only in Edit Mode */}
      {editMode && (
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <button
            onClick={() => onEditModel(model)}
            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
            title="Edit Model"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeleteModel}
            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
            title="Delete Model"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Model Header - Enhanced for Edit Mode */}
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          {/* Model Name with Content Button */}
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-bold text-gradient-primary">{model.name}</h2>
            
            {/* Content Link Button */}
            <div className="flex items-center space-x-2">
              {editingContentLink && editMode ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={contentLinkValue}
                    onChange={(e) => setContentLinkValue(e.target.value)}
                    className="px-3 py-1 rounded-md bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] text-sm focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                    placeholder="Content link URL..."
                  />
                  <button
                    onClick={handleContentLinkSave}
                    className="p-1 rounded-md bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  >
                    <Save className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingContentLink(false);
                      setContentLinkValue(model.contentLink);
                    }}
                    className="p-1 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <a
                    href={model.contentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 px-2 py-1 rounded-md bg-gradient-to-r from-[rgba(var(--neon-orchid),0.2)] to-[rgba(var(--sunset-gold),0.2)] border border-[rgba(var(--neon-orchid),0.3)] text-[rgb(var(--foreground))] hover:scale-105 transition-all duration-300 shadow-lg text-xs"
                  >
                    <FolderOpen className="w-3 h-3" />
                    <span className="font-medium">Content</span>
                    <ExternalLink className="w-2 h-2" />
                  </a>
                  {editMode && (
                    <button
                      onClick={() => setEditingContentLink(true)}
                      className="p-1 rounded-md bg-[rgba(var(--velvet-gray),0.3)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
                      title="Edit content link"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Assigned Operator - Enhanced for Edit Mode */}
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            {editMode ? (
              <OperatorSelector
                currentOperator={model.assignedOperator}
                onOperatorChange={(operator) => onUpdateAssignedOperator(model.id, operator)}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {model.assignedOperator.avatar}
                </div>
                <span className="text-sm text-[rgb(var(--foreground))] font-medium">
                  {model.assignedOperator.name}
                </span>
              </div>
            )}
          </div>
          
          {/* Personality Tags - Enhanced for Edit Mode */}
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            {editMode ? (
              <TagEditor
                tags={model.personalityTags}
                onTagsChange={(tags) => onUpdatePersonalityTags(model.id, tags)}
                getTagColor={getPersonalityTagColor}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {model.personalityTags.map((tag, index) => (
                  <span
                    key={index}
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                      getPersonalityTagColor(tag)
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Persona Story Section - Collapsed by Default */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowPersonaStory(!showPersonaStory)}
            className="flex items-center space-x-2 text-lg font-semibold text-[rgb(var(--foreground))] hover:text-[rgb(var(--neon-orchid))] transition-colors"
          >
            <span>View Persona</span>
            {showPersonaStory ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        
        {showPersonaStory && (
          <div className="p-3 rounded-lg bg-[rgba(var(--velvet-gray),0.2)] border border-[rgba(var(--neon-orchid),0.1)]">
            <div className="text-[rgb(var(--muted-foreground))] leading-relaxed mb-2">
              {model.story}
            </div>
            <button
              onClick={() => setStoryModal(true)}
              className="text-[rgb(var(--neon-orchid))] hover:text-[rgb(var(--foreground))] text-sm font-medium transition-colors"
            >
              Edit Story
            </button>
          </div>
        )}
      </div>

      {/* Today Activity Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">What she's doing today</h3>
        </div>
        
        <div className="p-3 rounded-lg bg-[rgba(var(--velvet-gray),0.2)] border border-[rgba(var(--neon-orchid),0.1)]">
          <div className="text-[rgb(var(--foreground))] font-medium mb-2">
            {truncateText(model.todayActivity, 80)}
          </div>
          <button
            onClick={() => setActivityModal(true)}
            className="text-[rgb(var(--neon-orchid))] hover:text-[rgb(var(--foreground))] text-sm font-medium transition-colors"
          >
            View More & Edit
          </button>
        </div>
      </div>

      {/* Channels Section - Enhanced for Edit Mode */}
      {expandChannels && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">Distribution Channels</h3>
            {editMode && (
              <button
                onClick={() => setShowAddChannelModal(true)}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white text-sm font-medium hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-3 h-3" />
                <span>Add Channel</span>
              </button>
            )}
          </div>
          
          {/* Channel List */}
          <div className="space-y-3">
            {model.channels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                editMode={editMode}
                onToggleStatus={() => onToggleChannelStatus(model.id, channel.id)}
                onRemove={() => onRemoveChannel(model.id, channel.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <StoryModal 
        model={model}
        isOpen={storyModal}
        onClose={() => setStoryModal(false)}
        onSave={(story) => onUpdateStory(model.id, story)}
      />

      <ActivityModal 
        model={model}
        isOpen={activityModal}
        onClose={() => setActivityModal(false)}
        onSave={(activity) => onUpdateTodayActivity(model.id, activity)}
      />

      <AddChannelModal
        isOpen={showAddChannelModal}
        onClose={() => setShowAddChannelModal(false)}
        onAddChannel={(channel) => onAddChannel(model.id, channel)}
      />
    </div>
  );
}