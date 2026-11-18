import React from 'react';
import {
  Box,
  Calculator,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  Layers,
  MessageSquare,
  Ruler,
  Store,
  X,
} from 'lucide-react';
import { FACEBOOK_PAGE_URL, WORKSHOP_TOOLS } from '../data/tools.ts';
import type { ToolId } from '../types.ts';

export type ActiveTab = 'overview' | 'workspace' | 'facebook' | 'orders';

interface SidebarProps {
  activeTab: ActiveTab;
  activeToolId: ToolId;
  unreadInquiriesCount: number;
  activeOrdersCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenTool: (toolId: ToolId) => void;
}

export function getToolIcon(toolId: ToolId): React.ReactNode {
  switch (toolId) {
    case 'kitchen-3d-studio':
      return <Box className="w-4 h-4 shrink-0" />;
    case 'takhseem-pro':
      return <Ruler className="w-4 h-4 shrink-0" />;
    case 'kitchen-workshop':
      return <Layers className="w-4 h-4 shrink-0" />;
    case 'workshop-manager':
      return <Calculator className="w-4 h-4 shrink-0" />;
    case 'shop-manager':
      return <Store className="w-4 h-4 shrink-0" />;
  }
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  activeToolId,
  unreadInquiriesCount,
  activeOrdersCount,
  mobileOpen,
  onCloseMobile,
  onSelectTab,
  onOpenTool,
}) => {
  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      id: 'overview',
      label: 'نظرة عامة',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'workspace',
      label: 'برامج الورشة المدمجة',
      icon: <Layers className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'facebook',
      label: 'رسائل عملاء فيسبوك',
      icon: <MessageSquare className="w-4 h-4 shrink-0" />,
      count: unreadInquiriesCount,
    },
    {
      id: 'orders',
      label: 'أوامر الشغل والمتابعة',
      icon: <ClipboardList className="w-4 h-4 shrink-0" />,
      count: activeOrdersCount,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 text-slate-900">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 shrink-0">
        <button
          type="button"
          onClick={() => {
            onSelectTab('overview');
            onCloseMobile();
          }}
          className="flex items-center gap-3 text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
        >
          <span className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path d="M4 4h16v16H4z" />
              <path d="M4 12h16M12 4v16" />
            </svg>
          </span>
          <span className="font-bold text-sm tracking-tight text-slate-900 whitespace-nowrap">
            ورشة الألومنيوم المركزية
          </span>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="إغلاق القائمة"
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        <div>
          <p className="px-3 mb-2 text-xs font-medium text-slate-500">
            الأقسام الرئيسية
          </p>
          <nav className="space-y-1" aria-label="التنقل الرئيسي">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </span>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span
                      className={`font-mono tabular-nums text-xs ${
                        isActive ? 'text-slate-300' : 'text-blue-700 font-semibold'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 5 Deployed Programs Quick Launch */}
        <div className="pt-4 border-t border-slate-200">
          <p className="px-3 mb-2 text-xs font-medium text-slate-500">
            البرامج المتصلة (5)
          </p>
          <div className="space-y-1">
            {WORKSHOP_TOOLS.map((tool) => {
              const isToolSelected =
                activeTab === 'workspace' && activeToolId === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    onOpenTool(tool.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isToolSelected
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {getToolIcon(tool.id)}
                    <span className="truncate">{tool.shortName}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    فتح
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Facebook Page Direct Link Footer */}
      <div className="p-4 border-t border-slate-200 shrink-0">
        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-3 py-2.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
        >
          <span className="truncate">صفحة فيسبوك التسويقية</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-[264px] shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-[280px] max-w-[85vw] h-full z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
