import React, { useEffect, useMemo, useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Checkbox } from '@/components/ui/Checkbox';
import { Popover } from '@/components/ui/Popover';
import { Search, Filter, Settings, Plus, LifeBuoy, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createTicketThunk, fetchTicketsThunk, type SupportTicket } from '@/store/slices/supportSlice';

export function Support() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { tickets, status, error, createStatus, createError } = useAppSelector((s) => s.support);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<SupportTicket['status'] | ''>('');
  const [filterPriority, setFilterPriority] = useState<SupportTicket['priority'] | ''>('');

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
      render: () => (
        <button className="p-1.5 text-gray hover:text-dark hover:bg-gray-100 rounded-md transition-colors">
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
          {error && <div className="px-4 py-3 text-[13px] text-red-600 border-b border-[#e8e8e8]">{error}</div>}
          <DataTable 
            columns={activeColumns} 
            data={rows}
            defaultPageSize={4}
            pageSizeOptions={[4, 8, 12]}
          />
          {status === 'loading' && <div className="px-4 py-3 text-[13px] text-gray border-t border-[#e8e8e8]">{t('common.loading')}</div>}
        </Card>
      </main>

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
          error={createError}
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
  error,
}: {
  onSubmit: (payload: { subject: string; category: SupportTicket['category']; description: string; priority?: SupportTicket['priority'] }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
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
      {error && <div className="text-[13px] text-red-600">{error}</div>}
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
