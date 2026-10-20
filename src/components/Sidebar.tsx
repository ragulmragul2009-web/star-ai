import React, { useState } from 'react';
import { WorkspaceId, Conversation } from '../types';
import { StarLogo } from './StarLogo';
import {
  MessageSquare,
  Sparkles,
  Globe,
  GraduationCap,
  Code2,
  Layers,
  Image as ImageIcon,
  Video,
  FileText,
  CheckSquare,
  HelpCircle,
  Shield,
  Settings,
  Plus,
  Search,
  Pin,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  currentWorkspace: WorkspaceId;
  onSelectWorkspace: (id: WorkspaceId) => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onTogglePinConversation: (id: string) => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userName?: string;
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentWorkspace,
  onSelectWorkspace,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onTogglePinConversation,
  onOpenSettings,
  onOpenAuth,
  isCollapsed,
  onToggleCollapse,
  userName = 'Commander',
  userRole = 'Pro Explorer',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const workspaceItems = [
    { id: 'chat' as WorkspaceId, label: 'STAR Chat', icon: MessageSquare, badge: 'AI' },
    { id: 'avatar-live' as WorkspaceId, label: 'STAR Live Avatar', icon: Sparkles, badge: 'Live' },
    { id: 'research' as WorkspaceId, label: 'STAR Research', icon: Globe, badge: 'Search' },
    { id: 'teacher' as WorkspaceId, label: 'STAR Teacher', icon: GraduationCap, badge: 'Learn' },
    { id: 'developer' as WorkspaceId, label: 'STAR Developer', icon: Code2, badge: 'Sandbox' },
    { id: 'app-builder' as WorkspaceId, label: 'STAR App Builder', icon: Layers, badge: 'Build' },
    { id: 'image-studio' as WorkspaceId, label: 'Image Studio', icon: ImageIcon, badge: 'Visual' },
    { id: 'video-studio' as WorkspaceId, label: 'Video Studio', icon: Video, badge: 'Veo' },
    { id: 'notes' as WorkspaceId, label: 'STAR Notes', icon: FileText },
    { id: 'tasks' as WorkspaceId, label: 'Autonomous Agent', icon: CheckSquare, badge: 'Agent' },
    { id: 'support' as WorkspaceId, label: 'Customer Care', icon: HelpCircle },
    { id: 'admin' as WorkspaceId, label: 'Admin Console', icon: Shield, badge: 'Ops' },
  ];

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={`relative z-20 flex flex-col h-screen bg-white border-r border-slate-200 transition-all duration-300 shrink-0 shadow-xs ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 h-16 bg-white">
        <StarLogo
          size={isCollapsed ? 'sm' : 'md'}
          showText={!isCollapsed}
          showTagline={false}
          animated={true}
          onClick={() => onSelectWorkspace('chat')}
        />
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* New Chat Primary Action */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-sm hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all`}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          {!isCollapsed && <span>New Conversation</span>}
        </button>
      </div>

      {/* Navigation Workspaces Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {!isCollapsed ? 'Intelligence Workspaces' : 'Apps'}
        </div>

        {workspaceItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentWorkspace === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectWorkspace(item.id)}
              title={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                }`}
              />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between truncate text-left">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      isActive ? 'bg-blue-200/60 text-blue-800' : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {/* Conversations History Section */}
        {!isCollapsed && (
          <div className="pt-4 pb-2">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recent Chats
              </span>
              <span className="text-[10px] text-slate-400">{conversations.length}</span>
            </div>

            {/* Chat search filter */}
            <div className="relative mb-2 px-1">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {filteredConversations.length === 0 ? (
                <div className="px-2 py-3 text-xs text-slate-400 text-center italic">
                  No conversations found
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = activeConversationId === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        onSelectWorkspace('chat');
                        onSelectConversation(conv.id);
                      }}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200/80'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {conv.pinned && <Pin className="w-3 h-3 text-blue-600 shrink-0" />}
                        <span className="truncate">{conv.title}</span>
                      </div>
                      <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePinConversation(conv.id);
                          }}
                          title={conv.pinned ? 'Unpin' : 'Pin'}
                          className="p-1 hover:text-blue-600"
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          title="Delete chat"
                          className="p-1 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Profile & Settings */}
      <div className="p-3 border-t border-slate-200 space-y-1.5 bg-slate-50/80">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Settings & Personalization"
        >
          <Settings className="w-4 h-4 text-slate-500 shrink-0" />
          {!isCollapsed && <span>Settings & Preferences</span>}
        </button>

        {/* User Profile Tile */}
        <div
          onClick={onOpenAuth}
          className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs cursor-pointer transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="flex-1 truncate text-left">
              <div className="text-xs font-semibold text-slate-900 truncate">{userName}</div>
              <div className="text-[10px] text-blue-600 flex items-center gap-1 font-medium">
                <UserCheck className="w-2.5 h-2.5" />
                <span>{userRole}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
