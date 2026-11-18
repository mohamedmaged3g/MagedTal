import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ExternalLink,
  Maximize2,
  Minimize2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { WORKSHOP_TOOLS } from '../data/tools.ts';
import type { ToolEmbedCheck, ToolId } from '../types.ts';
import { getToolIcon } from './Sidebar.tsx';

interface WorkspaceViewProps {
  activeToolId: ToolId;
  onSelectTool: (toolId: ToolId) => void;
  onNewOrder: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  activeToolId,
  onSelectTool,
  onNewOrder,
}) => {
  const [reloadNonce, setReloadNonce] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [probeMap, setProbeMap] = useState<Record<string, ToolEmbedCheck>>({});
  const [probing, setProbing] = useState(false);

  const activeTool =
    WORKSHOP_TOOLS.find((t) => t.id === activeToolId) || WORKSHOP_TOOLS[0];
  const probe = probeMap[activeTool.url];

  useEffect(() => {
    if (probeMap[activeTool.url]) return;
    let cancelled = false;
    setProbing(true);

    fetch('/api/tools/probe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: activeTool.url }),
    })
      .then((res) => res.json())
      .then((data: ToolEmbedCheck) => {
        if (!cancelled && data && data.url) {
          setProbeMap((prev) => ({ ...prev, [data.url]: data }));
        }
      })
      .catch(() => {
        // Ignore probe network failures and allow normal iframe attempt
      })
      .finally(() => {
        if (!cancelled) setProbing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTool.url, probeMap]);

  return (
    <div
      className={
        expanded
          ? 'fixed inset-0 z-50 bg-slate-50 p-3 sm:p-4 flex flex-col gap-3'
          : 'flex flex-col gap-3 h-[calc(100vh-7.5rem)] min-h-[600px]'
      }
    >
      {/* Segmented Tool Switcher & Frame Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div
          className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0"
          role="tablist"
          aria-label="التبديل بين برامج الورشة"
        >
          {WORKSHOP_TOOLS.map((tool) => {
            const isSelected = tool.id === activeTool.id;
            return (
              <button
                key={tool.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectTool(tool.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {getToolIcon(tool.id)}
                <span>{tool.shortName}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onNewOrder}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل نتيجة في أمر شغل</span>
          </button>

          <button
            type="button"
            onClick={() => setReloadNonce((n) => n + 1)}
            title="إعادة تحميل البرنامج"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تحديث</span>
          </button>

          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            title={expanded ? 'تصغير الإطار' : 'ملء الشاشة'}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {expanded ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">إغلاق ملء الشاشة</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ملء الشاشة</span>
              </>
            )}
          </button>

          <a
            href={activeTool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <span>فتح بنافذة مستقلة</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Embedding Diagnostic Notice if server HEAD probe detects X-Frame-Options/CSP restriction */}
      {probe && !probe.embeddable && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              إعدادات الأمان في <strong>{activeTool.englishName}</strong> تمنع العرض داخل إطار مدمج ({probe.reason}).
              يمكنك تشغيله فوراً في تبويب مستقل.
            </span>
          </div>
          <a
            href={activeTool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <span>تشغيل {activeTool.shortName} الآن</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Active Tool Metadata Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-slate-800">{activeTool.name}</span>
          <span aria-hidden="true">·</span>
          <span>{activeTool.category}</span>
          {probing && (
            <>
              <span aria-hidden="true">·</span>
              <span>جاري التحقق من الاتصال...</span>
            </>
          )}
        </div>
        <span className="font-mono text-[11px] text-slate-400 truncate" dir="ltr">
          {activeTool.url}
        </span>
      </div>

      {/* Embedded Program Iframe */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden relative">
        <iframe
          key={`${activeTool.id}-${reloadNonce}`}
          src={activeTool.url}
          title={activeTool.name}
          className="w-full h-full border-0"
          allow="fullscreen; clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
};
