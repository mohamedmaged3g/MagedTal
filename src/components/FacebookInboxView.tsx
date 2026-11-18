import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardPlus,
  Copy,
  ExternalLink,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import {
  ALUMINUM_PROFILE_SYSTEMS,
  FACEBOOK_PAGE_ID,
  FACEBOOK_PAGE_URL,
  PROFILE_TYPES,
  UPVC_PROFILE_SYSTEMS,
  getProfileTypeLabel,
} from '../data/tools.ts';
import type {
  FacebookInquiry,
  FacebookStatusResponse,
  InquiryStatus,
  ProfileCategory,
} from '../types.ts';

interface FacebookInboxViewProps {
  inquiries: FacebookInquiry[];
  fbStatus: FacebookStatusResponse | null;
  syncing: boolean;
  syncError: string | null;
  onSync: () => Promise<void>;
  onCreateInquiry: (payload: {
    customerName: string;
    customerPhone: string;
    profileType?: ProfileCategory;
    profileSystem?: string;
    projectInterest: string;
    initialMessage: string;
  }) => Promise<unknown>;
  onSendReply: (inquiryId: string, text: string) => Promise<{
    sentViaGraphApi?: boolean;
    graphWarning?: string;
  }>;
  onDeleteInquiry: (id: string) => Promise<void>;
  onConvertToOrder: (inquiry: FacebookInquiry) => void;
}

