import { useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Switch from '../../components/ui/Switch'

export function ProfileSettingsPage() {
  const [twoFa, setTwoFa] = useState(true)

  return (
    <>
      <header className="p-8 max-w-[1300px] mx-auto w-full">
        <div className="flex items-center gap-2 mb-4 text-[#8c855f] text-sm font-bold">
          <span className="hover:text-primary transition-colors cursor-default">
            Account
          </span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-[#181711] dark:text-white">Profile Settings</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-[#181711] dark:text-white text-3xl md:text-4xl font-black tracking-tight mb-4">
              Hồ sơ cá nhân
            </h1>
            <p className="text-[#8c855f] dark:text-[#a19b80] text-base font-medium">
              Cập nhật thông tin để chúng mình hiểu bạn hơn nhé! 😊
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-[1300px] mx-auto w-full px-8 space-y-8 pb-32">
        <div className="bg-white dark:bg-[#1f1d10] p-8 rounded-[1rem] border border-[#e6e4db] dark:border-[#3d3a2a] flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-primary/20 p-1">
              <div className="w-full h-full rounded-full bg-cover bg-center bg-gray-200 dark:bg-white/10" />
            </div>
            <button className="absolute -bottom-2 -right-2 bg-primary text-background-dark p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sm">photo_camera</span>
            </button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-black text-[#181711] dark:text-white mb-1">
              Alex Morgan
            </h2>
            <p className="text-[#8c855f] font-medium mb-4">
              Enterprise Owner • Joined March 2024
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="px-6 rounded-full"
              type="button"
            >
              Edit Photo
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1f1d10] p-8 rounded-[1rem] border border-[#e6e4db] dark:border-[#3d3a2a]">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-primary">person</span>
            <h3 className="text-base font-black text-[#181711] dark:text-white uppercase tracking-tight">
              Personal Info
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" defaultValue="Alex Morgan" />
            <Input label="Display Name" defaultValue="alex_m" />
            <Input label="Email Address" type="email" defaultValue="alex@example.com" />
            <Input label="Phone Number" defaultValue="+1 (555) 000-1234" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-[#1f1d10] p-8 rounded-[1rem] border border-[#e6e4db] dark:border-[#3d3a2a]">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">security</span>
              <h3 className="text-base font-black text-[#181711] dark:text-white">
                Security
              </h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#181711] dark:text-white">Password</p>
                  <p className="text-xs text-[#8c855f]">Last changed 3 months ago</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  className="px-0 h-auto text-sm font-bold underline decoration-primary decoration-2 underline-offset-4"
                >
                  Update
                </Button>
              </div>
              <div className="h-px bg-[#e6e4db] dark:bg-[#3d3a2a]" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#181711] dark:text-white">
                    Two-Factor Auth
                  </p>
                  <p className="text-xs text-[#8c855f]">
                    Secure your account with SMS or App
                  </p>
                </div>
                <Switch checked={twoFa} onChange={setTwoFa} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1f1d10] p-8 rounded-[1rem] border border-[#e6e4db] dark:border-[#3d3a2a]">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">link</span>
              <h3 className="text-base font-black text-[#181711] dark:text-white">
                Connected Accounts
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-background-light dark:bg-[#2c2918] rounded-[1rem]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#e6e4db]">
                    <span className="material-symbols-outlined text-sm">
                      alternate_email
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#181711] dark:text-white">
                    Google
                  </p>
                </div>
                <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">check_circle</span>{' '}
                  Linked
                </span>
              </div>
              <div className="flex items-center justify-between p-3 border border-[#e6e4db] dark:border-[#3d3a2a] rounded-[1rem]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#e6e4db]">
                    <span className="material-symbols-outlined text-sm">work</span>
                  </div>
                  <p className="text-sm font-bold text-[#181711] dark:text-white">
                    LinkedIn
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  className="px-0 h-auto text-xs font-bold text-[#181711] dark:text-white hover:underline"
                >
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-[18rem] right-0 bg-white/80 dark:bg-[#1a180b]/80 backdrop-blur-md border-t border-[#e6e4db] dark:border-[#3d3a2a] p-4 flex justify-center z-50">
        <div className="max-w-[1300px] w-full flex items-center justify-between px-4">
          <p className="text-[#8c855f] text-sm font-medium hidden sm:block">
            Đừng quên lưu các thay đổi của bạn nhé!
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="flex-1 sm:flex-none px-6 py-2.5 !h-auto rounded-full font-bold text-[#8c855f] hover:bg-background-light dark:hover:bg-[#2c2918]"
            >
              Discard
            </Button>
            <Button
              size="sm"
              className="flex-1 sm:flex-none px-10 py-2.5 !h-auto rounded-full font-black"
              type="submit"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfileSettingsPage

