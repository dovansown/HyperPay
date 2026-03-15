import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'
import { AdminModal } from '../../components/ui/AdminModal'
import { Switch } from '../../components/ui/Switch'
import { apiFetch, unwrapApiData, type ApiEnvelope } from '../../lib/apiClient'
import { useAppSelector } from '../../store/hooks'

type ListEnvelope<T> = { items: T[]; total: number; limit: number; offset: number }
type UserRole = 'USER' | 'AUTHOR' | 'EDITOR' | 'ADMIN'
type UserItem = { id: string; email: string; full_name?: string | null; role: UserRole }
type PackageBankRow = { bank_id: string; account_limit: number; bank?: { id: string; name: string; code: string } | null }
type PackagePricingRow = { duration_id: string; duration_name?: string; months?: number; days?: number; price_vnd: number }
type PackageItem = {
  id: string
  name: string
  status: string
  is_default?: boolean
  apply_default_discount?: boolean
  price_vnd: number
  duration_days?: number | null
  max_transactions: number
  max_webhook_deliveries: number
  description?: string | null
  banks: PackageBankRow[]
  pricing?: PackagePricingRow[]
}
type DurationItem = { id: string; name: string; months: number; days: number; sort_order: number; is_default?: boolean; discount_percent?: number | null }
type BankItem = { id: string; name: string; code: string; icon_url?: string | null }
type PackageChoice = { id: string; name: string; status: string }
type UserPackageItem = {
  id: string
  user: { id: string; email: string }
  package: { id: string; name: string; status: string }
  status: string
  start_at: string
  end_at: string
}

const toMoney = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v)

type PackageFormState = {
  name: string
  price_vnd: string
  is_default: boolean
  apply_default_discount: boolean
  max_transactions: string
  max_webhook_deliveries: string
  description: string
  status: string
  banks: PackageBankRow[]
  pricing: PackagePricingRow[]
}

const pageOffset = (page: number, limit: number) => (page - 1) * limit

