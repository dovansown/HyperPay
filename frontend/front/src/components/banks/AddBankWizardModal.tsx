import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

type BankOption = { code: string; name: string }

interface AddBankWizardModalProps {
  isOpen: boolean
  bankOptions: BankOption[]
  isSubmitting?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (payload: {
    bank_name: string
    account_number: string
    account_holder: string
  }) => Promise<void> | void
}

function matchBank(option: BankOption, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    option.code.toLowerCase().includes(q) || option.name.toLowerCase().includes(q)
  )
}

export function AddBankWizardModal({
  isOpen,
  bankOptions,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: AddBankWizardModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [query, setQuery] = useState('')
  const [selectedBank, setSelectedBank] = useState<BankOption | null>(null)
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')

  const filtered = useMemo(() => {
    return bankOptions.filter((b) => matchBank(b, query)).slice(0, 8)
  }, [bankOptions, query])

  const progressWidth = step === 1 ? '33%' : step === 2 ? '66%' : '100%'

  const handleCancel = () => {
    setStep(1)
    setQuery('')
    setSelectedBank(null)
    setAccountNumber('')
    setAccountHolder('')
    onClose()
  }

  const handleContinue = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    if (step === 1) {
      if (!selectedBank) return
      setStep(2)
      return
    }
    if (step === 2) {
      if (!selectedBank) return
      await onSubmit({
        bank_name: selectedBank.code,
        account_number: accountNumber,
        account_holder: accountHolder,
      })
      setStep(3)
      return
    }
    // step 3
    handleCancel()
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      maxWidthClassName="max-w-[900px]"
      viewportPaddingClassName="p-6"
    >
      <div className="flex flex-col">
        {/* Progress Bar Component */}
        <div className="flex flex-col gap-3 p-8 border-b border-[#f5f4f0] dark:border-[#3a3622]">
          <div className="flex gap-6 justify-between items-center">
            <p className="text-[#181710] dark:text-white text-lg font-bold leading-normal">
              Link New Bank Account
            </p>
            <p className="text-primary text-sm font-bold leading-normal bg-black dark:bg-primary dark:text-black px-3 py-1 rounded-full">
              Step {step} of 3
            </p>
          </div>
          <div className="rounded-full bg-[#e7e5da] dark:bg-[#3a3622] h-3">
            <div className="h-3 rounded-full bg-primary" style={{ width: progressWidth }} />
          </div>
          <p className="text-[#8d865e] text-sm font-medium leading-normal flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">lock</span>
            Choose your institution to connect securely
          </p>
        </div>

        <div className="p-8">
          {/* Step 1 */}
          {step === 1 && (
            <>
              
              {/* Search */}
              <div className="mb-10 max-w-xl mx-auto">
              <Input
                placeholder='Search for your bank (e.g. VCB, TCB...)'
                      iconLeft={<span className="material-symbols-outlined">search</span>}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
              </div>

              {/* Bank grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {filtered.map((b) => {
                  const selected = selectedBank?.code === b.code
                  return (
                    <button
                      key={b.code}
                      type="button"
                      className={[
                        'bank-card flex flex-col items-center justify-center p-6 bg-[#f8f8f5] dark:bg-[#2a2715] rounded-lg border-2 group transition-all',
                        selected ? 'border-primary' : 'border-transparent hover:border-primary',
                      ].join(' ')}
                      onClick={() => setSelectedBank(b)}
                    >
                      <div className="size-12 rounded-full bg-blue-600 flex items-center justify-center text-white mb-3 shadow-lg">
                        <span className="material-symbols-outlined text-2xl">
                          account_balance
                        </span>
                      </div>
                      <span className="font-bold text-[#181710] dark:text-white">
                        {b.code}
                      </span>
                      <span className="text-[10px] text-[#8d865e] font-bold uppercase tracking-wider mt-1">
                        {b.name}
                      </span>
                    </button>
                  )
                })}
                <button
                  type="button"
                  className="bank-card flex flex-col items-center justify-center p-6 bg-primary/20 dark:bg-primary/10 rounded-lg border-2 border-dashed border-primary group transition-all"
                >
                  <div className="size-12 rounded-full bg-primary flex items-center justify-center text-black mb-3 shadow-lg">
                    <span className="material-symbols-outlined text-2xl">more_horiz</span>
                  </div>
                  <span className="font-bold text-[#181710] dark:text-white">
                    Other Banks
                  </span>
                </button>
              </div>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-[#181710] dark:text-white tracking-tight text-[28px] font-extrabold leading-tight mb-2">
                  Enter account details
                </h1>
                <p className="text-[#8d865e] text-lg font-normal max-w-lg mx-auto">
                  Bank: <span className="font-bold">{selectedBank?.name}</span> (
                  <span className="font-bold">{selectedBank?.code}</span>)
                </p>
              </div>
              <form className="max-w-xl mx-auto space-y-4" onSubmit={handleContinue}>
                <Input
                  label="Số tài khoản"
                  placeholder="0123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
                <Input
                  label="Chủ tài khoản"
                  placeholder="Nguyen Van A"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                />

                {error && (
                  <p className="text-sm text-red-500 font-medium">{error}</p>
                )}
              </form>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="text-center py-10">
              <div className="mx-auto size-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">
                  check_circle
                </span>
              </div>
              <h1 className="text-[#181710] dark:text-white tracking-tight text-[28px] font-extrabold leading-tight mb-2">
                Connected!
              </h1>
              <p className="text-[#8d865e] text-lg font-normal max-w-lg mx-auto">
                Your bank account has been linked successfully.
              </p>
            </div>
          )}

          {/* Security Footer */}
          <div className="flex flex-col items-center gap-6 mt-4">
            <div className="flex gap-8 items-center justify-center opacity-70 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-green-500 text-lg">
                  verified_user
                </span>
                256-bit AES
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-green-500 text-lg">
                  verified_user
                </span>
                FCA Regulated
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-green-500 text-lg">
                  verified_user
                </span>
                End-to-end Encrypted
              </div>
            </div>

            <div className="flex items-center gap-4 w-full pt-6 border-t border-[#f5f4f0] dark:border-[#3a3622]">
              <Button
                className='w-full'
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCancel}
              >
                Hủy bỏ
              </Button>
              <Button
                className='w-full'
                size="sm"
                variant="primary"
                onClick={() => void handleContinue()}
                disabled={Boolean(isSubmitting) || (step === 1 && !selectedBank)}
              >
                {step === 1
                  ? 'Continue'
                  : step === 2
                    ? isSubmitting
                      ? 'Linking...'
                      : 'Link Bank'
                    : 'Done'}
              </Button>
            </div>
          </div>
        </div>

        {/* Playful Illustration strip */}
        <div className="bg-primary/10 dark:bg-primary/5 p-6 flex items-center justify-center gap-4 overflow-hidden relative">
          <div className="flex flex-col text-center">
            <p className="text-sm font-bold text-[#8d865e] dark:text-[#a19a7c]">
              Don&apos;t see your bank? We&apos;re adding new ones every day!
            </p>
          </div>
          <div className="absolute -right-8 -bottom-8 size-24 bg-primary rounded-full blur-2xl opacity-20" />
          <div className="absolute -left-8 -top-8 size-24 bg-primary rounded-full blur-2xl opacity-20" />
        </div>
      </div>
    </Modal>
  )
}

export default AddBankWizardModal

