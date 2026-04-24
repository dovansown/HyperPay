import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { ArrowLeft, Copy, Check, Trash2, Send, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAccounts } from '@/store/slices/accountsSlice';
import {
  deleteWebhookConfig,
  fetchWebhookConfig,
  saveWebhookConfig,
  sendTestEvent,
  type PaymentCodeCharset,
  type TransactionDirectionFilter,
  type WebhookAuthType,
  type WebhookContentType,
} from '@/store/slices/webhookSlice';

function generateSecret(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `whsec_${Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}

export function WebhookForm() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.webhook);
  const accounts = useAppSelector((s) => s.accounts.items);

  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    enabled: true,
    url: '',
    secret: generateSecret(),
    bankAccountId: '',
    direction: 'BOTH' as TransactionDirectionFilter,
    contentType: 'JSON' as WebhookContentType,
    retry: true,
    maxRetries: 3,
    authType: 'NONE' as WebhookAuthType,
    authBearerToken: '',
    authUsername: '',
    authPassword: '',
    authHeaderName: '',
    authHeaderValue: '',
    requirePaymentCode: false,
    enableExtractionRule: false,
    paymentPrefix: '',
    paymentMin: 8,
    paymentMax: 12,
    paymentCharset: 'NUMERIC' as PaymentCodeCharset,
    enableEndpoint: true,
  });

  const existing = useMemo(() => items.find((w) => w.id === id), [id, items]);

  useEffect(() => {
    void dispatch(fetchAccounts());
    void dispatch(fetchWebhookConfig());
  }, [dispatch]);

  useEffect(() => {
    if (!isEditing) return;
    if (!existing) return;
    setFormData((prev) => ({
      ...prev,
      enabled: existing.is_active,
      enableEndpoint: existing.is_active,
      url: existing.url,
      secret: existing.secret_token,
      bankAccountId: existing.account_ids?.[0] ?? '',
      direction: existing.transaction_direction,
      contentType: existing.content_type,
      retry: existing.retry_on_non_2xx,
      maxRetries: existing.max_retry_attempts,
      authType: existing.auth_type,
      authBearerToken: existing.auth_bearer_token ?? '',
      authUsername: existing.auth_username ?? '',
      authPassword: existing.auth_password ?? '',
      authHeaderName: existing.auth_header_name ?? '',
      authHeaderValue: existing.auth_header_value ?? '',
      requirePaymentCode: existing.require_payment_code,
      enableExtractionRule: existing.payment_code_rule_enabled,
      paymentPrefix: existing.payment_code_prefix ?? '',
      paymentMin: existing.payment_code_suffix_min_length ?? 8,
      paymentMax: existing.payment_code_suffix_max_length ?? 12,
      paymentCharset: (existing.payment_code_suffix_charset ?? 'NUMERIC') as PaymentCodeCharset,
    }));
  }, [existing, isEditing]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const account_ids = formData.bankAccountId ? [formData.bankAccountId] : [];
    const is_active = Boolean(formData.enabled && formData.enableEndpoint);

    const payload = {
      id: id,
      url: formData.url,
      secret_token: formData.secret,
      account_ids,
      transaction_direction: formData.direction,
      retry_on_non_2xx: formData.retry,
      max_retry_attempts: Math.max(1, Math.min(10, formData.maxRetries)),
      content_type: formData.contentType,
      auth_type: formData.authType,
      auth_bearer_token: formData.authType === 'BEARER' ? formData.authBearerToken : undefined,
      auth_username: formData.authType === 'BASIC' ? formData.authUsername : undefined,
      auth_password: formData.authType === 'BASIC' ? formData.authPassword : undefined,
      auth_header_name: formData.authType === 'HEADER' ? formData.authHeaderName : undefined,
      auth_header_value: formData.authType === 'HEADER' ? formData.authHeaderValue : undefined,
      require_payment_code: formData.requirePaymentCode,
      payment_code_rule_enabled: formData.enableExtractionRule,
      payment_code_prefix: formData.enableExtractionRule ? formData.paymentPrefix : undefined,
      payment_code_suffix_min_length: formData.enableExtractionRule ? formData.paymentMin : undefined,
      payment_code_suffix_max_length: formData.enableExtractionRule ? formData.paymentMax : undefined,
      payment_code_suffix_charset: formData.enableExtractionRule ? formData.paymentCharset : undefined,
      is_active,
    };

    try {
      await dispatch(saveWebhookConfig(payload)).unwrap();
      navigate('/webhook');
    } catch {
      // toast handled from slice error state
    }
  };

  return (
    <div className="min-h-screen bg-section-bg font-sans flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/webhook')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#e8e8e8] text-gray hover:text-dark hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[24px] font-bold text-dark">
            {isEditing ? t('webhook.edit_title') : t('webhook.create_title')}
          </h1>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Basic Config */}
            <div className="flex flex-col gap-8">
              <Card className="p-6 md:p-8 flex flex-col gap-8">
                {/* Enabled */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-[15px] font-bold text-dark">{t('webhook.enabled')}</label>
                  </div>
                  <Switch 
                    checked={formData.enabled} 
                    onChange={(c) => setFormData({...formData, enabled: c})} 
                  />
                </div>

                <hr className="border-[#e8e8e8]" />

                {/* Endpoint URL */}
                <div>
                  <label className="block text-[15px] font-bold text-dark mb-2">{t('webhook.endpoint_url')}</label>
                  <input 
                    type="url" 
                    placeholder="https://" 
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors mb-2"
                    required
                  />
                  <p className="text-[13px] text-gray">
                    {t('webhook.endpoint_desc')}
                  </p>
                </div>

                {/* Signing secret */}
                <div>
                  <label className="block text-[15px] font-bold text-dark mb-2">{t('webhook.signing_secret')}</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.secret}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-100 border border-[#e8e8e8] rounded-xl text-[14px] text-gray outline-none pr-12 font-mono"
                    />
                    <button 
                      type="button"
                      onClick={handleCopy}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-dark transition-colors"
                    >
                      {copied ? <Check size={18} className="text-primary" /> : <Copy size={18} />}
                    </button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 rounded-xl text-[13px]"
                      onClick={() => setFormData((p) => ({ ...p, secret: generateSecret() }))}
                    >
                      <RefreshCcw size={14} /> Regenerate
                    </Button>
                  </div>
                  <p className="text-[13px] text-gray mt-2">
                    {t('webhook.signing_secret_desc')}
                  </p>
                </div>

                {/* Linked bank account */}
                <div>
                  <label className="block text-[15px] font-bold text-dark mb-2">{t('webhook.linked_bank')}</label>
                  <select 
                    value={formData.bankAccountId}
                    onChange={(e) => setFormData({...formData, bankAccountId: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors mb-2"
                  >
                    <option value="">{accounts.length ? 'Tất cả tài khoản' : t('webhook.no_bank_found')}</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.bank_name} • {a.account_number}
                      </option>
                    ))}
                  </select>
                  <p className="text-[13px] text-gray">
                    {t('webhook.linked_bank_desc')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Transaction direction */}
                  <div>
                    <label className="block text-[15px] font-bold text-dark mb-2">{t('webhook.direction')}</label>
                    <select 
                      value={formData.direction}
                      onChange={(e) => setFormData({...formData, direction: e.target.value as TransactionDirectionFilter})}
                      className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors"
                    >
                      <option value="BOTH">{t('webhook.direction_both')}</option>
                      <option value="IN">{t('webhook.direction_in')}</option>
                      <option value="OUT">{t('webhook.direction_out')}</option>
                    </select>
                  </div>

                  {/* Content type */}
                  <div>
                    <label className="block text-[15px] font-bold text-dark mb-2">{t('webhook.content_type')}</label>
                    <select 
                      value={formData.contentType}
                      onChange={(e) => setFormData({...formData, contentType: e.target.value as WebhookContentType})}
                      className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors"
                    >
                      <option value="JSON">JSON</option>
                      <option value="FORM_URLENCODED">Form URL Encoded</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Advanced Config */}
            <div className="flex flex-col gap-8">
              <Card className="p-6 md:p-8 flex flex-col gap-8">
                {/* Retry */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-[15px] font-bold text-dark">{t('webhook.retry_desc')}</label>
                  </div>
                  <Switch 
                    checked={formData.retry} 
                    onChange={(c) => setFormData({...formData, retry: c})} 
                  />
                </div>

                {/* Max retries */}
                {formData.retry && (
                  <div>
                    <label className="block text-[15px] font-bold text-dark mb-2">{t('webhook.max_retries')}</label>
                    <input 
                      type="number" 
                      min="1"
                      max="10"
                      value={formData.maxRetries}
                      onChange={(e) => setFormData({...formData, maxRetries: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors"
                    />
                  </div>
                )}

                <hr className="border-[#e8e8e8]" />

                {/* Authentication */}
                <div>
                  <h3 className="text-[16px] font-bold text-dark mb-4">{t('webhook.auth')}</h3>
                  <div>
                    <label className="block text-[14px] font-bold text-dark mb-2">{t('webhook.auth_type')}</label>
                    <select 
                      value={formData.authType}
                      onChange={(e) => setFormData({...formData, authType: e.target.value as WebhookAuthType})}
                      className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors"
                    >
                      <option value="NONE">{t('webhook.auth_none')}</option>
                      <option value="BASIC">{t('webhook.auth_basic')}</option>
                      <option value="BEARER">{t('webhook.auth_bearer')}</option>
                      <option value="HEADER">Header</option>
                    </select>
                  </div>
                </div>

                {formData.authType === 'BEARER' && (
                  <div>
                    <label className="block text-[14px] font-bold text-dark mb-2">Bearer token</label>
                    <input
                      type="text"
                      value={formData.authBearerToken}
                      onChange={(e) => setFormData({ ...formData, authBearerToken: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors"
                      required
                    />
                  </div>
                )}
                {formData.authType === 'BASIC' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[14px] font-bold text-dark mb-2">Username</label>
                      <input
                        type="text"
                        value={formData.authUsername}
                        onChange={(e) => setFormData({ ...formData, authUsername: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-bold text-dark mb-2">Password</label>
                      <input
                        type="password"
                        value={formData.authPassword}
                        onChange={(e) => setFormData({ ...formData, authPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors"
                        required
                      />
                    </div>
                  </div>
                )}
                {formData.authType === 'HEADER' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[14px] font-bold text-dark mb-2">Header name</label>
                      <input
                        type="text"
                        value={formData.authHeaderName}
                        onChange={(e) => setFormData({ ...formData, authHeaderName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] font-bold text-dark mb-2">Header value</label>
                      <input
                        type="text"
                        value={formData.authHeaderValue}
                        onChange={(e) => setFormData({ ...formData, authHeaderValue: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors"
                        required
                      />
                    </div>
                  </div>
                )}

                <hr className="border-[#e8e8e8]" />

                {/* Payment code rules */}
                <div>
                  <h3 className="text-[16px] font-bold text-dark mb-4">{t('webhook.payment_code_rules')}</h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-[14px] font-bold text-dark">{t('webhook.require_payment_code')}</label>
                      <Switch 
                        checked={formData.requirePaymentCode} 
                        onChange={(c) => setFormData({...formData, requirePaymentCode: c})} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="block text-[14px] font-bold text-dark">{t('webhook.enable_extraction')}</label>
                      <Switch 
                        checked={formData.enableExtractionRule} 
                        onChange={(c) => setFormData({...formData, enableExtractionRule: c})} 
                      />
                    </div>

                    {formData.enableExtractionRule && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[14px] font-bold text-dark mb-2">Prefix</label>
                          <input
                            type="text"
                            value={formData.paymentPrefix}
                            onChange={(e) => setFormData({ ...formData, paymentPrefix: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[14px] font-bold text-dark mb-2">Charset</label>
                          <select
                            value={formData.paymentCharset}
                            onChange={(e) => setFormData({ ...formData, paymentCharset: e.target.value as PaymentCodeCharset })}
                            className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors"
                          >
                            <option value="NUMERIC">NUMERIC</option>
                            <option value="ALPHA">ALPHA</option>
                            <option value="ALPHANUMERIC">ALPHANUMERIC</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[14px] font-bold text-dark mb-2">Min length</label>
                          <input
                            type="number"
                            min={1}
                            max={32}
                            value={formData.paymentMin}
                            onChange={(e) => setFormData({ ...formData, paymentMin: parseInt(e.target.value) || 1 })}
                            className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[14px] font-bold text-dark mb-2">Max length</label>
                          <input
                            type="number"
                            min={1}
                            max={32}
                            value={formData.paymentMax}
                            onChange={(e) => setFormData({ ...formData, paymentMax: parseInt(e.target.value) || 1 })}
                            className="w-full px-4 py-3 bg-gray-50 border border-[#e8e8e8] rounded-xl text-[14px] outline-none focus:border-primary focus:bg-white transition-colors"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <hr className="border-[#e8e8e8]" />

                {/* Enable endpoint */}
                <div className="flex items-center justify-between">
                  <label className="block text-[15px] font-bold text-dark">{t('webhook.enable_endpoint')}</label>
                  <Switch 
                    checked={formData.enableEndpoint} 
                    onChange={(c) => setFormData({...formData, enableEndpoint: c})} 
                  />
                </div>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-3">
                  {isEditing && id && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2 rounded-xl"
                        onClick={async () => {
                          await dispatch(sendTestEvent({ webhookId: id }));
                        }}
                      >
                        <Send size={14} /> Test
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2 rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                        onClick={async () => {
                          await dispatch(deleteWebhookConfig(id));
                          navigate('/webhook');
                        }}
                      >
                        <Trash2 size={14} /> {t('common.delete')}
                      </Button>
                    </>
                  )}
                </div>
                <Button type="button" variant="outline" className="px-8 py-3 rounded-xl" onClick={() => navigate('/webhook')}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" className="px-8 py-3 rounded-xl" disabled={status === 'loading'}>
                  {t('webhook.save')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
