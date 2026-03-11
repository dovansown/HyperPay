import React from 'react'
import { useTranslation } from 'react-i18next'
import { AuthenticatedLayout } from '../layout/AuthenticatedLayout'
import { SettingsLayout } from './SettingsLayout'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export const ProfileSettingsPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <AuthenticatedLayout>
      <SettingsLayout>
        <header className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900">
            {t('settings.profile.title', 'Account settings')}
          </h2>
          <p className="text-slate-custom text-sm">
            {t(
              'settings.profile.subtitle',
              'Update your personal information and how it appears across HyperPay.',
            )}
          </p>
        </header>

        <Card>
          <CardHeader className="px-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {t('settings.profile.sectionMain', 'Profile details')}
              </h3>
              <p className="text-xs text-slate-500">
                {t(
                  'settings.profile.sectionMainSubtitle',
                  'Basic information about your account.',
                )}
              </p>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label={t('settings.profile.fullName', 'Full name')}
                placeholder={t('settings.profile.fullNamePlaceholder', 'Jane Doe')}
              />
              <Input
                label={t('settings.profile.email', 'Email')}
                placeholder="name@company.com"
                type="email"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label={t('settings.profile.company', 'Company')}
                placeholder={t('settings.profile.companyPlaceholder', 'Acme Inc.')}
              />
              <Input
                label={t('settings.profile.timezone', 'Timezone')}
                placeholder="UTC+7"
              />
            </div>
            <div className="flex justify-end pt-4 gap-3 border-t border-slate-100 mt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-slate-600"
              >
                {t('settings.profile.discard', 'Discard changes')}
              </Button>
              <Button size="sm">
                {t('settings.profile.save', 'Save changes')}
              </Button>
            </div>
          </CardBody>
        </Card>
      </SettingsLayout>
    </AuthenticatedLayout>
  )
}

