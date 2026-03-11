import React from 'react'
import { useTranslation } from 'react-i18next'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'

type InvoiceRow = {
  id: string
  date: string
  amount: string
  status: 'paid' | 'failed'
}

const mockInvoices: InvoiceRow[] = [
  { id: 'INV-2023-009', date: 'Sep 24, 2023', amount: '$49.00', status: 'paid' },
  { id: 'INV-2023-008', date: 'Aug 24, 2023', amount: '$49.00', status: 'paid' },
  { id: 'INV-2023-007', date: 'Jul 24, 2023', amount: '$49.00', status: 'paid' },
  { id: 'INV-2023-006', date: 'Jun 24, 2023', amount: '$49.00', status: 'failed' },
]

export const BillingPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <AuthenticatedLayout>
      <section className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">
            {t('billing.title', 'Billing Settings')}
          </h1>
          <p className="text-slate-custom text-sm md:text-base">
            {t(
              'billing.subtitle',
              'Manage your subscription, view invoices, and update payment details.',
            )}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardBody>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                      {t('billing.plan.activeBadge', 'ACTIVE')}
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">
                      {t('billing.plan.name', 'Pro Plan')}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {t('billing.plan.price', '$49.00 billed monthly')}
                    </p>
                  </div>
                  <Button>
                    {t('billing.plan.change', 'Change plan')}
                  </Button>
                </div>

                <div className="bg-primary/5 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <p className="text-sm text-slate-700">
                      {t(
                        'billing.plan.nextRenewal',
                        'Your next renewal date is October 24, 2023.',
                      )}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary px-0">
                    {t('billing.plan.manageAutoRenew', 'Manage auto-renew')}
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="px-6">
                <h3 className="text-lg font-bold text-slate-900">
                  {t('billing.payment.title', 'Payment Method')}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:underline flex items-center gap-1 px-0"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  {t('billing.payment.add', 'Add New')}
                </Button>
              </CardHeader>
              <CardBody className="px-6 pb-6">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center border border-slate-200">
                      <span className="material-symbols-outlined text-slate-600">credit_card</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {t('billing.payment.cardLabel', 'Visa ending in 4242')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t('billing.payment.cardMeta', 'Expires 12/26 • Default')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card>
              <CardBody className="p-6 space-y-3">
                <h3 className="text-lg font-bold text-slate-900">
                  {t('billing.invoice.title', 'Upcoming Invoice')}
                </h3>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    {t('billing.invoice.dateLabel', 'Date')}
                  </span>
                  <span className="text-slate-900 font-medium">
                    {t('billing.invoice.dateValue', 'Oct 24, 2023')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    {t('billing.invoice.lineLabel', 'Pro Subscription')}
                  </span>
                  <span className="text-slate-900 font-medium">$49.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    {t('billing.invoice.taxLabel', 'Tax (0%)')}
                  </span>
                  <span className="text-slate-900 font-medium">$0.00</span>
                </div>
                <hr className="border-slate-100 my-2" />
                <div className="flex justify-between items-center text-base font-bold">
                  <span className="text-slate-900">
                    {t('billing.invoice.totalLabel', 'Total Amount')}
                  </span>
                  <span className="text-primary text-xl">$49.00</span>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardBody className="p-6 space-y-3">
                <h4 className="text-primary font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined">support_agent</span>
                  {t('billing.help.title', 'Need help?')}
                </h4>
                <p className="text-xs text-slate-600">
                  {t(
                    'billing.help.description',
                    'Have questions about your billing or want to cancel? Contact our support team.',
                  )}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  {t('billing.help.contact', 'Contact Support')}
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              {t('billing.history.title', 'Billing History')}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:underline flex items-center gap-1 px-0"
            >
              <span className="material-symbols-outlined text-base">download</span>
              {t('billing.history.export', 'Export all')}
            </Button>
          </div>
          <Card className="overflow-hidden border-primary/10">
            <Table>
              <thead>
                <tr className="border-b border-primary/10 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('billing.history.columns.id', 'Invoice ID')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('billing.history.columns.date', 'Date')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('billing.history.columns.amount', 'Amount')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('billing.history.columns.status', 'Status')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                    {t('billing.history.columns.receipt', 'Receipt')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {mockInvoices.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{row.date}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {row.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={[
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          row.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700',
                        ].join(' ')}
                      >
                        {row.status === 'paid'
                          ? t('billing.history.status.paid', 'Paid')
                          : t('billing.history.status.failed', 'Failed')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="text-slate-400 hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined">download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </section>
      </section>
    </AuthenticatedLayout>
  )
}

