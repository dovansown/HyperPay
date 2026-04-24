import { useEffect, useMemo, useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { DatePicker } from '@/components/ui/DatePicker';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Checkbox } from '@/components/ui/Checkbox';
import { Popover } from '@/components/ui/Popover';
import { Filter, Plus, RefreshCcw, Search, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearAccountsError,
  createAccount,
  deleteAccount,
  fetchAccounts,
  refreshAccountToken,
  updateAccount
} from '@/store/slices/accountsSlice';
import { fetchBanks } from '@/store/slices/banksSlice';

function maskAccountNumber(n: string): string {
  const s = (n ?? '').replace(/\s+/g, '');
  if (s.length <= 4) return s;
  return `**** ${s.slice(-4)}`;
}

export function Bank() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();

  const accounts = useAppSelector((s) => s.accounts.items);
  const accountsStatus = useAppSelector((s) => s.accounts.status);

  const banks = useAppSelector((s) => s.banks.items);
  const banksStatus = useAppSelector((s) => s.banks.status);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  const [formBankName, setFormBankName] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formAccountHolder, setFormAccountHolder] = useState('');

  useEffect(() => {
    void dispatch(fetchAccounts());
    void dispatch(fetchBanks());
  }, [dispatch]);


  const ALL_COLUMNS = [
    { key: 'bankName', label: t('bank.name') },
    { key: 'accountNo', label: t('bank.account_no') },
    { key: 'holder', label: t('auth.full_name') },
  ];
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_COLUMNS.map(c => c.key));

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => 
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };

  const columns: Column<(typeof tableRows)[number]>[] = [
    {
      key: 'bankName',
      label: t('bank.name'),
      sortable: true,
      render: (bank) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {(bank.bankName?.[0] ?? 'B').toUpperCase()}
          </div>
          <span className="text-[13px] font-bold text-dark">{bank.bankName}</span>
        </div>
      )
    },
    {
      key: 'accountNo',
      label: t('bank.account_no'),
      sortable: true,
      cellClassName: "text-[13px] text-gray"
    },
    {
      key: 'holder',
      label: t('auth.full_name'),
      sortable: true,
      cellClassName: "text-[13px] text-gray"
    },
    {
      key: 'actions',
      label: t('common.actions'),
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (bank) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            className="p-1.5 text-gray hover:text-dark hover:bg-gray-100 rounded-md transition-colors"
            onClick={async (e) => {
              e.stopPropagation();
              dispatch(clearAccountsError());
              try {
                const result = await dispatch(refreshAccountToken(bank.id)).unwrap();
                toast.success(result.message || 'API token mới đã được gửi về email của bạn.');
              } catch (err: unknown) {
                toast.error(err instanceof Error ? err.message : 'Không thể làm mới API token');
              }
            }}
            title="Refresh token"
          >
            <RefreshCcw size={16} />
          </button>
          <button
            className="px-2 py-1.5 text-[12px] font-bold text-gray hover:text-dark hover:bg-gray-100 rounded-md transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setEditingAccountId(bank.id);
              setFormBankName(bank.bankName);
              setFormAccountNumber(bank.rawAccountNumber);
              setFormAccountHolder(bank.holder);
              setIsAddModalOpen(true);
            }}
            title={t('common.edit')}
          >
            {t('common.edit')}
          </button>
          <button
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingAccountId(bank.id);
              setIsDeleteModalOpen(true);
            }}
            title={t('common.delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const tableRows = useMemo(() => {
    return accounts.map((a) => ({
      id: a.id,
      bankName: a.bank_name,
      accountNo: maskAccountNumber(a.account_number),
      rawAccountNumber: a.account_number,
      holder: a.account_holder,
    }));
  }, [accounts]);

  const activeColumns = columns.filter((col) => col.key === 'actions' || visibleColumns.includes(col.key));

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tableRows;
    return tableRows.filter(
      (r) => r.bankName.toLowerCase().includes(q) || r.accountNo.toLowerCase().includes(q) || r.holder.toLowerCase().includes(q)
    );
  }, [searchQuery, tableRows]);


  return (
    <div className="min-h-screen bg-section-bg font-sans flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-[24px] font-bold text-dark">{t('bank.title')}</h1>
        </div>

        <Card className="p-0 overflow-hidden">
          {/* Toolbar */}
          <div className="p-5 border-b border-[#e8e8e8] flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" size={16} />
              <input 
                type="text" 
                placeholder={t('bank.placeholder_search')} 
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
                onClick={() => {
                  setEditingAccountId(null);
                  setFormBankName('');
                  setFormAccountNumber('');
                  setFormAccountHolder('');
                  setIsAddModalOpen(true);
                }}
              >
                <Plus size={14} /> {t('bank.add')}
              </Button>
            </div>
          </div>

          {/* Table */}
          <DataTable 
            columns={activeColumns} 
            data={filteredRows}
            defaultPageSize={4}
            pageSizeOptions={[4, 8, 12]}
          />
        </Card>
      </main>

      {/* Filter Drawer */}
      <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title={t('bank.filter_title')}>
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-[13px] font-bold text-dark mb-2">{t('bank.name')}</label>
            <select className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors">
              <option value="">{t('bank.all_banks')}</option>
              <option value="chase">Chase Bank</option>
              <option value="boa">Bank of America</option>
              <option value="wells">Wells Fargo</option>
            </select>
          </div>
          
          <div>
            <label className="block text-[13px] font-bold text-dark mb-2">{t('bank.creation_time')}</label>
            <DatePicker />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-dark mb-2">{t('common.status')}</label>
            <select className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors">
              <option value="">{t('bank.all_statuses')}</option>
              <option value="active">{t('bank.active')}</option>
              <option value="inactive">{t('bank.inactive')}</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-dark mb-2">{t('bank.type')}</label>
            <select className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors">
              <option value="">{t('bank.all_types')}</option>
              <option value="personal">{t('bank.personal')}</option>
              <option value="business">{t('bank.business')}</option>
            </select>
          </div>

          <div className="mt-4 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsFilterOpen(false)}>{t('bank.reset')}</Button>
            <Button className="flex-1 rounded-xl" onClick={() => setIsFilterOpen(false)}>{t('bank.apply_filters')}</Button>
          </div>
        </div>
      </Drawer>

      {/* Add/Edit Bank Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={editingAccountId ? t('bank.edit') : t('bank.add')}>
        <form
          className="flex flex-col gap-5"
          onSubmit={async (e) => {
            e.preventDefault();
            dispatch(clearAccountsError());
            try {
              if (editingAccountId) {
                await dispatch(
                  updateAccount({
                    accountId: editingAccountId,
                    bank_name: formBankName,
                    account_number: formAccountNumber,
                    account_holder: formAccountHolder,
                  })
                ).unwrap();
                toast.success('Cập nhật tài khoản ngân hàng thành công');
                setIsAddModalOpen(false);
                setEditingAccountId(null);
                return;
              }

              const result = await dispatch(
                createAccount({
                  bank_name: formBankName,
                  account_number: formAccountNumber,
                  account_holder: formAccountHolder,
                })
              ).unwrap();
              toast.success(('message' in result && result.message) || 'Tài khoản ngân hàng đã được thêm và API token đã được gửi về email của bạn.');
              setIsAddModalOpen(false);
            } catch (err: unknown) {
              toast.error(err instanceof Error ? err.message : 'Không thể lưu tài khoản ngân hàng');
            }
          }}
        >
          <div>
            <label className="block text-[13px] font-bold text-dark mb-2">{t('bank.select')}</label>
            <select 
              className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors" 
              required
              value={formBankName}
              onChange={(e) => setFormBankName(e.target.value)}
            >
              <option value="">{t('bank.select')}...</option>
              {banks.map((b) => (
                <option key={b.id} value={b.code}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
            {banksStatus === 'loading' && (
              <div className="text-[12px] text-gray mt-2">{t('common.loading')}</div>
            )}
          </div>
          
          <div>
            <label className="block text-[13px] font-bold text-dark mb-2">{t('bank.account_no')}</label>
            <input 
              type="text" 
              placeholder={t('bank.account_no')} 
              className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
              required
              value={formAccountNumber}
              onChange={(e) => setFormAccountNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-dark mb-2">{t('auth.full_name')}</label>
            <input 
              type="text" 
              placeholder={t('auth.full_name')}
              className="w-full px-4 py-2.5 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[13px] outline-none focus:border-primary focus:bg-white transition-colors"
              required
              value={formAccountHolder}
              onChange={(e) => setFormAccountHolder(e.target.value)}
            />
          </div>

          <div className="mt-2 flex gap-3">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsAddModalOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit" className="flex-1 rounded-xl" disabled={accountsStatus === 'loading'}>
              {accountsStatus === 'loading' ? t('common.loading') : (editingAccountId ? t('common.save') : t('bank.add'))}
            </Button>
          </div>
        </form>

      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingAccountId(null);
        }} 
        title={t('bank.delete_confirm_title') || 'Delete Bank Account'}
      >
        <div className="flex flex-col gap-5">
          <p className="text-[13px] text-gray">
            {t('bank.delete_confirm_message') || 'Are you sure you want to delete this bank account? This action cannot be undone.'}
          </p>
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 rounded-xl" 
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingAccountId(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              type="button"
              className="flex-1 rounded-xl bg-red-500 hover:bg-red-600" 
              disabled={accountsStatus === 'loading'}
              onClick={async () => {
                if (!deletingAccountId) return;
                dispatch(clearAccountsError());
                try {
                  await dispatch(deleteAccount(deletingAccountId)).unwrap();
                  toast.success('Xóa tài khoản ngân hàng thành công');
                  setIsDeleteModalOpen(false);
                  setDeletingAccountId(null);
                } catch (err: unknown) {
                  toast.error(err instanceof Error ? err.message : 'Không thể xóa tài khoản ngân hàng');
                }
              }}
            >
              {accountsStatus === 'loading' ? t('common.loading') : (t('common.delete') || 'Delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
