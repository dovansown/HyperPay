import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Checkbox } from '@/components/ui/Checkbox';
import { Popover } from '@/components/ui/Popover';
import { Search, Filter, Settings, Plus, LifeBuoy, MoreVertical, Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  createTicketThunk, 
  createTicketReplyThunk,
  fetchTicketsThunk, 
  fetchTicketDetailThunk,
  fetchTicketRepliesThunk,
  clearSelectedTicket,
  type SupportTicket 
} from '@/store/slices/supportSlice';

export function Support() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { 
    tickets, 
    status, 
    error, 
    createStatus, 
    createError,
    selectedTicket,
    ticketDetailStatus,
    replies,
    repliesStatus,
    replyStatus,
    replyError
  } = useAppSelector((s) => s.support);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<SupportTicket['status'] | ''>('');
  const [filterPriority, setFilterPriority] = useState<SupportTicket['priority'] | ''>('');
  const [replyMessage, setReplyMessage] = useState('');

  const ALL_COLUMNS = [
    { key: 'id', label: t('support.ticket_id') },
    { key: 'subject', label: t('support.subject') },
    { key: 'status', label: t('common.status') },
    { key: 'priority', label: t('support.priority') },
    { key: 'createdAt', label: t('support.created_at') },
  ];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_COLUMNS.map(c => c.key));

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => 
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };

  type Row = {
    id: string;
    subject: string;
    status: SupportTicket['status'];
    priority: SupportTicket['priority'];
    createdAt: string;
  };

  const rows: Row[] = useMemo(() => {
    return tickets.map((tk) => ({
      id: tk.code,
      subject: tk.subject,
      status: tk.status,
      priority: tk.priority,
      createdAt: new Date(tk.createdAt).toISOString().slice(0, 10),
    }));
  }, [tickets]);

  useEffect(() => {
    dispatch(fetchTicketsThunk(undefined));
  }, [dispatch]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      dispatch(
        fetchTicketsThunk({
          q: searchQuery.trim() || undefined,
          status: filterStatus || undefined,
          priority: filterPriority || undefined,
        })
      );
    }, 250);
    return () => window.clearTimeout(handle);
  }, [dispatch, filterPriority, filterStatus, searchQuery]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (createError) toast.error(createError);
  }, [createError]);

  useEffect(() => {
    if (replyError) toast.error(replyError);
  }, [replyError]);

  const columns: Column<Row>[] = [
    {
      key: 'id',
      label: t('support.ticket_id'),
      sortable: true,
      render: (ticket) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <LifeBuoy size={14} />
          </div>
          <span className="text-[13px] font-bold text-dark">{ticket.id}</span>
        </div>
      )
    },
    {
      key: 'subject',
      label: t('support.subject'),
      sortable: true,
      cellClassName: "text-[13px] text-dark font-medium"
    },
    {
      key: 'status',
      label: t('common.status'),
      sortable: true,
      render: (ticket) => (
        <span className={cn(
          "px-2.5 py-1 rounded-md text-[11px] font-bold",
          ticket.status === 'OPEN' ? "bg-blue-50 text-blue-600" : 
          ticket.status === 'IN_PROGRESS' ? "bg-yellow-50 text-yellow-600" : 
          "bg-gray-100 text-gray"
        )}>
          {ticket.status === 'OPEN' ? t('support.status_open') : 
           ticket.status === 'IN_PROGRESS' ? t('support.status_in_progress') : 
           t('support.status_closed')}
        </span>
      )
    },
    {
      key: 'priority',
      label: t('support.priority'),
      sortable: true,
      render: (ticket) => (
        <span className={cn(
          "px-2.5 py-1 rounded-md text-[11px] font-bold",
          ticket.priority === 'HIGH' ? "bg-red-50 text-red-600" : 
          ticket.priority === 'MEDIUM' ? "bg-orange-50 text-orange-600" : 
          "bg-green-50 text-green-600"
        )}>
          {ticket.priority === 'HIGH' ? t('support.priority_high') : 
           ticket.priority === 'MEDIUM' ? t('support.priority_medium') : 
           t('support.priority_low')}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: t('support.created_at'),
      sortable: true,
      cellClassName: "text-[13px] text-gray"
    },
    {
      key: 'actions',
      label: t('common.actions'),
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (ticket) => (
        <button 
          className="p-1.5 text-gray hover:text-dark hover:bg-gray-100 rounded-md transition-colors"
          onClick={async (e) => {
            e.stopPropagation();
            const fullTicket = tickets.find(t => t.code === ticket.id);
            if (fullTicket) {
              await dispatch(fetchTicketDetailThunk(fullTicket.id));
              await dispatch(fetchTicketRepliesThunk(fullTicket.id));
              setIsDetailModalOpen(true);
            }
          }}
        >
          <MoreVertical size={16} />
        </button>
      )
    }
  ];

  const activeColumns = columns.filter(col => col.key === 'actions' || visibleColumns.includes(col.key));

  return (
    <div className="min-h-screen bg-section-bg font-sans flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-[24px] font-bold text-dark">{t('support.title')}</h1>
        </div>

        <Card className="p-0 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 md:p-5 border-b border-[#e8e8e8] flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" size={16} />
              <input 
                type="text" 
                placeholder={t('support.placeholder_search')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="gap-2 rounded-xl text-[13px] py-2 px-3 h-auto"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <Filter size={14} /> <span className="hidden sm:inline">{t('common.filter')}</span>
                </Button>
                
                <Popover
                  trigger={
                    <Button 
                      variant="outline" 
                      className="gap-2 rounded-xl text-[13px] py-2 px-3 h-auto"
                    >
                      <Settings size={14} /> <span className="hidden sm:inline">{t('common.columns')}</span>
                    </Button>
                  }
                >
                  <div className="text-[11px] font-bold text-gray uppercase px-2 mb-2">{t('common.columns')}</div>
                  {ALL_COLUMNS.map(col => (
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
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={14} /> <span className="hidden sm:inline">{t('support.add')}</span>
              </Button>
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={activeColumns} 
            data={rows}
            onRowClick={async (row) => {
              const fullTicket = tickets.find(t => t.code === row.id);
              if (fullTicket) {
                await dispatch(fetchTicketDetailThunk(fullTicket.id));
                await dispatch(fetchTicketRepliesThunk(fullTicket.id));
                setIsDetailModalOpen(true);
              }
            }}
            defaultPageSize={4}
            pageSizeOptions={[4, 8, 12]}
          />
          {status === 'loading' && <div className="px-4 py-3 text-[13px] text-gray border-t border-[#e8e8e8]">{t('common.loading')}</div>}
        </Card>
      </main>

      {/* Ticket Detail Modal */}
      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={() => {
          setIsDetailModalOpen(false);
          dispatch(clearSelectedTicket());
          setReplyMessage('');
        }} 
        title={t('support.ticket_detail') || 'Ticket Detail'}
      >
        {selectedTicket && (
          <div className="flex flex-col gap-5">
            {/* Ticket Info */}
            <div className="bg-gray-50 border border-[#e8e8e8] rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] font-bold text-gray uppercase mb-1">{t('support.ticket_id')}</div>
                  <div className="text-[13px] font-bold text-dark">{selectedTicket.code}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray uppercase mb-1">{t('common.status')}</div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-bold inline-block",
                    selectedTicket.status === 'OPEN' ? "bg-blue-50 text-blue-600" : 
                    selectedTicket.status === 'IN_PROGRESS' ? "bg-yellow-50 text-yellow-600" : 
                    "bg-gray-100 text-gray"
                  )}>
                    {selectedTicket.status === 'OPEN' ? t('support.status_open') : 
                     selectedTicket.status === 'IN_PROGRESS' ? t('support.status_in_progress') : 
                     t('support.status_closed')}
                  </span>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray uppercase mb-1">{t('support.priority')}</div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-bold inline-block",
                    selectedTicket.priority === 'HIGH' ? "bg-red-50 text-red-600" : 
                    selectedTicket.priority === 'MEDIUM' ? "bg-orange-50 text-orange-600" : 
                    "bg-green-50 text-green-600"
                  )}>
                    {selectedTicket.priority === 'HIGH' ? t('support.priority_high') : 
                     selectedTicket.priority === 'MEDIUM' ? t('support.priority_medium') : 
                     t('support.priority_low')}
                  </span>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray uppercase mb-1">{t('support.category')}</div>
                  <div className="text-[13px] text-dark">{selectedTicket.category}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-[11px] font-bold text-gray uppercase mb-1">{t('support.subject')}</div>
                <div className="text-[14px] font-bold text-dark">{selectedTicket.subject}</div>
              </div>
              {selectedTicket.description && (
                <div className="mt-4">
                  <div className="text-[11px] font-bold text-gray uppercase mb-1">{t('support.description')}</div>
                  <div className="text-[13px] text-gray whitespace-pre-wrap">{selectedTicket.description}</div>
                </div>
              )}
            </div>

            {/* Replies */}
            <div>
              <div className="text-[13px] font-bold text-dark mb-3">{t('support.replies') || 'Replies'}</div>
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                {repliesStatus === 'loading' && (
                  <div className="text-[13px] text-gray text-center py-4">{t('common.loading')}</div>
                )}
                {replies.length === 0 && repliesStatus === 'succeeded' && (
                  <div className="text-[13px] text-gray text-center py-4">{t('support.no_replies') || 'No replies yet'}</div>
                )}
                {replies.map((reply) => (
                  <div 
                    key={reply.id} 
                    className={cn(
                      "p-3 rounded-xl border",
                      reply.isStaffReply 
                        ? "bg-primary/5 border-primary/20" 
                        : "bg-gray-50 border-[#e8e8e8]"
                    )}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold",
                        reply.isStaffReply ? "bg-primary" : "bg-gray-400"
                      )}>
                        <User size={12} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-dark">
                            {reply.isStaffReply ? (t('support.staff') || 'Staff') : (t('support.you') || 'You')}
                          </span>
                          <span className="text-[11px] text-gray">
                            {new Date(reply.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[13px] text-dark whitespace-pre-wrap pl-8">{reply.message}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Form */}
            {selectedTicket.status !== 'CLOSED' && (
              <div>
                <div className="flex gap-2">
                  <textarea
                    placeholder={t('support.type_reply') || 'Type your reply...'}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors resize-none"
                    rows={3}
                  />
                  <Button
                    className="px-3 py-2 rounded-xl h-auto self-end"
                    disabled={!replyMessage.trim() || replyStatus === 'loading'}
                    onClick={async () => {
                      if (!replyMessage.trim()) return;
                      await dispatch(createTicketReplyThunk({ 
                        ticketId: selectedTicket.id, 
                        message: replyMessage.trim() 
                      }));
                      setReplyMessage('');
                    }}
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-2">
              <Button 
                variant="outline" 
                className="w-full rounded-xl" 
                onClick={() => {
                  setIsDetailModalOpen(false);
                  dispatch(clearSelectedTicket());
                  setReplyMessage('');
                }}
              >
                {t('common.close') || 'Close'}
              </Button>
            </div>
          </div>
        )}
        {ticketDetailStatus === 'loading' && (
          <div className="text-center py-8 text-gray">{t('common.loading')}</div>
        )}
      </Modal>

      {/* Filter Drawer */}
      <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title={t('support.filter_title')}>
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-[13px] font-bold text-dark mb-2">{t('common.status')}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as SupportTicket['status'] | '')}
              className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
            >
              <option value="">{t('bank.all_statuses')}</option>
              <option value="OPEN">{t('support.status_open')}</option>
              <option value="IN_PROGRESS">{t('support.status_in_progress')}</option>
              <option value="CLOSED">{t('support.status_closed')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-[13px] font-bold text-dark mb-2">{t('support.priority')}</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as SupportTicket['priority'] | '')}
              className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
            >
              <option value="">{t('bank.all_types')}</option>
              <option value="HIGH">{t('support.priority_high')}</option>
              <option value="MEDIUM">{t('support.priority_medium')}</option>
              <option value="LOW">{t('support.priority_low')}</option>
            </select>
          </div>

          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => {
                setFilterStatus('');
                setFilterPriority('');
                setIsFilterOpen(false);
              }}
            >
              {t('bank.reset')}
            </Button>
            <Button className="flex-1 rounded-xl" onClick={() => setIsFilterOpen(false)}>
              {t('bank.apply_filters')}
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Add Ticket Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('support.add')}>
        <AddTicketForm
          isSubmitting={createStatus === 'loading'}
          onCancel={() => setIsAddModalOpen(false)}
          onSubmit={async (payload) => {
            await dispatch(createTicketThunk(payload)).unwrap();
            setIsAddModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

function AddTicketForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  onSubmit: (payload: { subject: string; category: SupportTicket['category']; description: string; priority?: SupportTicket['priority'] }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const { t } = useLanguage();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category'] | ''>('');
  const [priority, setPriority] = useState<SupportTicket['priority']>('MEDIUM');
  const [description, setDescription] = useState('');

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!category) return;
        await onSubmit({ subject, category, description, priority });
      }}
    >
      <div>
        <label className="block text-[13px] font-bold text-dark mb-2">{t('support.subject')}</label>
        <input
          type="text"
          placeholder={t('support.placeholder_subject')}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-bold text-dark mb-2">{t('support.category')}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SupportTicket['category'])}
            className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
            required
          >
            <option value="">{t('support.placeholder_category')}</option>
            <option value="BILLING">{t('support.cat_billing')}</option>
            <option value="TECHNICAL">{t('support.cat_technical')}</option>
            <option value="ACCOUNT">{t('support.cat_account')}</option>
            <option value="OTHER">{t('support.cat_other')}</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-dark mb-2">{t('support.priority')}</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as SupportTicket['priority'])}
            className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
          >
            <option value="HIGH">{t('support.priority_high')}</option>
            <option value="MEDIUM">{t('support.priority_medium')}</option>
            <option value="LOW">{t('support.priority_low')}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-dark mb-2">{t('support.description')}</label>
        <textarea
          placeholder={t('support.placeholder_description')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors min-h-[120px] resize-y"
          required
        />
      </div>

      <div className="mt-2 flex gap-3">
        <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" className="flex-1 rounded-xl" disabled={isSubmitting}>
          {isSubmitting ? t('common.loading') : t('support.submit')}
        </Button>
      </div>
    </form>
  );
}
