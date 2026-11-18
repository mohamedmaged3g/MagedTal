import { useCallback, useEffect, useState } from 'react';
import { FacebookInboxView } from './components/FacebookInboxView.tsx';
import { OrderModal } from './components/OrderModal.tsx';
import { OrdersView } from './components/OrdersView.tsx';
import { OverviewView } from './components/OverviewView.tsx';
import { Sidebar, type ActiveTab } from './components/Sidebar.tsx';
import { TopBar } from './components/TopBar.tsx';
import { WorkspaceView } from './components/WorkspaceView.tsx';
import { ORDER_STAGES } from './data/tools.ts';
import type {
  FacebookInquiry,
  FacebookStatusResponse,
  OrderSource,
  OrderStage,
  ToolId,
  WorkshopOrder,
} from './types.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [activeToolId, setActiveToolId] = useState<ToolId>('kitchen-3d-studio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [orders, setOrders] = useState<WorkshopOrder[]>([]);
  const [inquiries, setInquiries] = useState<FacebookInquiry[]>([]);
  const [fbStatus, setFbStatus] = useState<FacebookStatusResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [syncingFb, setSyncingFb] = useState(false);
  const [fbSyncError, setFbSyncError] = useState<string | null>(null);

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkshopOrder | null>(null);
  const [orderPrefill, setOrderPrefill] = useState<{
    clientName?: string;
    clientPhone?: string;
    source?: OrderSource;
    projectType?: string;
    dimensionsNote?: string;
    linkedInquiryId?: string;
  } | null>(null);

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

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, statusRes, convRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/facebook/status'),
        fetch('/api/facebook/conversations'),
      ]);

      if (ordersRes.ok) {
        const ordersData = (await ordersRes.json()) as { orders: WorkshopOrder[] };
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
                headers: { 'Content-Type': 'application/json' },
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
  }, []);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { order?: WorkshopOrder; error?: string };
      if (!res.ok || !data.order) {
        throw new Error(data.error || 'تعذر تحديث أمر الشغل');
      }
      setOrders((prev) => {
        const next = prev.map((o) => (o.id === data.order!.id ? data.order! : o));
        saveOrdersBackup(next);
        return next;
      });
    } else {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { order?: WorkshopOrder; error?: string };
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
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
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
      const res = await fetch('/api/facebook/conversations');
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
    projectInterest: string;
    initialMessage: string;
  }) => {
    const res = await fetch('/api/facebook/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { inquiry?: FacebookInquiry; error?: string };
    if (!res.ok || !data.inquiry) {
      throw new Error(data.error || 'تعذر حفظ الاستفسار');
    }
    setInquiries((prev) => [data.inquiry!, ...prev]);
  };

  const handleSendReply = async (inquiryId: string, text: string) => {
    const res = await fetch('/api/facebook/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    });
    if (res.ok) {
      setInquiries((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleConvertInquiryToOrder = (inquiry: FacebookInquiry) => {
    const firstMsg = inquiry.messages[0]?.text || '';
    setEditingOrder(null);
    setOrderPrefill({
      clientName: inquiry.customerName,
      clientPhone: inquiry.customerPhone || '',
      source: 'facebook',
      projectType: inquiry.projectInterest || 'استفسار فيسبوك',
      dimensionsNote: firstMsg,
      linkedInquiryId: inquiry.id,
    });
    setOrderModalOpen(true);
  };

  const unreadInquiriesCount = inquiries.filter((i) => i.status === 'new').length;
  const activeOrdersCount = orders.filter((o) => o.stage !== 'delivery').length;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar
        activeTab={activeTab}
        activeToolId={activeToolId}
        unreadInquiriesCount={unreadInquiriesCount}
        activeOrdersCount={activeOrdersCount}
        mobileOpen={mobileMenuOpen}
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
                    className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse"
                  />
                ))}
              </div>
              <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewView
                  orders={orders}
                  inquiries={inquiries}
                  fbStatus={fbStatus}
                  onOpenTool={handleOpenTool}
                  onSelectTab={setActiveTab}
                  onNewOrder={handleOpenNewOrder}
                />
              )}

              {activeTab === 'workspace' && (
                <WorkspaceView
                  activeToolId={activeToolId}
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
