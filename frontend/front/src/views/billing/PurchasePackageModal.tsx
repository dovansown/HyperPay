import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { purchasePackage } from '../../store/billingSlice'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import type { PackageItem, PackagePricingItem } from '../../store/billingSlice'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

type PurchasePackageModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export const PurchasePackageModal: React.FC<PurchasePackageModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { packages, balanceVnd, purchaseStatus } = useAppSelector((s) => s.billing)
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null)
  const [selectedPricing, setSelectedPricing] = useState<PackagePricingItem | null>(null)

  const activePackages = packages.filter((p) => p.status === 'ACTIVE')
  const pricingOptions = selectedPackage?.pricing ?? []

  const prevOpen = useRef(false)
  useEffect(() => {
    if (!open) {
      setSelectedPackage(null)
      setSelectedPricing(null)
      prevOpen.current = false
      return
    }
    if (open && !prevOpen.current && activePackages.length > 0) {
      const defaultPkg = activePackages.find((p) => p.is_default) ?? activePackages[0]
      setSelectedPackage(defaultPkg)
      const defaultPricing =
        defaultPkg.pricing?.find((p) => p.is_default) ?? defaultPkg.pricing?.[0] ?? null
      setSelectedPricing(defaultPricing)
    }
    prevOpen.current = open
  }, [open, activePackages])

  const totalPrice = selectedPricing?.price_vnd ?? 0
  const totalPeriod = selectedPricing?.duration_name ?? ''
  const canAfford = balanceVnd >= totalPrice
  const canSubmit =
    selectedPackage &&
    selectedPricing &&
    canAfford &&
    purchaseStatus !== 'loading'

  const handlePackageSelect = (pkg: PackageItem) => {
    setSelectedPackage(pkg)
    const defaultPricing = pkg.pricing?.find((p) => p.is_default) ?? pkg.pricing?.[0] ?? null
    setSelectedPricing(defaultPricing)
  }

  const handlePurchase = () => {
    if (!selectedPackage || !selectedPricing || !canSubmit) return
    void dispatch(
      purchasePackage({ packageId: selectedPackage.id, durationId: selectedPricing.duration_id }),
    ).then(() => {
      onSuccess()
      onClose()
    })
  }

  const totalBankAccounts =
    selectedPackage?.banks?.reduce((sum, b) => sum + b.account_limit, 0) ?? 0

  const modalIcon = (
    <span className="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
  )

  return (
    <Modal
      open={open}
      title={t('billing.modal.upgradeTitle', 'Nâng cấp tài khoản')}
      subtitle={t('billing.modal.upgradeSubtitle', 'Chọn gói dịch vụ phù hợp với nhu cầu kinh doanh của bạn')}
      icon={modalIcon}
      onClose={onClose}
      size="large"
      bodyScroll={false}
      footer={
        <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
          <div>
            <p className="text-[11px] font-bold text-[#697386] dark:text-slate-400 uppercase tracking-wider mb-1">
              {t('billing.modal.totalPayment', 'Tổng thanh toán')}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#1a1f36] dark:text-slate-100">
                {formatCurrency(totalPrice)}
              </span>
              {totalPeriod && (
                <span className="text-xs text-[#697386] dark:text-slate-400">
                  {t('billing.modal.perPeriod', '/ {{period}}', { period: totalPeriod })}
                </span>
              )}
            </div>
            {!canAfford && selectedPricing && (
              <p className="text-xs text-amber-600 mt-1">
                {t('billing.balance.insufficient', 'Số dư không đủ. Vui lòng nạp thêm để mua gói.')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <p className="text-xs text-[#697386] dark:text-slate-400 hidden sm:block">
              {t('billing.modal.securePayment', 'Thanh toán an toàn qua cổng HyperPay')}
            </p>
            <Button
              disabled={!canSubmit}
              loading={purchaseStatus === 'loading'}
              onClick={handlePurchase}
              className="px-8 py-3 bg-primary hover:bg-[#5851f2] text-white font-bold rounded-lg shadow-[0_2px_4px_rgba(45,35,66,0.4),0_7px_13px_-3px_rgba(45,35,66,0.3)] flex items-center justify-center gap-2 active:shadow-inner"
            >
              {t('billing.modal.payNow', 'Thanh toán ngay')}
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-1 min-h-0">
        {/* Sidebar: Gói dịch vụ */}
        <aside className="w-1/3 border-r border-[#e6ebf1] dark:border-slate-800 bg-[#f6f9fc] dark:bg-slate-900/50 p-6 overflow-y-auto min-w-0">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#697386] dark:text-slate-400 mb-4">
            {t('billing.modal.planService', 'Gói dịch vụ')}
          </h3>
          {activePackages.length === 0 ? (
            <p className="text-xs text-[#697386] dark:text-slate-400 py-2">
              {t('billing.packages.empty', 'Chưa có gói nào.')}
            </p>
          ) : (
            <div className="space-y-3">
              {activePackages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id
                const firstPrice = pkg.pricing?.[0]
                return (
                  <label key={pkg.id} className="relative block cursor-pointer group">
                    <input
                      type="radio"
                      name="plan"
                      checked={isSelected}
                      onChange={() => handlePackageSelect(pkg)}
                      className="peer sr-only"
                    />
                    <div
                      className={`p-4 rounded-xl bg-white dark:bg-slate-800/50 shadow-sm transition-all border ${
                        isSelected
                          ? 'border-2 border-primary ring-4 ring-primary/10'
                          : 'border-[#e6ebf1] dark:border-slate-700 hover:border-[#c1c9d2] dark:hover:border-slate-600 peer-checked:border-primary peer-checked:ring-4 peer-checked:ring-primary/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-[#1a1f36] dark:text-slate-100">
                          {pkg.name}
                        </span>
                        <span className="text-xs font-bold text-primary">
                          {firstPrice
                            ? formatCurrency(firstPrice.price_vnd)
                            : formatCurrency(pkg.price_vnd)}
                        </span>
                      </div>
                      <p className="text-xs text-[#697386] dark:text-slate-400 line-clamp-2">
                        {pkg.description || t('billing.packages.noDescription', 'Không có mô tả')}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </aside>

        {/* Main: Chi tiết gói + Smart Limits + Tính năng + Thời hạn */}
        <main className="flex-1 overflow-y-auto p-8 bg-white dark:bg-transparent min-w-0">
          <div className="max-w-xl mx-auto">
            {!selectedPackage ? (
              <p className="text-[#697386] dark:text-slate-400">
                {t('billing.modal.selectPackage', 'Chọn gói')} ở cột bên trái.
              </p>
            ) : (
              <>
                {/* Tên gói + badge Đang chọn */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold text-[#1a1f36] dark:text-slate-100">
                      {selectedPackage.name}
                    </h3>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {t('billing.modal.selectedBadge', 'Đang chọn')}
                    </span>
                  </div>
                  <p className="text-[#697386] dark:text-slate-400">
                    {selectedPackage.description ||
                      t('billing.packages.noDescription', 'Không có mô tả')}
                  </p>
                </div>

                {/* Thời hạn thanh toán (đẩy lên trên Smart Limits) */}
                <section className="mb-10">
                  <h4 className="text-sm font-bold text-[#1a1f36] dark:text-slate-100 uppercase tracking-wide mb-4">
                    {t('billing.modal.duration', 'Thời hạn thanh toán')}
                  </h4>
                  {pricingOptions.length === 0 ? (
                    <p className="text-sm text-amber-600 py-2">
                      {t('billing.modal.noPricing', 'Gói này chưa có tùy chọn thời hạn. Vui lòng liên hệ hỗ trợ.')}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {pricingOptions.map((opt) => {
                        const isSelected = selectedPricing?.duration_id === opt.duration_id
                        const showDiscount =
                          selectedPackage.apply_default_discount &&
                          opt.discount_percent != null &&
                          opt.discount_percent > 0
                        return (
                          <label key={opt.duration_id} className="cursor-pointer group">
                            <input
                              type="radio"
                              name="duration"
                              checked={isSelected}
                              onChange={() => setSelectedPricing(opt)}
                              className="peer sr-only"
                            />
                            <div
                              className={`p-3 border rounded-lg text-center transition-all relative ${
                                isSelected
                                  ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                                  : 'border-[#e6ebf1] dark:border-slate-700 hover:border-[#c1c9d2] dark:hover:border-slate-600 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-2 peer-checked:ring-primary/10'
                              }`}
                            >
                              {showDiscount && (
                                <div className="absolute -top-2 -right-1 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                  {t('billing.modal.discountPercent', 'GIẢM {{percent}}%', {
                                    percent: opt.discount_percent,
                                  })}
                                </div>
                              )}
                              <p className="text-sm font-bold text-[#1a1f36] dark:text-slate-100">
                                {opt.duration_name}
                              </p>
                              <p className="text-xs text-[#697386] dark:text-slate-400">
                                {formatCurrency(opt.price_vnd)}
                              </p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </section>

                {/* Smart Limits */}
                <section className="mb-10">
                  <h4 className="text-sm font-bold text-[#1a1f36] dark:text-slate-100 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-primary">query_stats</span>
                    {t('billing.modal.smartLimits', 'Smart Limits')}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#f6f9fc] dark:bg-slate-800/50 border border-[#e6ebf1] dark:border-slate-700">
                      <p className="text-[11px] font-bold text-[#697386] dark:text-slate-400 uppercase mb-1">
                        {t('billing.modal.transactionsPerMonth', 'Giao dịch / tháng')}
                      </p>
                      <p className="text-xl font-bold text-[#1a1f36] dark:text-slate-100">
                        {selectedPackage.is_unlimited_transactions
                          ? '∞'
                          : (selectedPackage.max_transactions ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#f6f9fc] dark:bg-slate-800/50 border border-[#e6ebf1] dark:border-slate-700">
                      <p className="text-[11px] font-bold text-[#697386] dark:text-slate-400 uppercase mb-1">
                        {t('billing.modal.bankConnections', 'Kết nối ngân hàng')}
                      </p>
                      <p className="text-xl font-bold text-[#1a1f36] dark:text-slate-100">
                        {t('billing.modal.accountsCount', '{{count}} Tài khoản', {
                          count: totalBankAccounts || selectedPackage.banks?.length || 0,
                        })}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Tính năng bao gồm */}
                <section className="mb-10">
                  <h4 className="text-sm font-bold text-[#1a1f36] dark:text-slate-100 uppercase tracking-wide mb-4">
                    {t('billing.modal.featuresIncluded', 'Tính năng bao gồm')}
                  </h4>
                  <ul className="space-y-4">
                    {selectedPackage.banks && selectedPackage.banks.length > 0 && (
                      <li className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary font-bold flex-shrink-0">
                          check
                        </span>
                        <span className="text-sm leading-relaxed text-[#424770] dark:text-slate-300">
                          {selectedPackage.banks
                            .map((b) =>
                              t('billing.modal.bankAccountLimit', '{{name}}: {{count}} tài khoản', {
                                name: b.name || b.code,
                                count: b.account_limit,
                              }),
                            )
                            .join('. ')}
                        </span>
                      </li>
                    )}
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary font-bold flex-shrink-0">
                        check
                      </span>
                      <span className="text-sm leading-relaxed text-[#424770] dark:text-slate-300">
                        {selectedPackage.is_unlimited_transactions
                          ? t('billing.modal.unlimitedTransactions', 'Giao dịch không giới hạn')
                          : t('billing.modal.maxTransactions', 'Tối đa {{count}} giao dịch hàng tháng', {
                              count: selectedPackage.max_transactions ?? 0,
                            })}
                      </span>
                    </li>
                  </ul>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </Modal>
  )
}
