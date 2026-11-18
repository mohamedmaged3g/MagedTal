import { useCallback, useEffect, useState } from 'react';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';
import { FacebookInboxView } from './components/FacebookInboxView.tsx';
import { OrderModal } from './components/OrderModal.tsx';
import { OrdersView } from './components/OrdersView.tsx';
import { OverviewView } from './components/OverviewView.tsx';
import { OfflineIndicator } from './components/PWAInstallButton.tsx';
import { Sidebar, type ActiveTab } from './components/Sidebar.tsx';
import { TopBar } from './components/TopBar.tsx';
import { WebsiteView } from './components/WebsiteView.tsx';
import { WorkspaceView } from './components/WorkspaceView.tsx';
import { ORDER_STAGES } from './data/tools.ts';
import type {
  AuthSessionStatus,
  FacebookInquiry,
  FacebookStatusResponse,
  OrderSource,
  OrderStage,
  ProfileCategory,
  ToolId,
  WorkshopOrder,
} from './types.ts';

const TOKEN_STORAGE_KEY = 'alm_admin_token_v1';

export default function App() {
  const [appMode, setAppMode] = useState<'website' | 'dashboard'>('website');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [activeToolId, setActiveToolId] = useState<ToolId>('kitchen-3d-studio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light'
  );

  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [authStatus, setAuthStatus] = useState<AuthSessionStatus | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingNav, setPendingNav] = useState<{
    tab: ActiveTab;
    toolId?: ToolId;
  } | null>(null);

  const handleToggleTheme = (nextTheme: 'light' | 'dark') => {
    setTheme(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    try {
      localStorage.setItem('alm_theme', nextTheme);
    } catch {
      // Ignore storage quota errors
    }
  };

  const [orders, setOrders] = useState<WorkshopOrder[]>([]);
  const [inquiries, setInquiries] = useState<FacebookInquiry[]>([]);
  const [fbStatus, setFbStatus] = useState<FacebookStatusResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [syncingFb, setSyncingFb] = useState(false);
  const [fbSyncError, setFbSyncError] = useState<string | null>(null);

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkshopOrder | null>(null);
  const [orderPrefill, setOrderPrefill] = useState<{
    clientName?: string;
    clientPhone?: string;
    source?: OrderSource;
    profileType?: ProfileCategory;
    projectType?: string;
    dimensionsNote?: string;
    linkedInquiryId?: string;
  } | null>(null);

  const getAuthHeaders = useCallback(
    (includeJson = false, overrideToken?: string | null): Record<string, string> => {
      const headers: Record<string, string> = {};
      if (includeJson) {
        headers['Content-Type'] = 'application/json';
      }
      const token = overrideToken !== undefined ? overrideToken : authToken;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return headers;
    },
    [authToken]
  );

  const saveOrdersBackup = (list: WorkshopOrder[]) => {
    try {
      localStorage.setItem('alm_workshop_orders_v1', JSON.stringify(list));
    } catch {
      // Ignore storage quota errors
    }
  };

  const loadOrdersBackup = (): WorkshopOrder[] => {
    try {
      const raw = localStorage.getItem('alm_workshop_orders_v1');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as WorkshopOrder[]) : [];
    } catch {
      return [];
    }
  };

  const loadDashboardData = useCallback(
    async (overrideToken?: string | null) => {
      setLoading(true);
      try {
        const headers = getAuthHeaders(false, overrideToken);
        const [ordersRes, statusRes, convRes] = await Promise.all([
          fetch('/api/orders', { headers }),
          fetch('/api/facebook/status'),
          fetch('/api/facebook/conversations', { headers }),
        ]);

        if (ordersRes.ok) {
          const ordersData = (await ordersRes.json()) as {
            orders: WorkshopOrder[];
          };
          const serverOrders = ordersData.orders || [];
          if (serverOrders.length > 0) {
            setOrders(serverOrders);
            saveOrdersBackup(serverOrders);
          } else {
            const backup = loadOrdersBackup();
            if (backup.length > 0) {
              const restored: WorkshopOrder[] = [];
              for (const item of [...backup].reverse()) {
                const r = await fetch('/api/orders', {
                  method: 'POST',
                  headers: getAuthHeaders(true, overrideToken),
                  body: JSON.stringify(item),
                });
                if (r.ok) {
                  const d = (await r.json()) as { order: WorkshopOrder };
                  restored.unshift(d.order);
                }
              }
              const finalOrders = restored.length > 0 ? restored : backup;
              setOrders(finalOrders);
              saveOrdersBackup(finalOrders);
            } else {
              setOrders([]);
            }
          }
        }

        if (statusRes.ok) {
          const statusData = (await statusRes.json()) as FacebookStatusResponse;
          setFbStatus(statusData);
        }

        if (convRes.ok) {
          const convData = (await convRes.json()) as {
            inquiries: FacebookInquiry[];
            graphSyncError?: string | null;
          };
          setInquiries(convData.inquiries || []);
          setFbSyncError(convData.graphSyncError || null);
        }
      } catch {
        // Keep UI interactive even on transient network errors
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Check session on startup and handle /admin route
  useEffect(() => {
    let cancelled = false;
    const isAdminRoute =
      typeof window !== 'undefined' &&
      (window.location.pathname === '/admin' ||
        window.location.search.includes('admin=1'));

    (async () => {
      try {
        const res = await fetch('/api/auth/session', {
          headers: getAuthHeaders(false),
        });
        if (!res.ok || cancelled) return;
        const status = (await res.json()) as AuthSessionStatus;
        if (cancelled) return;
        setAuthStatus(status);

        if (status.authenticated) {
          void loadDashboardData();
          if (isAdminRoute) {
            setAppMode('dashboard');
          }
        } else if (isAdminRoute) {
          setPendingNav({ tab: 'overview' });
          setLoginModalOpen(true);
        }
      } catch {
        // Ignore network failure on initial session check
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getAuthHeaders, loadDashboardData]);

  const handleOpenTool = (toolId: ToolId) => {
    setActiveToolId(toolId);
    setActiveTab('workspace');
  };

  const handleOpenNewOrder = () => {
    setEditingOrder(null);
    setOrderPrefill(null);
    setOrderModalOpen(true);
  };

  const handleEditOrder = (order: WorkshopOrder) => {
    setEditingOrder(order);
    setOrderPrefill(null);
    setOrderModalOpen(true);
  };

  const handleSaveOrder = async (payload: {
    id?: string;
    clientName: string;
    clientPhone: string;
    source: OrderSource;
    profileType: ProfileCategory;
    projectType: string;
    dimensionsNote: string;
    stage: OrderStage;
    activeToolId: ToolId;
    totalCost: number;
    paidDeposit: number;
    linkedInquiryId?: string;
  }) => {
    if (payload.id) {
      const res = await fetch(`/api/orders/${payload.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        order?: WorkshopOrder;
        error?: string;
      };
      if (!res.ok || !data.order) {
        throw new Error(data.error || 'تعذر تحديث أمر الشغل');
      }
      setOrders((prev) => {
        const next = prev.map((o) =>
          o.id === data.order!.id ? data.order! : o
        );
        saveOrdersBackup(next);
        return next;
      });
    } else {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        order?: WorkshopOrder;
        error?: string;
      };
      if (!res.ok || !data.order) {
        throw new Error(data.error || 'تعذر إنشاء أمر الشغل');
      }
      setOrders((prev) => {
        const next = [data.order!, ...prev];
        saveOrdersBackup(next);
        return next;
      });
      if (payload.linkedInquiryId) {
        setInquiries((prev) =>
          prev.map((inq) =>
            inq.id === payload.linkedInquiryId
              ? { ...inq, status: 'converted', linkedOrderId: data.order!.id }
              : inq
          )
        );
      }
    }
  };

  const handleUpdateOrderStage = async (orderId: string, stage: OrderStage) => {
    const matchedStage = ORDER_STAGES.find((s) => s.id === stage);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        stage,
        activeToolId: matchedStage?.toolId,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { order: WorkshopOrder };
      setOrders((prev) => {
        const next = prev.map((o) => (o.id === orderId ? data.order : o));
        saveOrdersBackup(next);
        return next;
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    if (res.ok) {
      setOrders((prev) => {
        const next = prev.filter((o) => o.id !== orderId);
        saveOrdersBackup(next);
        return next;
      });
    }
  };

  const handleSyncFacebook = async () => {
    setSyncingFb(true);
    setFbSyncError(null);
    try {
      const res = await fetch('/api/facebook/conversations', {
        headers: getAuthHeaders(false),
      });
      const data = (await res.json()) as {
        inquiries: FacebookInquiry[];
        graphSyncError?: string | null;
      };
      if (res.ok) {
        setInquiries(data.inquiries || []);
        setFbSyncError(data.graphSyncError || null);
      }
    } catch {
      setFbSyncError('تعذر الاتصال بالخادم لمزامنة الرسائل');
    } finally {
      setSyncingFb(false);
    }
  };

  const handleCreateInquiry = async (payload: {
    customerName: string;
    customerPhone: string;
    profileType?: ProfileCategory;
    projectInterest: string;
    initialMessage: string;
    attachmentName?: string;
    attachmentDataUrl?: string;
  }) => {
    const res = await fetch('/api/facebook/inquiries', {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {
      inquiry?: FacebookInquiry;
      error?: string;
    };
    if (!res.ok || !data.inquiry) {
      throw new Error(data.error || 'تعذر حفظ الاستفسار');
    }
    setInquiries((prev) => [data.inquiry!, ...prev]);
    return data.inquiry;
  };

  const handleSendReply = async (inquiryId: string, text: string) => {
    const res = await fetch('/api/facebook/reply', {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ inquiryId, text }),
    });
    const data = (await res.json()) as {
      inquiry?: FacebookInquiry;
      sentViaGraphApi?: boolean;
      graphWarning?: string;
      error?: string;
    };
    if (!res.ok || !data.inquiry) {
      throw new Error(data.error || 'تعذر إرسال الرد');
    }
    setInquiries((prev) =>
      prev.map((i) => (i.id === inquiryId ? data.inquiry! : i))
    );
    return {
      sentViaGraphApi: data.sentViaGraphApi,
      graphWarning: data.graphWarning,
    };
  };

  const handleDeleteInquiry = async (id: string) => {
    const res = await fetch(`/api/facebook/inquiries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false),
    });
    if (res.ok) {
      setInquiries((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleConvertInquiryToOrder = (inquiry: FacebookInquiry) => {
    const firstMsg = inquiry.messages[0]?.text || '';
    const inferredProfile: ProfileCategory =
      inquiry.profileType ||
      (/upvc|يو\s*بي\s*في\s*سي/i.test(
        `${inquiry.projectInterest} ${firstMsg}`
      )
        ? 'upvc'
        : 'aluminum');

    setEditingOrder(null);
    setOrderPrefill({
      clientName: inquiry.customerName,
      clientPhone: inquiry.customerPhone || '',
      source: 'facebook',
      profileType: inferredProfile,
      projectType: inquiry.projectInterest || 'استفسار فيسبوك',
      dimensionsNote: firstMsg,
      linkedInquiryId: inquiry.id,
    });
    setOrderModalOpen(true);
  };

  const enterDashboardDirect = (tab: ActiveTab, toolId?: ToolId) => {
    if (toolId) {
      setActiveToolId(toolId);
    }
    setActiveTab(tab);
    setAppMode('dashboard');
    if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
      window.history.pushState(null, '', '/admin');
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleEnterDashboard = (tab: ActiveTab = 'overview', toolId?: ToolId) => {
    if (authStatus?.authenticated) {
      enterDashboardDirect(tab, toolId);
      return;
    }
    setPendingNav({ tab, toolId });
    setLoginModalOpen(true);
  };

  const handleAdminLogin = async (password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      token?: string;
      usingDefaultPassword?: boolean;
      persistentDbConfigured?: boolean;
      error?: string;
    };

    if (!res.ok || !data.ok || !data.token) {
      throw new Error(data.error || 'كلمة المرور غير صحيحة');
    }

    try {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    } catch {
      // Cookie fallback remains active
    }
    setAuthToken(data.token);
    setAuthStatus({
      authenticated: true,
      usingDefaultPassword: Boolean(data.usingDefaultPassword),
      persistentDbConfigured: Boolean(data.persistentDbConfigured),
    });
    setLoginModalOpen(false);
    await loadDashboardData(data.token);

    const target = pendingNav || { tab: 'overview' as ActiveTab };
    setPendingNav(null);
    enterDashboardDirect(target.tab, target.toolId);
  };

  const handleReturnToWebsite = () => {
    setAppMode('website');
    if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Ignore storage failures
    }
    setAuthToken(null);
    setAuthStatus((prev) =>
      prev ? { ...prev, authenticated: false } : null
    );
    setOrders([]);
    setInquiries([]);
    handleReturnToWebsite();
  };

  const unreadInquiriesCount = inquiries.filter((i) => i.status === 'new').length;
  const activeOrdersCount = orders.filter((o) => o.stage !== 'delivery').length;

  if (appMode === 'website' || !authStatus?.authenticated) {
    return (
      <>
        <WebsiteView
          theme={theme}
          isAuthenticated={Boolean(authStatus?.authenticated)}
          onToggleTheme={handleToggleTheme}
          onEnterDashboard={handleEnterDashboard}
          onSubmitQuoteRequest={handleCreateInquiry}
        />
        <AdminLoginModal
          isOpen={loginModalOpen}
          onClose={() => {
            setLoginModalOpen(false);
            setPendingNav(null);
            if (
              typeof window !== 'undefined' &&
              window.location.pathname === '/admin'
            ) {
              window.history.pushState(null, '', '/');
            }
          }}
          onLogin={handleAdminLogin}
        />
        <OfflineIndicator />
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <OfflineIndicator />
      <Sidebar
        activeTab={activeTab}
        activeToolId={activeToolId}
        unreadInquiriesCount={unreadInquiriesCount}
        activeOrdersCount={activeOrdersCount}
        mobileOpen={mobileMenuOpen}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onReturnToWebsite={handleReturnToWebsite}
        onLogout={handleLogout}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onSelectTab={setActiveTab}
        onOpenTool={handleOpenTool}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          activeTab={activeTab}
          activeToolId={activeToolId}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNewOrder={handleOpenNewOrder}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse"
                  />
                ))}
              </div>
              <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse" />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewView
                  orders={orders}
                  inquiries={inquiries}
                  fbStatus={fbStatus}
                  authStatus={authStatus}
                  onOpenTool={handleOpenTool}
                  onSelectTab={setActiveTab}
                  onNewOrder={handleOpenNewOrder}
                />
              )}

              {activeTab === 'workspace' && (
                <WorkspaceView
                  activeToolId={activeToolId}
                  authToken={authToken}
                  onSelectTool={setActiveToolId}
                  onNewOrder={handleOpenNewOrder}
                />
              )}

              {activeTab === 'facebook' && (
                <FacebookInboxView
                  inquiries={inquiries}
                  fbStatus={fbStatus}
                  syncing={syncingFb}
                  syncError={fbSyncError}
                  onSync={handleSyncFacebook}
                  onCreateInquiry={handleCreateInquiry}
                  onSendReply={handleSendReply}
                  onDeleteInquiry={handleDeleteInquiry}
                  onConvertToOrder={handleConvertInquiryToOrder}
                />
              )}

              {activeTab === 'orders' && (
                <OrdersView
                  orders={orders}
                  onNewOrder={handleOpenNewOrder}
                  onEditOrder={handleEditOrder}
                  onUpdateStage={handleUpdateOrderStage}
                  onDeleteOrder={handleDeleteOrder}
                  onOpenTool={handleOpenTool}
                />
              )}
            </>
          )}
        </main>
      </div>

      <OrderModal
        isOpen={orderModalOpen}
        initialOrder={editingOrder}
        prefill={orderPrefill}
        onClose={() => {
          setOrderModalOpen(false);
          setEditingOrder(null);
          setOrderPrefill(null);
        }}
        onSave={handleSaveOrder}
      />
    </div>
  );
}
