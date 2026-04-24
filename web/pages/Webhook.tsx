import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Checkbox } from '@/components/ui/Checkbox';
import { Popover } from '@/components/ui/Popover';
import { Search, Filter, Settings, Plus, Webhook as WebhookIcon, MoreVertical, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchWebhookConfig, fetchWebhookLogs, sendTestEvent, type WebhookDeliveryLogEntry } from '@/store/slices/webhookSlice';

export function Webhook() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, status, error, logs, logsStatus, lastTestQueued } = useAppSelector((s) => s.webhook);

  const [activeTab, setActiveTab] = useState<'list' | 'logs'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebhookDeliveryLogEntry | null>(null);
  const [isLogDetailOpen, setIsLogDetailOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchWebhookConfig());
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === 'logs') {
      void dispatch(fetchWebhookLogs({ limit: 50 }));
    }
  }, [activeTab, dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const ALL_WEBHOOK_COLUMNS = [
    { key: 'url', label: t('webhook.endpoint_url') },
    { key: 'status', label: t('common.status') },
    { key: 'events', label: t('webhook.events') },
    { key: 'createdAt', label: t('common.date') },
  ];

  const ALL_LOG_COLUMNS = [
    { key: 'event', label: t('webhook.event') },
    { key: 'webhook', label: t('webhook.endpoint_url') },
    { key: 'status', label: t('common.status') },
    { key: 'date', label: t('common.date') },
  ];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_WEBHOOK_COLUMNS.map(c => c.key));
  const [visibleLogColumns, setVisibleLogColumns] = useState<string[]>(ALL_LOG_COLUMNS.map(c => c.key));

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => 
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };

  const toggleLogColumn = (key: string) => {
    setVisibleLogColumns(prev => 
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };

  const webhookRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items
      .map((w) => ({
        id: w.id,
        url: w.url,
        status: w.is_active ? 'Active' : 'Inactive',
        events: w.transaction_direction,
        createdAt: '-',
      }))
      .filter((w) => (!q ? true : w.url.toLowerCase().includes(q)));
  }, [items, searchQuery]);

  const webhookColumns: Column<(typeof webhookRows)[number]>[] = [
    {
      key: 'url',
      label: t('webhook.endpoint_url'),
      sortable: true,
      render: (webhook) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <WebhookIcon size={14} />
          </div>
          <span className="text-[13px] font-bold text-dark">{webhook.url}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: t('common.status'),
      sortable: true,
      render: (webhook) => (
        <span className={cn(
          "px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 w-fit",
          webhook.status === 'Active' ? "bg-[#e8f5ee] text-primary" : "bg-gray-100 text-gray"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", webhook.status === 'Active' ? "bg-primary" : "bg-gray-400")} />
          {webhook.status === 'Active' ? t('bank.active') : t('bank.inactive')}
        </span>
      )
    },
    {
      key: 'events',
      label: t('webhook.events'),
      sortable: true,
      cellClassName: "text-[13px] text-gray"
    },
    {
      key: 'createdAt',
      label: t('common.date'),
      sortable: true,
      cellClassName: "text-[13px] text-gray"
    },
    {
      key: 'actions',
      label: t('common.actions'),
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (webhook) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="p-1.5 text-primary hover:text-primary-dark hover:bg-primary/10 rounded-md transition-colors"
            onClick={async (e) => {
              e.stopPropagation();
              await dispatch(sendTestEvent({ webhookId: webhook.id }));
              await dispatch(fetchWebhookLogs({ limit: 50 }));
              setActiveTab('logs');
            }}
            title="Send test"
          >
            <Send size={16} />
          </button>
          <button 
            className="p-1.5 text-gray hover:text-dark hover:bg-gray-100 rounded-md transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/webhook/${webhook.id}`);
            }}
            title={t('common.edit')}
          >
            <MoreVertical size={16} />
          </button>
        </div>
      )
    }
  ];

  const activeWebhookColumns = webhookColumns.filter(col => col.key === 'actions' || visibleColumns.includes(col.key));

  const logRows = useMemo(() => {
    const q = logSearchQuery.trim().toLowerCase();
    return logs
      .map((l) => ({
        id: l.id,
        event: l.event_type,
        webhook: l.url,
        status: `${l.response_status_code}${l.success ? ' OK' : ' Error'}`,
        date: new Date(l.created_at).toLocaleString('vi-VN'),
        success: l.success,
        statusCode: l.response_status_code,
        rawLog: l,
      }))
      .filter((l) => (!q ? true : l.event.toLowerCase().includes(q) || l.webhook.toLowerCase().includes(q)));
  }, [logs, logSearchQuery]);

  const logColumns: Column<(typeof logRows)[number]>[] = [
    { key: 'event', label: t('webhook.event'), sortable: true, cellClassName: "text-[13px] font-bold text-dark" },
    { key: 'webhook', label: t('webhook.endpoint_url'), sortable: true, cellClassName: "text-[13px] text-gray" },
    { 
      key: 'status', 
      label: t('common.status'), 
      sortable: true,
      render: (log) => (
        <span className={cn(
          "px-2.5 py-1 rounded-md text-[11px] font-bold",
          log.status.includes('200') ? "bg-[#e8f5ee] text-primary" : "bg-red-50 text-red-500"
        )}>
          {log.status}
        </span>
      )
    },
    { key: 'date', label: t('common.date'), sortable: true, cellClassName: "text-[13px] text-gray" }
  ];

  const activeLogColumns = logColumns.filter(col => visibleLogColumns.includes(col.key));

  return (
    <div className="min-h-screen bg-section-bg font-sans flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-[24px] font-bold text-dark">{t('webhook.title')}</h1>
        </div>

        {lastTestQueued === true && (
          <div className="mb-6 text-sm text-primary bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
            Đã đưa test event vào hàng đợi. Vui lòng xem tab Logs.
          </div>
        )}

        <div className="flex gap-4 mb-6 border-b border-[#e8e8e8]">
          <button 
            className={cn("pb-3 px-2 text-[14px] font-bold transition-colors border-b-2", activeTab === 'list' ? "border-primary text-primary" : "border-transparent text-gray hover:text-dark")}
            onClick={() => setActiveTab('list')}
          >
            {t('webhook.list')}
          </button>
          <button 
            className={cn("pb-3 px-2 text-[14px] font-bold transition-colors border-b-2", activeTab === 'logs' ? "border-primary text-primary" : "border-transparent text-gray hover:text-dark")}
            onClick={() => setActiveTab('logs')}
          >
            {t('webhook.logs')}
          </button>
        </div>

        {activeTab === 'list' && (
          <Card className="p-0 overflow-hidden">
            {/* Toolbar */}
            <div className="p-5 border-b border-[#e8e8e8] flex flex-col sm:flex-row gap-4 justify-between items-center">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" size={16} />
                <input 
                  type="text" 
                  placeholder={t('webhook.placeholder_search')} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2 rounded-xl text-[13px] py-2 px-3 h-auto"
                    onClick={() => setIsFilterOpen(true)}
                  >
                    <Filter size={14} /> {t('common.filter')}
                  </Button>
                  
                  <Popover
                    trigger={
                      <Button 
                        variant="outline" 
                        className="gap-2 rounded-xl text-[13px] py-2 px-3 h-auto"
                      >
                        <Settings size={14} /> {t('common.columns')}
                      </Button>
                    }
                  >
                    <div className="text-[11px] font-bold text-gray uppercase px-2 mb-2">{t('common.columns')}</div>
                    {ALL_WEBHOOK_COLUMNS.map(col => (
                      <label key={col.key} className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <Checkbox 
                          checked={visibleColumns.includes(col.key)}
                          onCheckedChange={() => toggleColumn(col.key)}
                        />
                        <span className="text-[13px] text-dark">{col.label}</span>
                      </label>
                    ))}
                  </Popover>
                </div>

                <Button 
                  className="gap-2 rounded-xl text-[13px] py-2 px-4 h-auto"
                  onClick={() => navigate('/webhook/create')}
                >
                  <Plus size={14} /> {t('webhook.add')}
                </Button>
              </div>
            </div>

            {/* Table */}
            <DataTable 
              columns={activeWebhookColumns}
              data={webhookRows}
              onRowClick={(webhook) => navigate(`/webhook/${webhook.id}`)}
              defaultPageSize={4}
              pageSizeOptions={[4, 8, 12]}
            />
            {status === 'loading' && <div className="p-4 text-sm text-gray">{t('common.loading')}</div>}
          </Card>
        )}

        {activeTab === 'logs' && (
          <Card className="p-0 overflow-hidden">
            {/* Toolbar */}
            <div className="p-5 border-b border-[#e8e8e8] flex flex-col sm:flex-row gap-4 justify-between items-center">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" size={16} />
                <input 
                  type="text" 
                  placeholder={t('webhook.placeholder_search_logs')} 
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2 rounded-xl text-[13px] py-2 px-3 h-auto"
                    onClick={() => setIsFilterOpen(true)}
                  >
                    <Filter size={14} /> {t('common.filter')}
                  </Button>
                  
                  <Popover
                    trigger={
                      <Button 
                        variant="outline" 
                        className="gap-2 rounded-xl text-[13px] py-2 px-3 h-auto"
                      >
                        <Settings size={14} /> {t('common.columns')}
                      </Button>
                    }
                  >
                    <div className="text-[11px] font-bold text-gray uppercase px-2 mb-2">{t('common.columns')}</div>
                    {ALL_LOG_COLUMNS.map(col => (
                      <label key={col.key} className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <Checkbox 
                          checked={visibleLogColumns.includes(col.key)}
                          onCheckedChange={() => toggleLogColumn(col.key)}
                        />
                        <span className="text-[13px] text-dark">{col.label}</span>
                      </label>
                    ))}
                  </Popover>
                </div>
              </div>
            </div>

            <DataTable 
              columns={activeLogColumns}
              data={logRows}
              onRowClick={(log) => {
                setSelectedLog(log.rawLog);
                setIsLogDetailOpen(true);
              }}
              defaultPageSize={4}
              pageSizeOptions={[4, 8, 12]}
            />
            {logsStatus === 'loading' && <div className="p-4 text-sm text-gray">{t('common.loading')}</div>}
          </Card>
        )}
      </main>

      {/* Log Detail Modal */}
      <Modal 
        isOpen={isLogDetailOpen} 
        onClose={() => {
          setIsLogDetailOpen(false);
          setSelectedLog(null);
        }} 
        title={t('webhook.log_detail') || 'Webhook Log Detail'}
      >
        {selectedLog && (
          <div className="flex flex-col gap-5">
            {/* Status */}
            <div>
              <div className="text-[11px] font-bold text-gray uppercase mb-2">{t('common.status')}</div>
              <div className="flex items-center gap-2">
                {selectedLog.success ? (
                  <CheckCircle size={20} className="text-green-600" />
                ) : (
                  <AlertCircle size={20} className="text-red-500" />
                )}
                <span className={cn(
                  "px-3 py-1.5 rounded-lg text-[13px] font-bold",
                  selectedLog.success ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
                )}>
                  {selectedLog.response_status_code} {selectedLog.success ? 'Success' : 'Failed'}
                </span>
              </div>
            </div>

            {/* Event Type */}
            <div>
              <div className="text-[11px] font-bold text-gray uppercase mb-2">{t('webhook.event')}</div>
              <div className="text-[13px] text-dark font-bold">{selectedLog.event_type}</div>
            </div>

            {/* URL */}
            <div>
              <div className="text-[11px] font-bold text-gray uppercase mb-2">{t('webhook.endpoint_url')}</div>
              <div className="text-[13px] text-dark break-all">{selectedLog.url}</div>
            </div>

            {/* Date */}
            <div>
              <div className="text-[11px] font-bold text-gray uppercase mb-2">{t('common.date')}</div>
              <div className="text-[13px] text-gray">{new Date(selectedLog.created_at).toLocaleString('vi-VN')}</div>
            </div>

            {/* Error Message */}
            {selectedLog.error_message && (
              <div>
                <div className="text-[11px] font-bold text-gray uppercase mb-2">{t('webhook.error_message') || 'Error Message'}</div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-[12px] text-red-600 font-mono">
                  {selectedLog.error_message}
                </div>
              </div>
            )}

            {/* Request Payload */}
            {selectedLog.request_payload && (
              <div>
                <div className="text-[11px] font-bold text-gray uppercase mb-2">{t('webhook.request_payload') || 'Request Payload'}</div>
                <div className="bg-gray-50 border border-[#e8e8e8] rounded-xl p-3 max-h-[200px] overflow-auto">
                  <pre className="text-[11px] text-dark font-mono whitespace-pre-wrap break-all">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLog.request_payload), null, 2);
                      } catch {
                        return selectedLog.request_payload;
                      }
                    })()}
                  </pre>
                </div>
              </div>
            )}

            {/* Response Body */}
            {selectedLog.response_body && (
              <div>
                <div className="text-[11px] font-bold text-gray uppercase mb-2">{t('webhook.response_body') || 'Response Body'}</div>
                <div className="bg-gray-50 border border-[#e8e8e8] rounded-xl p-3 max-h-[200px] overflow-auto">
                  <pre className="text-[11px] text-dark font-mono whitespace-pre-wrap break-all">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLog.response_body), null, 2);
                      } catch {
                        return selectedLog.response_body;
                      }
                    })()}
                  </pre>
                </div>
              </div>
            )}

            <div className="mt-2">
              <Button 
                variant="outline" 
                className="w-full rounded-xl" 
                onClick={() => {
                  setIsLogDetailOpen(false);
                  setSelectedLog(null);
                }}
              >
                {t('common.close') || 'Close'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Filter Drawer */}
      <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title={t('webhook.filter_title')}>
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-[13px] font-bold text-dark mb-2">{t('common.status')}</label>
            <select className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors">
              <option value="">{t('bank.all_statuses')}</option>
              <option value="active">{t('bank.active')}</option>
              <option value="inactive">{t('bank.inactive')}</option>
            </select>
          </div>

          <div className="mt-4 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsFilterOpen(false)}>{t('bank.reset')}</Button>
            <Button className="flex-1 rounded-xl" onClick={() => setIsFilterOpen(false)}>{t('bank.apply_filters')}</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
