import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'
import { AdminModal } from '../../components/ui/AdminModal'
import { apiFetch, unwrapApiData, type ApiEnvelope } from '../../lib/apiClient'
import { useAppSelector } from '../../store/hooks'

type ListEnvelope<T> = { items: T[]; total: number; limit: number; offset: number }
type UserRole = 'USER' | 'AUTHOR' | 'EDITOR' | 'ADMIN'
type UserItem = { id: number; email: string; full_name?: string | null; role: UserRole }
type PlanItem = { id: number; name: string; price_vnd: number; max_bank_accounts: number; max_transactions: number; duration_days: number }
type BankItem = { id: number; name: string; code: string; icon_url?: string | null }
type PackageChoice = { id: number; name: string; status: string }
type UserPackageItem = {
  id: number
  user: { id: number; email: string }
  package: { id: number; name: string; status: string }
  status: string
  start_at: string
  end_at: string
}

const toMoney = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v)

const pageOffset = (page: number, limit: number) => (page - 1) * limit

type AdminSection = 'users' | 'plans' | 'banks' | 'user-packages'

type SystemAdminPageProps = {
  section?: AdminSection
  embedded?: boolean
}

export const SystemAdminPage: React.FC<SystemAdminPageProps> = ({ section, embedded = false }) => {
  const { t } = useTranslation()
  const token = useAppSelector((s) => s.auth.token)
  const [error, setError] = useState<string | null>(null)

  const [users, setUsers] = useState<UserItem[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersPage, setUsersPage] = useState(1)
  const [usersLimit] = useState(10)
  const [usersQ, setUsersQ] = useState('')
  const [usersRole, setUsersRole] = useState<'' | UserRole>('')

  const [plans, setPlans] = useState<PlanItem[]>([])
  const [plansTotal, setPlansTotal] = useState(0)
  const [plansPage, setPlansPage] = useState(1)
  const [plansLimit] = useState(10)
  const [plansQ, setPlansQ] = useState('')
  const [plansMinPrice, setPlansMinPrice] = useState('')
  const [plansMaxPrice, setPlansMaxPrice] = useState('')
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null)
  const [planDraft, setPlanDraft] = useState<{ name: string; price_vnd: string; max_bank_accounts: string; max_transactions: string; duration_days: string } | null>(null)

  const [banks, setBanks] = useState<BankItem[]>([])
  const [banksTotal, setBanksTotal] = useState(0)
  const [banksPage, setBanksPage] = useState(1)
  const [banksLimit] = useState(10)
  const [banksQ, setBanksQ] = useState('')
  const [banksCode, setBanksCode] = useState('')
  const [editingBankId, setEditingBankId] = useState<number | null>(null)
  const [bankDraft, setBankDraft] = useState<{ name: string; code: string; icon_url: string } | null>(null)

  const [userPackages, setUserPackages] = useState<UserPackageItem[]>([])
  const [userPackagesTotal, setUserPackagesTotal] = useState(0)
  const [userPackagesPage, setUserPackagesPage] = useState(1)
  const [userPackagesLimit] = useState(10)
  const [userPackagesQ, setUserPackagesQ] = useState('')
  const [userPackagesStatus, setUserPackagesStatus] = useState('')
  const [statusDraft, setStatusDraft] = useState<Record<number, string>>({})

  const [packagesChoices, setPackagesChoices] = useState<PackageChoice[]>([])
  const [assignUserId, setAssignUserId] = useState('')
  const [assignPackageId, setAssignPackageId] = useState('')
  const [assignDurationDays, setAssignDurationDays] = useState('30')

  const [newPlanName, setNewPlanName] = useState('')
  const [newPlanPrice, setNewPlanPrice] = useState('100000')
  const [newPlanMaxBanks, setNewPlanMaxBanks] = useState('3')
  const [newPlanMaxTx, setNewPlanMaxTx] = useState('500')
  const [newPlanDays, setNewPlanDays] = useState('30')
  const [openPlanCreateModal, setOpenPlanCreateModal] = useState(false)
  const [newBankName, setNewBankName] = useState('')
  const [newBankCode, setNewBankCode] = useState('')
  const [newBankIconUrl, setNewBankIconUrl] = useState('')
  const [openBankCreateModal, setOpenBankCreateModal] = useState(false)
  const [openAssignPackageModal, setOpenAssignPackageModal] = useState(false)

  const usersTotalPages = useMemo(() => Math.max(1, Math.ceil(usersTotal / usersLimit)), [usersTotal, usersLimit])
  const plansTotalPages = useMemo(() => Math.max(1, Math.ceil(plansTotal / plansLimit)), [plansTotal, plansLimit])
  const banksTotalPages = useMemo(() => Math.max(1, Math.ceil(banksTotal / banksLimit)), [banksTotal, banksLimit])
  const userPackagesTotalPages = useMemo(
    () => Math.max(1, Math.ceil(userPackagesTotal / userPackagesLimit)),
    [userPackagesLimit, userPackagesTotal],
  )

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        limit: String(usersLimit),
        offset: String(pageOffset(usersPage, usersLimit)),
      })
      if (usersQ.trim()) params.set('q', usersQ.trim())
      if (usersRole) params.set('role', usersRole)
      const res = await apiFetch<ListEnvelope<UserItem> | ApiEnvelope<ListEnvelope<UserItem>>>(`/admin/users?${params.toString()}`, { token: token ?? undefined })
      const data = unwrapApiData(res)
      setUsers(data.items)
      setUsersTotal(data.total)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.error.load', 'Failed to load admin data'))
    }
  }

  const fetchPlans = async () => {
    try {
      const params = new URLSearchParams({
        limit: String(plansLimit),
        offset: String(pageOffset(plansPage, plansLimit)),
      })
      if (plansQ.trim()) params.set('q', plansQ.trim())
      if (plansMinPrice) params.set('min_price_vnd', plansMinPrice)
      if (plansMaxPrice) params.set('max_price_vnd', plansMaxPrice)
      const res = await apiFetch<ListEnvelope<PlanItem> | ApiEnvelope<ListEnvelope<PlanItem>>>(`/admin/plans?${params.toString()}`, { token: token ?? undefined })
      const data = unwrapApiData(res)
      setPlans(data.items)
      setPlansTotal(data.total)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.error.load', 'Failed to load admin data'))
    }
  }

  const fetchBanks = async () => {
    try {
      const params = new URLSearchParams({
        limit: String(banksLimit),
        offset: String(pageOffset(banksPage, banksLimit)),
      })
      if (banksQ.trim()) params.set('q', banksQ.trim())
      if (banksCode.trim()) params.set('code', banksCode.trim())
      const res = await apiFetch<ListEnvelope<BankItem> | ApiEnvelope<ListEnvelope<BankItem>>>(`/admin/banks?${params.toString()}`, { token: token ?? undefined })
      const data = unwrapApiData(res)
      setBanks(data.items)
      setBanksTotal(data.total)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.error.load', 'Failed to load admin data'))
    }
  }

  const fetchUserPackages = async () => {
    try {
      const params = new URLSearchParams({
        limit: String(userPackagesLimit),
        offset: String(pageOffset(userPackagesPage, userPackagesLimit)),
      })
      if (userPackagesQ.trim()) params.set('q', userPackagesQ.trim())
      if (userPackagesStatus.trim()) params.set('status', userPackagesStatus.trim())
      const res = await apiFetch<ListEnvelope<UserPackageItem> | ApiEnvelope<ListEnvelope<UserPackageItem>>>(`/admin/user-packages?${params.toString()}`, { token: token ?? undefined })
      const data = unwrapApiData(res)
      setUserPackages(data.items)
      setUserPackagesTotal(data.total)
      setStatusDraft((prev) => {
        const next = { ...prev }
        data.items.forEach((x) => {
          if (next[x.id] == null) next[x.id] = x.status
        })
        return next
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.error.load', 'Failed to load admin data'))
    }
  }

  const fetchPackagesChoices = async () => {
    try {
      const pkg = await apiFetch<Array<PackageChoice> | ApiEnvelope<Array<PackageChoice>>>('/packages', {
        token: token ?? undefined,
      })
      setPackagesChoices(unwrapApiData(pkg))
    } catch {
      // keep silent; assign UI remains usable after refresh later
    }
  }

  useEffect(() => {
    void fetchUsers()
  }, [usersPage, usersQ, usersRole])
  useEffect(() => {
    void fetchPlans()
  }, [plansPage, plansQ, plansMinPrice, plansMaxPrice])
  useEffect(() => {
    void fetchBanks()
  }, [banksPage, banksQ, banksCode])
  useEffect(() => {
    void fetchUserPackages()
  }, [userPackagesPage, userPackagesQ, userPackagesStatus])
  useEffect(() => {
    void fetchPackagesChoices()
  }, [])

  const updateRole = async (userId: number, role: UserRole) => {
    try {
      await apiFetch(`/admin/users/${userId}/role`, { method: 'PATCH', token: token ?? undefined, body: { role } })
      await fetchUsers()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.error.updateRole', 'Failed to update role'))
    }
  }

  const createPlan = async () => {
    try {
      await apiFetch('/admin/plans', {
        method: 'POST',
        token: token ?? undefined,
        body: {
          name: newPlanName,
          price_vnd: Number(newPlanPrice),
          max_bank_accounts: Number(newPlanMaxBanks),
          max_transactions: Number(newPlanMaxTx),
          duration_days: Number(newPlanDays),
        },
      })
      setNewPlanName('')
      setNewPlanPrice('100000')
      setNewPlanMaxBanks('3')
      setNewPlanMaxTx('500')
      setNewPlanDays('30')
      setOpenPlanCreateModal(false)
      setPlansPage(1)
      await fetchPlans()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.error.createPlan', 'Failed to create plan'))
    }
  }

  const startEditPlan = (plan: PlanItem) => {
    setEditingPlanId(plan.id)
    setPlanDraft({
      name: plan.name,
      price_vnd: String(plan.price_vnd),
      max_bank_accounts: String(plan.max_bank_accounts),
      max_transactions: String(plan.max_transactions),
      duration_days: String(plan.duration_days),
    })
  }

  const saveEditPlan = async (id: number) => {
    if (!planDraft) return
    try {
      await apiFetch(`/admin/plans/${id}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: {
          name: planDraft.name,
          price_vnd: Number(planDraft.price_vnd),
          max_bank_accounts: Number(planDraft.max_bank_accounts),
          max_transactions: Number(planDraft.max_transactions),
          duration_days: Number(planDraft.duration_days),
        },
      })
      setEditingPlanId(null)
      setPlanDraft(null)
      await fetchPlans()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.error.createPlan', 'Failed to create plan'))
    }
  }

  const createBank = async () => {
    try {
      await apiFetch('/admin/banks', {
        method: 'POST',
        token: token ?? undefined,
        body: {
          name: newBankName,
          code: newBankCode,
          icon_url: newBankIconUrl || undefined,
        },
      })
      setNewBankName('')
      setNewBankCode('')
      setNewBankIconUrl('')
      setOpenBankCreateModal(false)
      setBanksPage(1)
      await fetchBanks()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.error.createBank', 'Failed to create bank'))
    }
  }

  const startEditBank = (bank: BankItem) => {
    setEditingBankId(bank.id)
    setBankDraft({ name: bank.name, code: bank.code, icon_url: bank.icon_url ?? '' })
  }

  const saveEditBank = async (id: number) => {
    if (!bankDraft) return
    try {
      await apiFetch(`/admin/banks/${id}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: {
          ...bankDraft,
          icon_url: bankDraft.icon_url || null,
        },
      })
      setEditingBankId(null)
      setBankDraft(null)
      await fetchBanks()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.error.createBank', 'Failed to create bank'))
    }
  }

  const assignPackage = async () => {
    try {
      await apiFetch('/admin/user-packages/assign', {
        method: 'POST',
        token: token ?? undefined,
        body: { user_id: Number(assignUserId), package_id: Number(assignPackageId), duration_days: Number(assignDurationDays) },
      })
      setAssignUserId('')
      setAssignPackageId('')
      setAssignDurationDays('30')
      setOpenAssignPackageModal(false)
      setUserPackagesPage(1)
      await fetchUserPackages()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.error.assignPackage', 'Failed to assign package'))
    }
  }

  const updateUserPackageStatus = async (id: number) => {
    try {
      await apiFetch(`/admin/user-packages/${id}/status`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: { status: statusDraft[id] ?? 'active' },
      })
      await fetchUserPackages()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.error.assignPackage', 'Failed to assign package'))
    }
  }

  const Pagination = ({ page, totalPages, onPrev, onNext }: { page: number; totalPages: number; onPrev: () => void; onNext: () => void }) => (
    <div className="flex items-center justify-end gap-2 text-xs">
      <Button size="sm" variant="ghost" disabled={page <= 1} onClick={onPrev}>{t('admin.pagination.prev', 'Prev')}</Button>
      <span>{page}/{totalPages}</span>
      <Button size="sm" variant="ghost" disabled={page >= totalPages} onClick={onNext}>{t('admin.pagination.next', 'Next')}</Button>
    </div>
  )

  const show = (name: AdminSection) => !section || section === name

  const content = (
    <section className={[embedded ? 'w-full' : 'max-w-7xl mx-auto', 'space-y-6'].join(' ')}>
        <div>
          <h1 className="text-3xl font-black text-slate-900">{t('admin.title', 'System Admin')}</h1>
          <p className="text-sm text-slate-500">
            {t('admin.subtitle', 'Manage users, plans, user packages, banks, webhooks and transactions across the system.')}
          </p>
        </div>

        {error && <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</div>}

        <div className={['grid gap-6', section ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'].join(' ')}>
          {show('users') && (
          <Card>
            <CardHeader className="px-6"><h3 className="font-semibold text-slate-900">{t('admin.users.title', 'Users')}</h3></CardHeader>
            <CardBody className="px-6 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input value={usersQ} onChange={(e) => { setUsersQ(e.target.value); setUsersPage(1) }} placeholder={t('admin.search', 'Search email/code/description')} />
                <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={usersRole} onChange={(e) => { setUsersRole(e.target.value as '' | UserRole); setUsersPage(1) }}>
                  <option value="">{t('admin.filters.allRoles', 'All roles')}</option>
                  <option value="USER">USER</option><option value="AUTHOR">AUTHOR</option><option value="EDITOR">EDITOR</option><option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <Table>
                <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="px-4 py-2 text-xs">{t('admin.users.email', 'Email')}</th><th className="px-4 py-2 text-xs">{t('admin.users.name', 'Name')}</th><th className="px-4 py-2 text-xs">{t('admin.users.role', 'Role')}</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100">
                      <td className="px-4 py-2 text-xs">{u.email}</td>
                      <td className="px-4 py-2 text-xs">{u.full_name || '-'}</td>
                      <td className="px-4 py-2">
                        <select className="rounded border border-slate-200 px-2 py-1 text-xs" value={u.role} onChange={(e) => void updateRole(u.id, e.target.value as UserRole)}>
                          <option value="USER">USER</option><option value="AUTHOR">AUTHOR</option><option value="EDITOR">EDITOR</option><option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination page={usersPage} totalPages={usersTotalPages} onPrev={() => setUsersPage((p) => p - 1)} onNext={() => setUsersPage((p) => p + 1)} />
            </CardBody>
          </Card>
          )}

          {show('plans') && (
          <Card>
            <CardHeader className="px-6"><h3 className="font-semibold text-slate-900">{t('admin.plans.title', 'Plans')}</h3></CardHeader>
            <CardBody className="px-6 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input value={plansQ} onChange={(e) => { setPlansQ(e.target.value); setPlansPage(1) }} placeholder={t('admin.search', 'Search email/code/description')} />
                <Input value={plansMinPrice} onChange={(e) => { setPlansMinPrice(e.target.value); setPlansPage(1) }} placeholder={t('admin.filters.minPrice', 'Min price VND')} />
                <Input value={plansMaxPrice} onChange={(e) => { setPlansMaxPrice(e.target.value); setPlansPage(1) }} placeholder={t('admin.filters.maxPrice', 'Max price VND')} />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setOpenPlanCreateModal(true)}>
                  {t('admin.plans.create', 'Create plan')}
                </Button>
              </div>
              <div className="space-y-2">
                {plans.map((p) => {
                  const editing = editingPlanId === p.id
                  return (
                    <div key={p.id} className="rounded border border-slate-200 p-2 text-xs">
                      {editing && planDraft ? (
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                          <Input value={planDraft.name} onChange={(e) => setPlanDraft((d) => d ? { ...d, name: e.target.value } : d)} />
                          <Input value={planDraft.price_vnd} onChange={(e) => setPlanDraft((d) => d ? { ...d, price_vnd: e.target.value } : d)} />
                          <Input value={planDraft.max_bank_accounts} onChange={(e) => setPlanDraft((d) => d ? { ...d, max_bank_accounts: e.target.value } : d)} />
                          <Input value={planDraft.max_transactions} onChange={(e) => setPlanDraft((d) => d ? { ...d, max_transactions: e.target.value } : d)} />
                          <Input value={planDraft.duration_days} onChange={(e) => setPlanDraft((d) => d ? { ...d, duration_days: e.target.value } : d)} />
                          <div className="flex gap-2 items-center">
                            <Button size="sm" onClick={() => void saveEditPlan(p.id)}>{t('admin.actions.save', 'Save')}</Button>
                            <Button size="sm" variant="ghost" onClick={() => { setEditingPlanId(null); setPlanDraft(null) }}>{t('admin.actions.cancel', 'Cancel')}</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div><span className="font-semibold">{p.name}</span> - {toMoney(p.price_vnd)} - {p.max_bank_accounts} banks - {p.max_transactions} tx - {p.duration_days}d</div>
                          <Button size="sm" variant="secondary" onClick={() => startEditPlan(p)}>{t('admin.actions.edit', 'Edit')}</Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <Pagination page={plansPage} totalPages={plansTotalPages} onPrev={() => setPlansPage((p) => p - 1)} onNext={() => setPlansPage((p) => p + 1)} />
            </CardBody>
          </Card>
          )}

          {show('banks') && (
          <Card>
            <CardHeader className="px-6"><h3 className="font-semibold text-slate-900">{t('admin.banks.title', 'Banks')}</h3></CardHeader>
            <CardBody className="px-6 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input value={banksQ} onChange={(e) => { setBanksQ(e.target.value); setBanksPage(1) }} placeholder={t('admin.search', 'Search email/code/description')} />
                <Input value={banksCode} onChange={(e) => { setBanksCode(e.target.value); setBanksPage(1) }} placeholder={t('admin.filters.bankCode', 'Filter by bank code')} />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setOpenBankCreateModal(true)}>
                  {t('admin.banks.create', 'Create bank')}
                </Button>
              </div>
              <div className="space-y-2">
                {banks.map((b) => {
                  const editing = editingBankId === b.id
                  return (
                    <div key={b.id} className="rounded border border-slate-200 p-2 text-xs">
                      {editing && bankDraft ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <Input value={bankDraft.name} onChange={(e) => setBankDraft((d) => d ? { ...d, name: e.target.value } : d)} />
                          <Input value={bankDraft.code} onChange={(e) => setBankDraft((d) => d ? { ...d, code: e.target.value.toUpperCase() } : d)} />
                          <Input value={bankDraft.icon_url} onChange={(e) => setBankDraft((d) => d ? { ...d, icon_url: e.target.value } : d)} />
                          <div className="flex gap-2 items-center">
                            <Button size="sm" onClick={() => void saveEditBank(b.id)}>{t('admin.actions.save', 'Save')}</Button>
                            <Button size="sm" variant="ghost" onClick={() => { setEditingBankId(null); setBankDraft(null) }}>{t('admin.actions.cancel', 'Cancel')}</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            {b.icon_url ? (
                              <img src={b.icon_url} alt={b.name} className="h-6 w-6 rounded object-contain border border-slate-200 bg-white" />
                            ) : (
                              <div className="h-6 w-6 rounded border border-dashed border-slate-300" />
                            )}
                            <div><span className="font-semibold">{b.code}</span> - {b.name}</div>
                          </div>
                          <Button size="sm" variant="secondary" onClick={() => startEditBank(b)}>{t('admin.actions.edit', 'Edit')}</Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <Pagination page={banksPage} totalPages={banksTotalPages} onPrev={() => setBanksPage((p) => p - 1)} onNext={() => setBanksPage((p) => p + 1)} />
            </CardBody>
          </Card>
          )}

          {show('user-packages') && (
          <Card>
            <CardHeader className="px-6"><h3 className="font-semibold text-slate-900">{t('admin.userPackages.title', 'User Packages')}</h3></CardHeader>
            <CardBody className="px-6 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input value={userPackagesQ} onChange={(e) => { setUserPackagesQ(e.target.value); setUserPackagesPage(1) }} placeholder={t('admin.search', 'Search email/code/description')} />
                <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={userPackagesStatus} onChange={(e) => { setUserPackagesStatus(e.target.value); setUserPackagesPage(1) }}>
                  <option value="">{t('admin.filters.allStatus', 'All status')}</option>
                  <option value="active">active</option>
                  <option value="suspended">suspended</option>
                  <option value="expired">expired</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setOpenAssignPackageModal(true)}>
                  {t('admin.userPackages.assign', 'Assign package')}
                </Button>
              </div>
              <Table>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-2 py-2 text-xs">{t('admin.users.email', 'Email')}</th>
                    <th className="px-2 py-2 text-xs">{t('admin.userPackages.package', 'Package')}</th>
                    <th className="px-2 py-2 text-xs">{t('admin.users.role', 'Role')}</th>
                    <th className="px-2 py-2 text-xs">{t('admin.table.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {userPackages.map((up) => (
                    <tr key={up.id} className="border-b border-slate-100">
                      <td className="px-2 py-2 text-xs">{up.user.email}</td>
                      <td className="px-2 py-2 text-xs">{up.package.name}</td>
                      <td className="px-2 py-2 text-xs">
                        <select className="rounded border border-slate-200 px-2 py-1 text-xs" value={statusDraft[up.id] ?? up.status} onChange={(e) => setStatusDraft((prev) => ({ ...prev, [up.id]: e.target.value }))}>
                          <option value="active">active</option><option value="suspended">suspended</option><option value="expired">expired</option><option value="cancelled">cancelled</option>
                        </select>
                      </td>
                      <td className="px-2 py-2 text-xs">
                        <Button size="sm" variant="secondary" onClick={() => void updateUserPackageStatus(up.id)}>{t('admin.actions.updateStatus', 'Update status')}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination page={userPackagesPage} totalPages={userPackagesTotalPages} onPrev={() => setUserPackagesPage((p) => p - 1)} onNext={() => setUserPackagesPage((p) => p + 1)} />
            </CardBody>
          </Card>
          )}
        </div>

        <AdminModal
          open={openPlanCreateModal}
          title={t('admin.modal.createPlan.title', 'Create plan')}
          subtitle={t('admin.modal.createPlan.subtitle', 'Configure limits and duration for a new plan.')}
          onClose={() => setOpenPlanCreateModal(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} placeholder={t('admin.plans.name', 'Plan name')} />
            <Input value={newPlanPrice} onChange={(e) => setNewPlanPrice(e.target.value)} placeholder={t('admin.plans.price', 'Price VND')} />
            <Input value={newPlanMaxBanks} onChange={(e) => setNewPlanMaxBanks(e.target.value)} placeholder={t('admin.plans.maxBanks', 'Max bank accounts')} />
            <Input value={newPlanMaxTx} onChange={(e) => setNewPlanMaxTx(e.target.value)} placeholder={t('admin.plans.maxTx', 'Max transactions')} />
            <Input value={newPlanDays} onChange={(e) => setNewPlanDays(e.target.value)} placeholder={t('admin.plans.days', 'Duration days')} />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpenPlanCreateModal(false)}>
              {t('admin.modal.actions.cancel', 'Cancel')}
            </Button>
            <Button onClick={() => void createPlan()} disabled={!newPlanName.trim()}>
              {t('admin.modal.actions.create', 'Create')}
            </Button>
          </div>
        </AdminModal>

        <AdminModal
          open={openBankCreateModal}
          title={t('admin.modal.createBank.title', 'Create bank')}
          subtitle={t('admin.modal.createBank.subtitle', 'Add bank code, name and optional logo URL.')}
          onClose={() => setOpenBankCreateModal(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input value={newBankName} onChange={(e) => setNewBankName(e.target.value)} placeholder={t('admin.banks.name', 'Bank name')} />
            <Input value={newBankCode} onChange={(e) => setNewBankCode(e.target.value)} placeholder={t('admin.banks.code', 'Bank code')} />
            <Input value={newBankIconUrl} onChange={(e) => setNewBankIconUrl(e.target.value)} placeholder={t('admin.banks.icon', 'Bank logo URL')} />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpenBankCreateModal(false)}>
              {t('admin.modal.actions.cancel', 'Cancel')}
            </Button>
            <Button onClick={() => void createBank()} disabled={!newBankName.trim() || !newBankCode.trim()}>
              {t('admin.modal.actions.create', 'Create')}
            </Button>
          </div>
        </AdminModal>

        <AdminModal
          open={openAssignPackageModal}
          title={t('admin.modal.assignPackage.title', 'Assign package')}
          subtitle={t('admin.modal.assignPackage.subtitle', 'Assign a package to a user with selected duration.')}
          onClose={() => setOpenAssignPackageModal(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)} placeholder={t('admin.userPackages.userId', 'User ID')} />
            <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={assignPackageId} onChange={(e) => setAssignPackageId(e.target.value)}>
              <option value="">{t('admin.userPackages.choosePackage', 'Choose package')}</option>
              {packagesChoices.map((x) => (<option key={x.id} value={x.id}>{x.name}</option>))}
            </select>
            <Input value={assignDurationDays} onChange={(e) => setAssignDurationDays(e.target.value)} placeholder={t('admin.userPackages.days', 'Duration days')} />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpenAssignPackageModal(false)}>
              {t('admin.modal.actions.cancel', 'Cancel')}
            </Button>
            <Button onClick={() => void assignPackage()} disabled={!assignUserId.trim() || !assignPackageId.trim()}>
              {t('admin.modal.actions.assign', 'Assign')}
            </Button>
          </div>
        </AdminModal>
      </section>
  )

  if (embedded) return content
  return <AuthenticatedLayout>{content}</AuthenticatedLayout>
}

