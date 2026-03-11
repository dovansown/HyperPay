import React from 'react'
import { useTranslation } from 'react-i18next'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { SettingsLayout } from './SettingsLayout'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'

export const SecuritySettingsPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <AuthenticatedLayout>
      <SettingsLayout>
        <header className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900">
            {t('settings.security.title', 'Security settings')}
          </h2>
          <p className="text-slate-custom text-sm">
            {t(
              'settings.security.subtitle',
              'Manage security preferences and how access is protected across your account.',
            )}
          </p>
        </header>

        <Card>
          <CardHeader className="px-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {t('settings.security.sessionsTitle', 'Sign-in & sessions')}
              </h3>
              <p className="text-xs text-slate-500">
                {t(
                  'settings.security.sessionsSubtitle',
                  'View active sessions and sign out from other devices.',
                )}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
            >
              {t('settings.security.signOutAll', 'Sign out of all devices')}
            </Button>
          </CardHeader>
          <CardBody className="px-0 pb-0">
            <Table>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('settings.security.sessionsDevice', 'Device')}
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('settings.security.sessionsLocation', 'Location')}
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('settings.security.sessionsLastActive', 'Last active')}
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                    {t('settings.security.sessionsActions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  {
                    device: 'Chrome on Windows',
                    location: 'Ho Chi Minh City, VN',
                    lastActive: 'Just now',
                    current: true,
                  },
                  {
                    device: 'Safari on iPhone',
                    location: 'Ho Chi Minh City, VN',
                    lastActive: '2 days ago',
                    current: false,
                  },
                ].map((row) => (
                  <tr key={row.device}>
                    <td className="px-6 py-3 text-sm font-medium text-slate-900">
                      {row.device}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500">{row.location}</td>
                    <td className="px-6 py-3 text-sm text-slate-500">{row.lastActive}</td>
                    <td className="px-6 py-3 text-sm text-right">
                      {row.current ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700">
                          {t('settings.security.currentSession', 'Current session')}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="text-primary text-xs font-medium hover:underline"
                        >
                          {t('settings.security.signOut', 'Sign out')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="px-6">
            <h3 className="text-lg font-bold text-slate-900">
              {t('settings.security.mfaTitle', 'Two-factor authentication')}
            </h3>
          </CardHeader>
          <CardBody className="px-6 pb-6 space-y-4">
            <p className="text-sm text-slate-600">
              {t(
                'settings.security.mfaDescription',
                'Add an extra layer of security to your account by requiring a code in addition to your password.',
              )}
            </p>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">shield_lock</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {t('settings.security.mfaStatus', 'Authenticator app')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t('settings.security.mfaStatusOff', 'Not configured')}
                  </p>
                </div>
              </div>
              <Button size="sm">
                {t('settings.security.mfaSetup', 'Set up')}
              </Button>
            </div>
          </CardBody>
        </Card>
      </SettingsLayout>
    </AuthenticatedLayout>
  )
}

