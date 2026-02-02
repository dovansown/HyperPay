import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

type BankOption = { code: string; name: string; icon: string }

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
      maxWidthClassName="max-w-[1000px]"
      viewportPaddingClassName="p-6"
    >
      <div className="flex flex-col">
        {/* Progress Bar Component */}
        <div className="flex flex-col gap-3 p-8 border-b border-[#f5f4f0] dark:border-[#3a3622]">
          <div className="flex gap-6 justify-between items-center">
            <p className="text-[#181710] dark:text-white text-base font-bold leading-normal">
              Thêm tài khoản ngân hàng mới
            </p>
            <p className="text-primary text-sm font-bold leading-normal bg-black dark:bg-primary dark:text-black px-3 py-1 rounded-full">
              Bước {step} / 3
            </p>
          </div>
          <div className="rounded-full bg-[#e7e5da] dark:bg-[#3a3622] h-3">
            <div className="h-3 rounded-full bg-primary" style={{ width: progressWidth }} />
          </div>
          <p className="text-[#8d865e] text-sm font-medium leading-normal flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">lock</span>
            Chọn ngân hàng để kết nối an toàn
          </p>
        </div>

        <div className="p-8">
          {/* Step 1 */}
          {step === 1 && (
            <>
              
              {/* Search */}
              <div className="mb-10 max-w-xl mx-auto">
              <Input
                rounded="md"
                placeholder='Tìm kiếm ngân hàng (ví dụ: VCB, TCB...)'
                      iconLeft={<span className="material-symbols-outlined">search</span>}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
              </div>

              {/* Bank grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-2">
                {filtered.map((b) => {
                  const selected = selectedBank?.code === b.code
                  return (
                    <button
                      key={b.code}
                      type="button"
                      className={[
                        'bank-card flex flex-col items-center justify-center p-4 bg-[#f8f8f5] dark:bg-[#2a2715] rounded-lg border-2 group transition-all',
                        selected ? 'border-primary' : 'border-transparent hover:border-primary',
                      ].join(' ')}
                      onClick={() => setSelectedBank(b)}
                    >
                      <div className="size-20 rounded-[20px] flex items-center justify-center text-white mb-3 bg-white">
                        <img src={b.icon} alt={b.name} className="w-full h-full object-contain" />
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
                    <span className="material-symbols-outlined text-xl">more_horiz</span>
                  </div>
                  <span className="font-bold text-[#181710] dark:text-white">
                    Ngân hàng khác
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
                  Nhập thông tin tài khoản
                </h1>
                <p className="text-[#8d865e] text-base font-normal max-w-lg mx-auto">
                  Bank: <span className="font-bold">{selectedBank?.name}</span> (
                  <span className="font-bold">{selectedBank?.code}</span>)
                </p>
              </div>
              <form className="max-w-xl mx-auto space-y-4" onSubmit={handleContinue}>
                <Input
                  label="Số tài khoản"
                  rounded="md"
                  placeholder="0123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
                <Input
                  label="Chủ tài khoản"
                  rounded="md"
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
                <span className="material-symbols-outlined text-primary text-2xl">
                  check_circle
                </span>
              </div>
              <h1 className="text-[#181710] dark:text-white tracking-tight text-[28px] font-extrabold leading-tight mb-2">
                Đã kết nối!
              </h1>
              <p className="text-[#8d865e] text-base font-normal max-w-lg mx-auto">
                Tài khoản ngân hàng của bạn đã được kết nối thành công.
              </p>
            </div>
          )}

          {/* Security Footer */}
          <div className="flex flex-col items-center gap-6 mt-4">
            <div className="flex gap-8 items-center justify-center opacity-70 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-green-500 text-base">
                  verified_user
                </span>
                Chuẩn mã hóa AES-256
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-green-500 text-base">
                  verified_user
                </span>
                Được quản lý bởi FCA
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-green-500 text-base">
                  verified_user
                </span>
                Chuẩn mã hóa AES-256
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
                Hủy
              </Button>
              <Button
                className='w-full'
                size="sm"
                variant="primary"
                onClick={() => void handleContinue()}
                disabled={Boolean(isSubmitting) || (step === 1 && !selectedBank)}
              >
                {step === 1
                  ? 'Tiếp tục'
                  : step === 2
                    ? isSubmitting
                      ? 'Đang kết nối...'
                      : 'Kết nối ngân hàng'
                    : 'Hoàn thành'}
              </Button>
            </div>
          </div>
        </div>

        {/* Playful Illustration strip */}
        <div className="bg-primary/10 dark:bg-primary/5 p-6 flex items-center justify-center gap-4 overflow-hidden relative">
          <div className="flex flex-col text-center">
            <p className="text-sm font-bold text-[#8d865e] dark:text-[#a19a7c]">
              Không thấy ngân hàng của bạn? Chúng tôi đang thêm ngân hàng mới hàng ngày!
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