export const FacebookInboxView: React.FC<FacebookInboxViewProps> = ({
  inquiries,
  fbStatus,
  syncing,
  syncError,
  onSync,
  onCreateInquiry,
  onSendReply,
  onDeleteInquiry,
  onConvertToOrder,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    inquiries[0]?.id || null
  );
  const [filter, setFilter] = useState<'all' | InquiryStatus>('all');
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(
    !fbStatus?.graphApiConfigured
  );
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Manual Inquiry Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newProfileType, setNewProfileType] = useState<ProfileCategory>('aluminum');
  const [newProfileSystem, setNewProfileSystem] = useState('');
  const [newProjectInterest, setNewProjectInterest] = useState('مطبخ ألومنيوم');
  const [newMessage, setNewMessage] = useState('');
  const [creating, setCreating] = useState(false);

  const filtered = inquiries.filter((inq) =>
    filter === 'all' ? true : inq.status === filter
  );

  const activeInquiry =
    inquiries.find((i) => i.id === selectedId) || filtered[0] || null;

  const webhookUrl =
    fbStatus?.webhookUrl || `${window.location.origin}/api/facebook/webhook`;

  const handleCopyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInquiry || !replyText.trim()) return;
    setSendingReply(true);
    setReplyFeedback(null);
    try {
      const result = await onSendReply(activeInquiry.id, replyText.trim());
      setReplyText('');
      if (result.sentViaGraphApi) {
        setReplyFeedback('تم إرسال الرد مباشرة إلى العميل على ماسنجر فيسبوك.');
      } else if (result.graphWarning) {
        setReplyFeedback(result.graphWarning);
      } else {
        setReplyFeedback('تم تسجيل الرد في سجل المحادثة.');
      }
    } catch (err) {
      setReplyFeedback(
        err instanceof Error ? err.message : 'تعذر إرسال الرد'
      );
    } finally {
      setSendingReply(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newMessage.trim()) return;
    setCreating(true);
    try {
      await onCreateInquiry({
        customerName: newCustomerName.trim(),
        customerPhone: newCustomerPhone.trim(),
        profileType: newProfileType,
        profileSystem: newProfileSystem || undefined,
        projectInterest: newProjectInterest.trim(),
        initialMessage: newMessage.trim(),
      });
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewProfileType('aluminum');
      setNewProfileSystem('');
      setNewProjectInterest('مطبخ ألومنيوم');
      setNewMessage('');
      setShowAddModal(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Connection Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>صفحة التسويق على فيسبوك</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                Page ID: {fbStatus?.pageId || FACEBOOK_PAGE_ID}
              </span>
              <span aria-hidden="true">·</span>
              <span
                className={
                  fbStatus?.graphApiConfigured
                    ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'text-amber-700 dark:text-amber-400 font-semibold'
                }
              >
                {fbStatus?.graphApiConfigured
                  ? 'مربوطة بـ Meta Graph API'
                  : 'وضع Webhook + التسجيل اليدوي'}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
              صندوق رسائل عملاء فيسبوك
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSetupGuide((s) => !s)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>إعدادات الربط التلقائي (Webhook)</span>
              {showSetupGuide ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تسجيل استفسار عميل</span>
            </button>

            <button
              type="button"
              onClick={onSync}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`}
              />
              <span>{syncing ? 'جاري المزامنة...' : 'مزامنة الرسائل'}</span>
            </button>

            <a
              href={fbStatus?.pageUrl || FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>فتح الصفحة</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {syncError && (
          <div className="mt-4 p-3 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg">
            {syncError}
          </div>
        )}

        {/* Meta Webhook & Graph API Setup Guide */}
        {showSetupGuide && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300">
            <div className="space-y-2">
              <p className="font-bold text-slate-900 dark:text-slate-100">
                1. رابط استقبال الرسائل الفوري (Webhook Callback URL)
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                في لوحة مطوري فيسبوك (Meta for Developers &larr; Messenger &larr; Webhooks)، أضف هذا الرابط واشترك في حدث{' '}
                <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  messages
                </code>
                :
              </p>
              <div className="flex items-center gap-2">
                <code
                  dir="ltr"
                  className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate"
                >
                  {webhookUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopyWebhook}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 rounded-lg hover:bg-slate-800 dark:hover:bg-white transition-colors shrink-0"
                >
                  {copiedWebhook ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-900 dark:text-slate-100">
                2. متغيرات الربط الآمنة على الخادم (Secrets)
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                لتفعيل المزامنة التلقائية والرد المباشر على عملاء الصفحة دون مغادرة هذه المنصة، أضف المتغيرات التالية في إعدادات الأسرار (Secrets):
              </p>
              <ul
                className="space-y-1 font-mono text-[11px] text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3"
                dir="ltr"
              >
                <li>FB_PAGE_ID={fbStatus?.pageId || FACEBOOK_PAGE_ID}</li>
                <li>
                  FB_PAGE_ACCESS_TOKEN={'<'}Page Access Token with pages_messaging{'>'}
                </li>
                <li>FB_VERIFY_TOKEN=aluminum_workshop_webhook_verify</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Inbox Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[520px]">
        {/* Conversations List */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto">
            {(
              [
                { id: 'all', label: 'الكل' },
                { id: 'new', label: 'جديد' },
                { id: 'replied', label: 'تم الرد' },
                { id: 'converted', label: 'أمر شغل' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  filter === tab.id
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                لا توجد محادثات في هذا التصنيف
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                اضغط "تسجيل استفسار عميل" لإضافة طلب ورد على صفحة الفيسبوك أو زامن عبر Graph API.
              </p>
            </div>
          ) : (
            <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto">
              {filtered.map((inq) => {
                const isSelected = activeInquiry?.id === inq.id;
                const lastMsg = inq.messages[inq.messages.length - 1];
                return (
                  <button
                    key={inq.id}
                    type="button"
                    onClick={() => setSelectedId(inq.id)}
                    className={`w-full text-right p-4 transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {inq.referenceCode && (
                          <span className="ml-1.5 font-mono text-[11px] text-blue-700 dark:text-blue-400">
                            {inq.referenceCode}
                          </span>
                        )}
                        {inq.customerName}
                      </span>
                      <span className="text-[11px] font-mono tabular-nums text-slate-400 dark:text-slate-500 shrink-0">
                        {new Date(inq.updatedAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {inq.profileType && (
                        <>
                          <span
                            className={
                              inq.profileType === 'upvc'
                                ? 'font-mono font-semibold text-blue-700 dark:text-blue-400'
                                : 'font-medium text-slate-600 dark:text-slate-300'
                            }
                          >
                            {getProfileTypeLabel(inq.profileType)}
                          </span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      <span className="truncate">{inq.projectInterest}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          inq.status === 'new'
                            ? 'text-blue-700 dark:text-blue-400 font-semibold'
                            : inq.status === 'converted'
                            ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-300'
                        }
                      >
                        {inq.status === 'new'
                          ? 'جديد'
                          : inq.status === 'replied'
                          ? 'تم الرد'
                          : 'محول لأمر شغل'}
                      </span>
                    </div>

                    {lastMsg && (
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 truncate">
                        {lastMsg.sender === 'page' ? 'رد الورشة: ' : ''}
                        {lastMsg.text}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Conversation Panel */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col overflow-hidden">
          {!activeInquiry ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                اختر محادثة من القائمة لعرض التفاصيل والرد
              </p>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {activeInquiry.customerName}
                    {activeInquiry.referenceCode && (
                      <span className="mr-2 font-mono text-xs font-semibold text-blue-700 dark:text-blue-400">
                        ({activeInquiry.referenceCode})
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeInquiry.profileType && (
                      <>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {getProfileTypeLabel(activeInquiry.profileType)}
                          {activeInquiry.profileSystem
                            ? ` (${activeInquiry.profileSystem})`
                            : ''}
                        </span>
                        {' · '}
                      </>
                    )}
                    {activeInquiry.projectInterest}
                    {activeInquiry.customerPhone && (
                      <>
                        {' · '}
                        <span className="font-mono tabular-nums">
                          {activeInquiry.customerPhone}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onConvertToOrder(activeInquiry)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white dark:text-slate-950 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-colors whitespace-nowrap"
                  >
                    <ClipboardPlus className="w-3.5 h-3.5" />
                    <span>تحويل إلى أمر شغل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteInquiry(activeInquiry.id)}
                    title="حذف المحادثة"
                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-5 space-y-3 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/60">
                {activeInquiry.messages.map((msg) => {
                  const isPage = msg.sender === 'page';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isPage ? 'items-start' : 'items-end'
                      }`}
                    >
                      <div
                        className={`max-w-[82%] px-4 py-2.5 rounded-xl text-sm leading-relaxed space-y-2 ${
                          isPage
                            ? 'bg-slate-900 dark:bg-blue-700 text-white'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        <p>{msg.text}</p>
                        {msg.attachmentDataUrl && (
                          <div className="pt-1">
                            <a
                              href={msg.attachmentDataUrl}
                              download={msg.attachmentName || 'dimensions.jpg'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                            >
                              <img
                                src={msg.attachmentDataUrl}
                                alt={msg.attachmentName || 'صورة المقاسات'}
                                className="max-h-56 w-auto object-contain bg-slate-100 dark:bg-slate-950"
                              />
                            </a>
                            {msg.attachmentName && (
                              <p className="mt-1 text-[11px] opacity-75 truncate">
                                {msg.attachmentName} (اضغط للحفظ)
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="mt-1 text-[11px] font-mono tabular-nums text-slate-400 dark:text-slate-500">
                        {isPage ? 'الورشة' : activeInquiry.customerName} ·{' '}
                        {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form
                onSubmit={handleReplySubmit}
                className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
              >
                {replyFeedback && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {replyFeedback}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="اكتب ردك للعميل (مثلاً: نحتاج مقاسات المطبخ التقريبية لإعداد تصميم 3D وعرض سعر)..."
                    className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingReply ? 'إرسال...' : 'إرسال الرد'}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Add Manual Facebook Customer Inquiry Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                تسجيل استفسار عميل من فيسبوك
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  اسم العميل على فيسبوك *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="مثال: كريم طارق"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  رقم الهاتف (إن وجد)
                </label>
                <input
                  type="text"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="010..."
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    نوع القطاع
                  </label>
                  <select
                    value={newProfileType}
                    onChange={(e) => {
                      const next = e.target.value as ProfileCategory;
                      setNewProfileType(next);
                      setNewProfileSystem('');
                      if (next === 'upvc' && newProjectInterest === 'مطبخ ألومنيوم') {
                        setNewProjectInterest('شبابيك وأبواب UPVC');
                      } else if (
                        next === 'aluminum' &&
                        newProjectInterest === 'شبابيك وأبواب UPVC'
                      ) {
                        setNewProjectInterest('مطبخ ألومنيوم');
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {PROFILE_TYPES.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    اسم القطاع
                  </label>
                  <select
                    value={newProfileSystem}
                    onChange={(e) => setNewProfileSystem(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">غير محدد</option>
                    {(newProfileType === 'upvc'
                      ? UPVC_PROFILE_SYSTEMS
                      : ALUMINUM_PROFILE_SYSTEMS
                    ).map((sys) => (
                      <option key={sys.id} value={sys.name}>
                        {sys.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  نوع الطلب
                </label>
                <input
                  type="text"
                  value={newProjectInterest}
                  onChange={(e) => setNewProjectInterest(e.target.value)}
                  placeholder="مطبخ كلادينج / شبابيك جرار..."
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  نص رسالة العميل *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="اكتب أو الصق رسالة العميل من ماسنجر..."
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 rounded-lg"
                >
                  {creating ? 'جاري الحفظ...' : 'حفظ المحادثة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