type AdminSection = 'users' | 'packages' | 'durations' | 'banks' | 'user-packages' | 'system-settings'

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

  const [packages, setPackages] = useState<PackageItem[]>([])
  const [packagesTotal, setPackagesTotal] = useState(0)
  const [packagesPage, setPackagesPage] = useState(1)
  const [packagesLimit] = useState(10)
  const [packagesQ, setPackagesQ] = useState('')
  const [openPackageModal, setOpenPackageModal] = useState(false)
  const [packageModalEditId, setPackageModalEditId] = useState<string | null>(null)
  const [packageForm, setPackageForm] = useState<PackageFormState | null>(null)

  const [durations, setDurations] = useState<DurationItem[]>([])
  const [durationsLoading, setDurationsLoading] = useState(false)
  const [durationsError, setDurationsError] = useState<string | null>(null)
  const [openDurationModal, setOpenDurationModal] = useState(false)
  const [durationModalEditId, setDurationModalEditId] = useState<string | null>(null)
  const [durationForm, setDurationForm] = useState<{
    name: string
    months: string
    days: string
    sort_order: string
    is_default: boolean
    discount_percent: string
  } | null>(null)

  const [banks, setBanks] = useState<BankItem[]>([])
  const [banksTotal, setBanksTotal] = useState(0)
  const [banksPage, setBanksPage] = useState(1)
  const [banksLimit] = useState(10)
  const [banksQ, setBanksQ] = useState('')
  const [banksCode, setBanksCode] = useState('')
  const [editingBankId, setEditingBankId] = useState<string | null>(null)
  const [bankDraft, setBankDraft] = useState<{ name: string; code: string; icon_url: string } | null>(null)

  const [userPackages, setUserPackages] = useState<UserPackageItem[]>([])
  const [userPackagesTotal, setUserPackagesTotal] = useState(0)
  const [userPackagesPage, setUserPackagesPage] = useState(1)
  const [userPackagesLimit] = useState(10)
  const [userPackagesQ, setUserPackagesQ] = useState('')
  const [userPackagesStatus, setUserPackagesStatus] = useState('')
  const [statusDraft, setStatusDraft] = useState<Record<string, string>>({})

  const [packagesChoices, setPackagesChoices] = useState<PackageChoice[]>([])
  const [assignUserId, setAssignUserId] = useState('')
  const [assignPackageId, setAssignPackageId] = useState('')
  const [assignDurationId, setAssignDurationId] = useState('')
  const [assignDurationDays, setAssignDurationDays] = useState('30')

  const [newBankName, setNewBankName] = useState('')
  const [newBankCode, setNewBankCode] = useState('')
  const [newBankIconUrl, setNewBankIconUrl] = useState('')
  const [openBankCreateModal, setOpenBankCreateModal] = useState(false)
  const [openAssignPackageModal, setOpenAssignPackageModal] = useState(false)

  const [systemSettings, setSystemSettings] = useState<{
    smtp_config: { host: string; port: number; secure: boolean; user: string; pass: string; fromEmail: string; fromName: string }
    rate_limit: { loginAttempts: number; loginWindowSeconds: number; emailPerUserPerHour: number }
    alert_level: string
    notification_defaults?: { success: boolean; failed: boolean; disputes: boolean; payouts: boolean; team: boolean }
  } | null>(null)
  const [systemSettingsLoading, setSystemSettingsLoading] = useState(false)
  const [systemSettingsSaving, setSystemSettingsSaving] = useState(false)
  const [systemSettingsDraft, setSystemSettingsDraft] = useState<Record<string, unknown>>({})

  const usersTotalPages = useMemo(() => Math.max(1, Math.ceil(usersTotal / usersLimit)), [usersTotal, usersLimit])
  const packagesTotalPages = useMemo(() => Math.max(1, Math.ceil(packagesTotal / packagesLimit)), [packagesTotal, packagesLimit])
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

  const fetchPackages = async () => {
    try {
      const params = new URLSearchParams({
        limit: String(packagesLimit),
        offset: String(pageOffset(packagesPage, packagesLimit)),
      })
      if (packagesQ.trim()) params.set('q', packagesQ.trim())
      const res = await apiFetch<ListEnvelope<PackageItem> | ApiEnvelope<ListEnvelope<PackageItem>>>(`/admin/packages?${params.toString()}`, { token: token ?? undefined })
      const data = unwrapApiData(res)
      setPackages(data.items)
      setPackagesTotal(data.total)
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

  const fetchDurations = async () => {
    setDurationsLoading(true)
    setDurationsError(null)
    try {
      const res = await apiFetch<DurationItem[] | ApiEnvelope<DurationItem[]>>('/admin/durations', {
        token: token ?? undefined,
      })
      setDurations(unwrapApiData(res))
    } catch (e) {
      setDurationsError(e instanceof Error ? e.message : t('admin.durations.errorLoad', 'Failed to load durations'))
    } finally {
      setDurationsLoading(false)
    }
  }

  useEffect(() => {
    void fetchUsers()
  }, [usersPage, usersQ, usersRole])
  useEffect(() => {
    void fetchPackages()
  }, [packagesPage, packagesQ])
  useEffect(() => {
    void fetchBanks()
  }, [banksPage, banksQ, banksCode])
  useEffect(() => {
    void fetchUserPackages()
  }, [userPackagesPage, userPackagesQ, userPackagesStatus])
  useEffect(() => {
    void fetchPackagesChoices()
  }, [])
  useEffect(() => {
    if (section === 'durations' || section === 'packages') void fetchDurations()
  }, [section])

  const fetchSystemSettings = async () => {
    setSystemSettingsLoading(true)
    try {
      const res = await apiFetch<typeof systemSettings>(`/admin/system-settings`, { token: token ?? undefined })
      const data = unwrapApiData(res)
      setSystemSettings(data)
      setSystemSettingsDraft(data ? { ...data } : {})
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.error.load', 'Failed to load'))
    } finally {
      setSystemSettingsLoading(false)
    }
  }
  useEffect(() => {
    if (section === 'system-settings') void fetchSystemSettings()
  }, [section])

  const updateRole = async (userId: string, role: UserRole) => {
    try {
      await apiFetch(`/admin/users/${userId}/role`, { method: 'PATCH', token: token ?? undefined, body: { role } })
      await fetchUsers()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.error.updateRole', 'Failed to update role'))
    }
  }

  const getInitialPackageForm = (): PackageFormState => ({
    name: '',
    price_vnd: '100000',
    is_default: false,
    apply_default_discount: false,
    max_transactions: '1000',
    max_webhook_deliveries: '100',
    description: '',
    status: 'ACTIVE',
    banks: [],
    pricing: durations.map((d) => ({ duration_id: d.id, price_vnd: 0 })),
  })

  const openPackageModalForCreate = () => {
    setPackageForm(getInitialPackageForm())
    setPackageModalEditId(null)
    setOpenPackageModal(true)
  }

  const openPackageModalForEdit = (pkg: PackageItem) => {
    const pricing =
      (pkg.pricing?.length ?? 0) > 0
        ? pkg.pricing!
        : durations.map((d) => ({ duration_id: d.id, price_vnd: 0 }))
    setPackageForm({
      name: pkg.name,
      price_vnd: String(pkg.price_vnd),
      is_default: pkg.is_default ?? false,
      apply_default_discount: pkg.apply_default_discount ?? false,
      max_transactions: String(pkg.max_transactions),
      max_webhook_deliveries: String(pkg.max_webhook_deliveries),
      description: pkg.description ?? '',
      status: pkg.status,
      banks: pkg.banks.map((b) => ({ bank_id: b.bank_id, account_limit: b.account_limit, bank: b.bank })),
      pricing: pricing.length ? pricing : durations.map((d) => ({ duration_id: d.id, price_vnd: 0 })),
    })
    setPackageModalEditId(pkg.id)
    setOpenPackageModal(true)
  }

  const createPackage = async () => {
    if (!packageForm) return
    try {
      await apiFetch('/admin/packages', {
        method: 'POST',
        token: token ?? undefined,
        body: {
          name: packageForm.name.trim(),
          price_vnd: Number(packageForm.price_vnd),
          is_default: packageForm.is_default,
          apply_default_discount: packageForm.apply_default_discount,
          max_transactions: Number(packageForm.max_transactions),
          max_webhook_deliveries: Number(packageForm.max_webhook_deliveries),
          description: packageForm.description.trim() || undefined,
          status: packageForm.status,
          banks: packageForm.banks.map((b) => ({ bank_id: b.bank_id, account_limit: b.account_limit })),
          pricing: durations.map((d) => ({
            duration_id: d.id,
            price_vnd: packageForm.apply_default_discount ? 0 : (packageForm.pricing.find((p) => p.duration_id === d.id)?.price_vnd ?? 0),
          })),
        },
      })
      setOpenPackageModal(false)
      setPackageForm(null)
      setPackageModalEditId(null)
      setPackagesPage(1)
      await fetchPackages()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.error.createPlan', 'Failed to create package'))
    }
  }

  const saveEditPackage = async () => {
    if (!packageForm || packageModalEditId == null) return
    try {
      await apiFetch(`/admin/packages/${packageModalEditId}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: {
          name: packageForm.name.trim(),
          price_vnd: Number(packageForm.price_vnd),
          is_default: packageForm.is_default,
          apply_default_discount: packageForm.apply_default_discount,
          max_transactions: Number(packageForm.max_transactions),
          max_webhook_deliveries: Number(packageForm.max_webhook_deliveries),
          description: packageForm.description.trim() || undefined,
          status: packageForm.status,
          banks: packageForm.banks.map((b) => ({ bank_id: b.bank_id, account_limit: b.account_limit })),
          pricing: durations.map((d) => ({
            duration_id: d.id,
            price_vnd: packageForm.apply_default_discount ? 0 : (packageForm.pricing.find((p) => p.duration_id === d.id)?.price_vnd ?? 0),
          })),
        },
      })
      setOpenPackageModal(false)
      setPackageForm(null)
      setPackageModalEditId(null)
      await fetchPackages()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.error.createPlan', 'Failed to update package'))
    }
  }

  const addPackageFormBankRow = () => {
    if (!packageForm) return
    const used = new Set(packageForm.banks.map((b) => b.bank_id))
    const next = banks.find((b) => !used.has(b.id))
    if (next) setPackageForm((prev) => prev ? { ...prev, banks: [...prev.banks, { bank_id: next.id, account_limit: 1 }] } : prev)
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

  const saveEditBank = async (id: string) => {
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
      const body: { user_id: string; package_id: string; duration_days?: number; duration_id?: string } = {
        user_id: assignUserId,
        package_id: assignPackageId,
      }
      if (assignDurationId) body.duration_id = assignDurationId
      else body.duration_days = Number(assignDurationDays)
      await apiFetch('/admin/user-packages/assign', { method: 'POST', token: token ?? undefined, body })
      setAssignUserId('')
      setAssignPackageId('')
      setAssignDurationId('')
      setAssignDurationDays('30')
      setOpenAssignPackageModal(false)
      setUserPackagesPage(1)
      await fetchUserPackages()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.error.assignPackage', 'Failed to assign package'))
    }
  }

  const getInitialDurationForm = () => ({
    name: '',
    months: '1',
    days: '30',
    sort_order: '0',
    is_default: false,
    discount_percent: '',
  })

  const openDurationModalForCreate = () => {
    setDurationForm(getInitialDurationForm())
    setDurationModalEditId(null)
    setOpenDurationModal(true)
  }

  const openDurationModalForEdit = (d: DurationItem) => {
    setDurationForm({
      name: d.name,
      months: String(d.months),
      days: String(d.days),
      sort_order: String(d.sort_order),
      is_default: d.is_default ?? false,
      discount_percent: d.discount_percent != null ? String(d.discount_percent) : '',
    })
    setDurationModalEditId(d.id)
    setOpenDurationModal(true)
  }

  const createDuration = async () => {
    if (!durationForm) return
    try {
      await apiFetch('/admin/durations', {
        method: 'POST',
        token: token ?? undefined,
        body: {
          name: durationForm.name.trim(),
          months: Number(durationForm.months),
          days: Number(durationForm.days),
          sort_order: Number(durationForm.sort_order),
          is_default: durationForm.is_default,
          discount_percent: durationForm.discount_percent ? Number(durationForm.discount_percent) : null,
        },
      })
      setOpenDurationModal(false)
      setDurationForm(null)
      setDurationModalEditId(null)
      await fetchDurations()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.durations.errorLoad', 'Failed to create duration'))
    }
  }

  const saveEditDuration = async () => {
    if (!durationForm || durationModalEditId == null) return
    try {
      await apiFetch(`/admin/durations/${durationModalEditId}`, {
        method: 'PATCH',
        token: token ?? undefined,
        body: {
          name: durationForm.name.trim(),
          months: Number(durationForm.months),
          days: Number(durationForm.days),
          sort_order: Number(durationForm.sort_order),
          is_default: durationForm.is_default,
          discount_percent: durationForm.discount_percent ? Number(durationForm.discount_percent) : null,
        },
      })
      setOpenDurationModal(false)
      setDurationForm(null)
      setDurationModalEditId(null)
      await fetchDurations()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.durations.errorLoad', 'Failed to update duration'))
    }
  }

  const deleteDuration = async (id: string) => {
    try {
      await apiFetch(`/admin/durations/${id}`, { method: 'DELETE', token: token ?? undefined })
      await fetchDurations()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.durations.errorLoad', 'Failed to delete duration'))
    }
  }

  const updateUserPackageStatus = async (id: string) => {
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

          {show('packages') && (
          <Card>
            <CardHeader className="px-6"><h3 className="font-semibold text-slate-900">{t('admin.packages.title', 'Packages')}</h3></CardHeader>
            <CardBody className="px-6 space-y-3">
              <div className="flex gap-2">
                <Input value={packagesQ} onChange={(e) => { setPackagesQ(e.target.value); setPackagesPage(1) }} placeholder={t('admin.search', 'Search')} className="max-w-xs" />
                <Button onClick={openPackageModalForCreate}>
                  {t('admin.packages.create', 'Create package')}
                </Button>
              </div>
              <div className="space-y-2">
                {packages.map((p) => {
                  const banksSummary = p.banks?.length ? p.banks.map((b) => `${b.bank?.name || b.bank?.code || b.bank_id}: ${b.account_limit}`).join(', ') : '–'
                  return (
                    <div key={p.id} className="rounded border border-slate-200 p-3 text-xs">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <span className="font-semibold">{p.name}</span>
                          <span className="text-slate-500 ml-2">({p.status})</span>
                          <span className="ml-2">· {toMoney(p.price_vnd)}</span>
                          {p.is_default && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1">{t('admin.packages.isDefault', 'Default')}</span>}
                          {p.apply_default_discount && <span className="text-xs text-slate-500 ml-1">{t('admin.packages.applyDefaultDiscount', 'Apply discount')}</span>}
                          {p.pricing?.length ? <span className="ml-2">· {p.pricing.length} {t('admin.packages.pricing', 'pricing')}</span> : p.duration_days != null && <span className="ml-2">· {p.duration_days}d</span>}
                          <span className="ml-2">· {p.max_transactions} tx</span>
                          <span className="ml-2">· {p.max_webhook_deliveries} webhooks</span>
                          <p className="text-slate-600 mt-1">{t('admin.packages.banks', 'Banks')}: {banksSummary}</p>
                        </div>
                        <Button size="sm" variant="secondary" onClick={() => openPackageModalForEdit(p)}>{t('admin.actions.edit', 'Edit')}</Button>
                      </div>
                    </div>
                  )
                })}
              </div>
              <Pagination page={packagesPage} totalPages={packagesTotalPages} onPrev={() => setPackagesPage((p) => p - 1)} onNext={() => setPackagesPage((p) => p + 1)} />
            </CardBody>
          </Card>
          )}

          {show('durations') && (
          <Card>
            <CardHeader className="px-6"><h3 className="font-semibold text-slate-900">{t('admin.durations.title', 'Durations')}</h3></CardHeader>
            <CardBody className="px-6 space-y-3">
              {durationsError && <p className="text-xs text-red-600">{durationsError}</p>}
              <div className="flex justify-end">
                <Button onClick={openDurationModalForCreate}>
                  {t('admin.durations.create', 'Create duration')}
                </Button>
              </div>
              {durationsLoading ? (
                <p className="text-sm text-slate-500">{t('admin.durations.loading', 'Loading durations...')}</p>
              ) : durations.length === 0 ? (
                <p className="text-sm text-slate-500">{t('admin.durations.empty', 'No durations. Create duration options first.')}</p>
              ) : (
                <div className="space-y-2">
                  {durations.map((d) => (
                    <div key={d.id} className="rounded border border-slate-200 p-2 text-xs flex items-center justify-between gap-2">
                      <span className="font-medium">{d.name}</span>
                      <span className="text-slate-500">{d.months} tháng / {d.days} ngày</span>
                      {d.is_default && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{t('admin.durations.default', 'Default')}</span>}
                      {d.discount_percent != null && <span className="text-xs text-slate-500">−{d.discount_percent}%</span>}
                      <div className="flex gap-1">
                        <Button size="sm" variant="secondary" onClick={() => openDurationModalForEdit(d)}>{t('admin.actions.edit', 'Edit')}</Button>
                        <Button size="sm" variant="ghost" onClick={() => void deleteDuration(d.id)}>×</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">{t('admin.banks.name', 'Bank name')}</label>
                            <Input value={bankDraft.name} onChange={(e) => setBankDraft((d) => d ? { ...d, name: e.target.value } : d)} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">{t('admin.banks.code', 'Bank code')}</label>
                            <Input value={bankDraft.code} onChange={(e) => setBankDraft((d) => d ? { ...d, code: e.target.value.toUpperCase() } : d)} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">{t('admin.banks.icon', 'Bank logo URL')}</label>
                            <Input value={bankDraft.icon_url} onChange={(e) => setBankDraft((d) => d ? { ...d, icon_url: e.target.value } : d)} />
                          </div>
                          <div className="flex gap-2 items-end">
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

          {show('system-settings') && (
          <Card>
            <CardHeader className="px-6"><h3 className="font-semibold text-slate-900">{t('admin.systemSettings.title', 'System settings')}</h3></CardHeader>
            <CardBody className="px-6 space-y-4">
              {systemSettingsLoading ? (
                <p className="text-sm text-slate-500">{t('common.loading', 'Loading...')}</p>
              ) : systemSettings ? (
                <>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">{t('admin.systemSettings.rateLimit', 'Rate limits')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-slate-500">{t('admin.systemSettings.loginAttempts', 'Login attempts max')}</label>
                        <Input
                          type="number"
                          min={1}
                          value={String((systemSettingsDraft.rate_limit as { loginAttempts?: number })?.loginAttempts ?? systemSettings.rate_limit.loginAttempts)}
                          onChange={(e) => setSystemSettingsDraft((prev) => ({
                            ...prev,
                            rate_limit: { ...systemSettings.rate_limit, ...(prev.rate_limit as object), loginAttempts: Number(e.target.value) || 5 },
                          }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">{t('admin.systemSettings.loginWindow', 'Login window (seconds)')}</label>
                        <Input
                          type="number"
                          min={60}
                          value={String((systemSettingsDraft.rate_limit as { loginWindowSeconds?: number })?.loginWindowSeconds ?? systemSettings.rate_limit.loginWindowSeconds)}
                          onChange={(e) => setSystemSettingsDraft((prev) => ({
                            ...prev,
                            rate_limit: { ...systemSettings.rate_limit, ...(prev.rate_limit as object), loginWindowSeconds: Number(e.target.value) || 900 },
                          }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">{t('admin.systemSettings.emailPerHour', 'Emails per user/hour')}</label>
                        <Input
                          type="number"
                          min={1}
                          value={String((systemSettingsDraft.rate_limit as { emailPerUserPerHour?: number })?.emailPerUserPerHour ?? systemSettings.rate_limit.emailPerUserPerHour)}
                          onChange={(e) => setSystemSettingsDraft((prev) => ({
                            ...prev,
                            rate_limit: { ...systemSettings.rate_limit, ...(prev.rate_limit as object), emailPerUserPerHour: Number(e.target.value) || 5 },
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">{t('admin.systemSettings.alertLevel', 'New device login')}</h4>
                    <select
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm w-full max-w-xs"
                      value={(systemSettingsDraft.alert_level as string) ?? systemSettings.alert_level}
                      onChange={(e) => setSystemSettingsDraft((prev) => ({ ...prev, alert_level: e.target.value }))}
                    >
                      <option value="require_verify">{t('admin.systemSettings.requireVerify', 'Require email verification')}</option>
                      <option value="warn_only">{t('admin.systemSettings.warnOnly', 'Warn only (no block)')}</option>
                    </select>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">{t('admin.systemSettings.smtp', 'SMTP (email)')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        label={t('admin.systemSettings.smtpHost', 'Host')}
                        value={(systemSettingsDraft.smtp_config as { host?: string })?.host ?? systemSettings.smtp_config.host}
                        onChange={(e) => setSystemSettingsDraft((prev) => ({
                          ...prev,
                          smtp_config: { ...systemSettings.smtp_config, ...(prev.smtp_config as object), host: e.target.value },
                        }))}
                      />
                      <Input
                        label={t('admin.systemSettings.smtpPort', 'Port')}
                        type="number"
                        value={String((systemSettingsDraft.smtp_config as { port?: number })?.port ?? systemSettings.smtp_config.port)}
                        onChange={(e) => setSystemSettingsDraft((prev) => ({
                          ...prev,
                          smtp_config: { ...systemSettings.smtp_config, ...(prev.smtp_config as object), port: Number(e.target.value) || 587 },
                        }))}
                      />
                      <Input
                        label={t('admin.systemSettings.smtpUser', 'User')}
                        value={(systemSettingsDraft.smtp_config as { user?: string })?.user ?? systemSettings.smtp_config.user}
                        onChange={(e) => setSystemSettingsDraft((prev) => ({
                          ...prev,
                          smtp_config: { ...systemSettings.smtp_config, ...(prev.smtp_config as object), user: e.target.value },
                        }))}
                      />
                      <Input
                        label={t('admin.systemSettings.smtpPass', 'Password')}
                        type="password"
                        value={(systemSettingsDraft.smtp_config as { pass?: string })?.pass ?? systemSettings.smtp_config.pass}
                        onChange={(e) => setSystemSettingsDraft((prev) => ({
                          ...prev,
                          smtp_config: { ...systemSettings.smtp_config, ...(prev.smtp_config as object), pass: e.target.value },
                        }))}
                      />
                      <Input
                        label={t('admin.systemSettings.smtpFromEmail', 'From email')}
                        value={(systemSettingsDraft.smtp_config as { fromEmail?: string })?.fromEmail ?? systemSettings.smtp_config.fromEmail}
                        onChange={(e) => setSystemSettingsDraft((prev) => ({
                          ...prev,
                          smtp_config: { ...systemSettings.smtp_config, ...(prev.smtp_config as object), fromEmail: e.target.value },
                        }))}
                      />
                      <Input
                        label={t('admin.systemSettings.smtpFromName', 'From name')}
                        value={(systemSettingsDraft.smtp_config as { fromName?: string })?.fromName ?? systemSettings.smtp_config.fromName}
                        onChange={(e) => setSystemSettingsDraft((prev) => ({
                          ...prev,
                          smtp_config: { ...systemSettings.smtp_config, ...(prev.smtp_config as object), fromName: e.target.value },
                        }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      disabled={systemSettingsSaving}
                      onClick={async () => {
                        setSystemSettingsSaving(true)
                        try {
                          const payload = {
                            smtp_config: systemSettingsDraft.smtp_config ?? systemSettings.smtp_config,
                            rate_limit: systemSettingsDraft.rate_limit ?? systemSettings.rate_limit,
                            alert_level: (systemSettingsDraft.alert_level as string) ?? systemSettings.alert_level,
                          }
                          await apiFetch('/admin/system-settings', { method: 'PUT', token: token ?? undefined, body: payload })
                          await fetchSystemSettings()
                        } catch (e) {
                          setError(e instanceof Error ? e.message : 'Failed to save')
                        } finally {
                          setSystemSettingsSaving(false)
                        }
                      }}
                    >
                      {systemSettingsSaving ? t('admin.actions.saving', 'Saving...') : t('admin.actions.save', 'Save')}
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">{t('admin.systemSettings.loadError', 'Failed to load settings.')}</p>
              )}
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
          open={openPackageModal && packageForm != null}
          title={packageModalEditId != null ? t('admin.modal.editPackage.title', 'Edit package') : t('admin.modal.createPackage.title', 'Create package')}
          subtitle={t('admin.modal.createPackage.subtitle', 'Add banks with account limit for each. Set package-level transaction and webhook limits.')}
          onClose={() => { setOpenPackageModal(false); setPackageForm(null); setPackageModalEditId(null) }}
        >
          {packageForm && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="pkg-name">{t('admin.packages.name', 'Name')}</label>
                  <Input id="pkg-name" value={packageForm.name} onChange={(e) => setPackageForm((prev) => prev ? { ...prev, name: e.target.value } : prev)} placeholder={t('admin.packages.name', 'Name')} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="pkg-price">{t('admin.plans.price', 'Price VND')}</label>
                  <Input id="pkg-price" value={packageForm.price_vnd} onChange={(e) => setPackageForm((prev) => prev ? { ...prev, price_vnd: e.target.value } : prev)} placeholder="100000" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={packageForm.is_default}
                    onChange={(next) => setPackageForm((prev) => prev ? { ...prev, is_default: next } : prev)}
                    label={t('admin.packages.isDefault', 'Default package')}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={packageForm.apply_default_discount}
                    onChange={(next) => setPackageForm((prev) => prev ? { ...prev, apply_default_discount: next } : prev)}
                    label={t('admin.packages.applyDefaultDiscount', 'Apply default discount')}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="pkg-max-tx">{t('admin.plans.maxTx', 'Max transactions')}</label>
                  <Input id="pkg-max-tx" value={packageForm.max_transactions} onChange={(e) => setPackageForm((prev) => prev ? { ...prev, max_transactions: e.target.value } : prev)} placeholder="1000" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="pkg-max-webhooks">{t('admin.packages.maxWebhooks', 'Max webhook deliveries')}</label>
                  <Input id="pkg-max-webhooks" value={packageForm.max_webhook_deliveries} onChange={(e) => setPackageForm((prev) => prev ? { ...prev, max_webhook_deliveries: e.target.value } : prev)} placeholder="100" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="pkg-desc">{t('admin.packages.description', 'Description')}</label>
                  <Input id="pkg-desc" value={packageForm.description} onChange={(e) => setPackageForm((prev) => prev ? { ...prev, description: e.target.value } : prev)} placeholder={t('admin.packages.description', 'Description')} />
                </div>
                {packageModalEditId != null && (
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="pkg-status">{t('admin.packages.status', 'Status')}</label>
                    <select id="pkg-status" className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value={packageForm.status} onChange={(e) => setPackageForm((prev) => prev ? { ...prev, status: e.target.value } : prev)}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <label className="text-sm font-semibold text-slate-700 block mb-2">{t('admin.packages.banks', 'Banks (account limit per bank)')}</label>
                <Table>
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-xs font-semibold text-slate-600 py-2 pr-4">{t('admin.banks.name', 'Bank')}</th>
                      <th className="text-left text-xs font-semibold text-slate-600 py-2 pr-4">{t('admin.packages.accountLimit', 'Account limit')}</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {packageForm.banks.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-2 pr-4">
                          <select
                            aria-label={t('admin.banks.name', 'Bank')}
                            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={row.bank_id}
                            onChange={(e) => setPackageForm((prev) => prev ? { ...prev, banks: prev.banks.map((b, i) => i === idx ? { ...b, bank_id: e.target.value } : b) } : prev)}
                          >
                            {banks.map((bank) => (
                              <option key={bank.id} value={bank.id}>{bank.name} ({bank.code})</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 pr-4">
                          <Input
                            type="number"
                            min={1}
                            className="w-24"
                            aria-label={t('admin.packages.accountLimit', 'Account limit')}
                            value={row.account_limit}
                            onChange={(e) => setPackageForm((prev) => prev ? { ...prev, banks: prev.banks.map((b, i) => i === idx ? { ...b, account_limit: Number(e.target.value) || 1 } : b) } : prev)}
                          />
                        </td>
                        <td className="py-2">
                          <Button size="sm" variant="ghost" onClick={() => setPackageForm((prev) => prev ? { ...prev, banks: prev.banks.filter((_, i) => i !== idx) } : prev)}>×</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Button size="sm" variant="secondary" className="mt-2" onClick={addPackageFormBankRow} disabled={banks.length === 0 || packageForm.banks.length >= banks.length}>
                  {t('admin.packages.addBank', 'Add bank')}
                </Button>
              </div>
              <div className="mt-4">
                <label className="text-sm font-semibold text-slate-700 block mb-2">{t('admin.packages.pricing', 'Price by duration')}</label>
                {packageForm.apply_default_discount ? (
                  <p className="text-xs text-slate-500 mb-2">{t('admin.packages.pricingProportional', 'Price = base × months × (1 − discount%). Shown below.')}</p>
                ) : (
                  <p className="text-xs text-slate-500 mb-2">{t('admin.packages.pricingHint', 'Set price VND for each duration option.')}</p>
                )}
                {durations.length === 0 ? (
                  <p className="text-xs text-amber-600">{t('admin.durations.empty', 'No durations. Create duration options first.')}</p>
                ) : (
                  <Table>
                    <thead>
                      <tr className="border-b border-slate-200">
                        {durations.map((d) => (
                          <th key={d.id} className="text-left text-xs font-semibold text-slate-600 py-2 pr-4 whitespace-nowrap">
                            {d.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {durations.map((d) => {
                          const base = Number(packageForm.price_vnd) || 0
                          const discountFactor = 1 - ((d.discount_percent ?? 0) / 100)
                          const computed = packageForm.apply_default_discount
                            ? Math.round(base * d.months * discountFactor)
                            : null
                          const row = packageForm.pricing.find((p) => p.duration_id === d.id)
                          const value = row?.price_vnd ?? 0
                          return (
                            <td key={d.id} className="py-2 pr-4">
                              {packageForm.apply_default_discount ? (
                                <span className="text-sm font-medium text-slate-700" title={t('admin.packages.priceProportional', 'Base × months × (1 − discount%)')}>
                                  {toMoney(computed ?? 0)}
                                </span>
                              ) : (
                                <Input
                                  type="number"
                                  min={0}
                                  className="w-full min-w-[80px]"
                                  aria-label={d.name}
                                  value={value}
                                  onChange={(e) => {
                                    const v = Number(e.target.value) || 0
                                    setPackageForm((prev) => {
                                      if (!prev) return prev
                                      const rest = prev.pricing.filter((p) => p.duration_id !== d.id)
                                      return { ...prev, pricing: [...rest, { duration_id: d.id, price_vnd: v }] }
                                    })
                                  }}
                                />
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    </tbody>
                  </Table>
                )}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => { setOpenPackageModal(false); setPackageForm(null); setPackageModalEditId(null) }}>
                  {t('admin.modal.actions.cancel', 'Cancel')}
                </Button>
                {packageModalEditId != null ? (
                  <Button onClick={() => void saveEditPackage()} disabled={!packageForm.name.trim() || (!packageForm.apply_default_discount && packageForm.pricing.every((p) => p.price_vnd <= 0))}>
                    {t('admin.actions.save', 'Save')}
                  </Button>
                ) : (
                  <Button onClick={() => void createPackage()} disabled={!packageForm.name.trim() || (!packageForm.apply_default_discount && packageForm.pricing.every((p) => p.price_vnd <= 0))}>
                    {t('admin.modal.actions.create', 'Create')}
                  </Button>
                )}
              </div>
            </>
          )}
        </AdminModal>

        <AdminModal
          open={openBankCreateModal}
          title={t('admin.modal.createBank.title', 'Create bank')}
          subtitle={t('admin.modal.createBank.subtitle', 'Add bank code, name and optional logo URL.')}
          onClose={() => setOpenBankCreateModal(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700" htmlFor="bank-name">{t('admin.banks.name', 'Bank name')}</label>
              <Input id="bank-name" value={newBankName} onChange={(e) => setNewBankName(e.target.value)} placeholder={t('admin.banks.name', 'Bank name')} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700" htmlFor="bank-code">{t('admin.banks.code', 'Bank code')}</label>
              <Input id="bank-code" value={newBankCode} onChange={(e) => setNewBankCode(e.target.value)} placeholder={t('admin.banks.code', 'Bank code')} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="bank-icon">{t('admin.banks.icon', 'Bank logo URL')}</label>
              <Input id="bank-icon" value={newBankIconUrl} onChange={(e) => setNewBankIconUrl(e.target.value)} placeholder={t('admin.banks.icon', 'Bank logo URL')} />
            </div>
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
          open={openDurationModal && durationForm != null}
          title={durationModalEditId != null ? t('admin.durations.edit', 'Edit duration') : t('admin.durations.create', 'Create duration')}
          subtitle={t('admin.durations.title', 'Durations')}
          onClose={() => { setOpenDurationModal(false); setDurationForm(null); setDurationModalEditId(null) }}
        >
          {durationForm && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="dur-name">{t('admin.durations.name', 'Name')}</label>
                  <Input id="dur-name" value={durationForm.name} onChange={(e) => setDurationForm((prev) => prev ? { ...prev, name: e.target.value } : prev)} placeholder="1 tháng" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="dur-months">{t('admin.durations.months', 'Months')}</label>
                  <Input id="dur-months" type="number" min={1} value={durationForm.months} onChange={(e) => setDurationForm((prev) => prev ? { ...prev, months: e.target.value } : prev)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="dur-days">{t('admin.durations.days', 'Days')}</label>
                  <Input id="dur-days" type="number" min={1} value={durationForm.days} onChange={(e) => setDurationForm((prev) => prev ? { ...prev, days: e.target.value } : prev)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="dur-sort">{t('admin.durations.sortOrder', 'Sort order')}</label>
                  <Input id="dur-sort" type="number" min={0} value={durationForm.sort_order} onChange={(e) => setDurationForm((prev) => prev ? { ...prev, sort_order: e.target.value } : prev)} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={durationForm.is_default}
                    onChange={(next) => setDurationForm((prev) => prev ? { ...prev, is_default: next } : prev)}
                    label={t('admin.durations.default', 'Default')}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="dur-discount">{t('admin.durations.discountPercent', 'Discount %')}</label>
                  <Input id="dur-discount" type="number" min={0} max={100} value={durationForm.discount_percent} onChange={(e) => setDurationForm((prev) => prev ? { ...prev, discount_percent: e.target.value } : prev)} placeholder="0-100" />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => { setOpenDurationModal(false); setDurationForm(null); setDurationModalEditId(null) }}>
                  {t('admin.modal.actions.cancel', 'Cancel')}
                </Button>
                {durationModalEditId != null ? (
                  <Button onClick={() => void saveEditDuration()} disabled={!durationForm.name.trim()}>
                    {t('admin.actions.save', 'Save')}
                  </Button>
                ) : (
                  <Button onClick={() => void createDuration()} disabled={!durationForm.name.trim()}>
                    {t('admin.modal.actions.create', 'Create')}
                  </Button>
                )}
              </div>
            </>
          )}
        </AdminModal>

        <AdminModal
          open={openAssignPackageModal}
          title={t('admin.modal.assignPackage.title', 'Assign package')}
          subtitle={t('admin.modal.assignPackage.subtitle', 'Assign a package to a user with selected duration.')}
          onClose={() => setOpenAssignPackageModal(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700" htmlFor="assign-user-id">{t('admin.userPackages.userId', 'User ID')}</label>
              <Input id="assign-user-id" value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)} placeholder={t('admin.userPackages.userId', 'User ID')} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700" htmlFor="assign-package">{t('admin.userPackages.package', 'Package')}</label>
              <select id="assign-package" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={assignPackageId} onChange={(e) => setAssignPackageId(e.target.value)}>
                <option value="">{t('admin.userPackages.choosePackage', 'Choose package')}</option>
                {packagesChoices.map((x) => (<option key={x.id} value={x.id}>{x.name}</option>))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">{t('admin.userPackages.durationOption', 'Duration')}</label>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={assignDurationId} onChange={(e) => setAssignDurationId(e.target.value)}>
                <option value="">{t('admin.userPackages.days', 'Custom (số ngày bên dưới)')}</option>
                {durations.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.days} ngày)</option>
                ))}
              </select>
            </div>
            {!assignDurationId && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('admin.userPackages.days', 'Duration days')}</label>
                <Input type="number" min={1} value={assignDurationDays} onChange={(e) => setAssignDurationDays(e.target.value)} placeholder="30" />
              </div>
            )}
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

