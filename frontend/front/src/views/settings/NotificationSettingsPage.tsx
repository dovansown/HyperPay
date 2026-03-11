import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { SettingsLayout } from './SettingsLayout'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Switch } from '../../components/ui/Switch'

type NotificationKey = 'success' | 'failed' | 'disputes' | 'payouts' | 'team'

export const NotificationSettingsPage: React.FC = () => {
  const { t } = useTranslation()
  const items = useMemo(
    () =>
      [
        {
          key: 'success',
          title: t('settings.notifications.successTitle', 'Successful payments'),
          description: t(
            'settings.notifications.successDescription',
            'Receive an email for every successful payment received.',
          ),
        },
        {
          key: 'failed',
          title: t('settings.notifications.failedTitle', 'Failed payments'),
          description: t(
            'settings.notifications.failedDescription',
            'Get notified immediately when a payment attempt fails.',
          ),
        },
        {
          key: 'disputes',
          title: t('settings.notifications.disputesTitle', 'Disputes'),
          description: t(
            'settings.notifications.disputesDescription',
            'Receive alerts for new disputes and evidence deadlines.',
          ),
        },
        {
          key: 'payouts',
          title: t('settings.notifications.payoutsTitle', 'Payouts'),
          description: t(
            'settings.notifications.payoutsDescription',
            'Get notified when funds are sent to your bank account.',
          ),
        },
        {
          key: 'team',
          title: t('settings.notifications.teamTitle', 'New team members'),
          description: t(
            'settings.notifications.teamDescription',
            'Receive a confirmation when a new member joins your team.',
          ),
        },
      ] as const,
    [t],
  )

  const [state, setState] = useState<Record<NotificationKey, boolean>>({
    success: true,
    failed: true,
    disputes: true,
    payouts: false,
    team: false,
  })

  return (
    <AuthenticatedLayout>
      <SettingsLayout>
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">
            {t('settings.notifications.title', 'Notification settings')}
          </h1>
          <p className="text-slate-custom text-sm">
            {t(
              'settings.notifications.subtitle',
              'Manage how and when you receive email updates from HyperPay regarding your account activity.',
            )}
          </p>
        </header>

        <Card>
          <CardHeader className="px-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {t('settings.notifications.emailTitle', 'Email notifications')}
              </h3>
              <p className="text-xs text-slate-500">
                {t(
                  'settings.notifications.emailSubtitle',
                  'Automated updates sent to your primary email address.',
                )}
              </p>
            </div>
          </CardHeader>
          <CardBody className="px-0 pb-0">
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col gap-1 pr-4">
                    <p className="text-slate-900 text-sm font-medium">{item.title}</p>
                    <p className="text-slate-500 text-xs">{item.description}</p>
                  </div>
                  <Switch
                    checked={state[item.key]}
                    onChange={(next) => setState((prev) => ({ ...prev, [item.key]: next }))}
                  />
                </div>
              ))}
              <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-slate-700"
                  onClick={() =>
                    setState({
                      success: true,
                      failed: true,
                      disputes: true,
                      payouts: false,
                      team: false,
                    })
                  }
                >
                  {t('settings.notifications.reset', 'Reset defaults')}
                </Button>
                <Button size="sm">
                  {t('settings.notifications.save', 'Save changes')}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-primary/10 border-primary/20">
          <CardBody className="flex items-start gap-3 p-4">
            <span className="material-symbols-outlined text-primary mt-0.5">info</span>
            <p className="text-xs text-slate-700">
              {t(
                'settings.notifications.note',
                'Critical security updates and billing alerts will always be sent to your primary email address regardless of these settings.',
              )}
            </p>
          </CardBody>
        </Card>
      </SettingsLayout>
    </AuthenticatedLayout>
  )
}

