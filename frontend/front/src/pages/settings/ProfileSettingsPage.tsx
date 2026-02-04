import { useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Switch from '../../components/ui/Switch'

export function ProfileSettingsPage() {
  const [twoFa, setTwoFa] = useState(true)

  return (
    <>
      <header className="px-8 max-w-[1300px] mx-auto w-full">
        <div className="flex items-center gap-2 mb-4 text-[#8c855f] text-sm font-bold">
          <span className="hover:text-primary transition-colors cursor-default">
            Tài khoản
          </span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-[#181711] dark:text-white">Cài đặt hồ sơ</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div className="max-w-2xl">
            <p className="text-[#8c855f] dark:text-[#a19b80] text-sm font-medium">
              Cập nhật thông tin để bảo vệ tài khoản của bạn
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-[1300px] mx-auto w-full px-8 space-y-8 pb-32">
        <div className="bg-white dark:bg-[#1f1d10] p-8 rounded-[1rem]  flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-primary/20 p-1">
              <div className="w-full h-full rounded-full bg-cover bg-center bg-gray-200 dark:bg-white/10" />
            </div>
            <button className="size-8 absolute bottom-0 right-0 bg-primary text-background-dark p-2 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">photo_camera</span>
            </button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-base font-black text-[#181711] dark:text-white mb-1">
              Nguyễn Văn A
            </h2>
            <p className="text-[#8c855f] text-sm font-medium mb-4">
              Enterprise Owner • Đăng ký vào tháng 03/2024
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="px-6 rounded-full"
              type="button"
            >
              Chỉnh sửa ảnh
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1f1d10] p-8 rounded-[1rem] ">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-primary">person</span>
            <h3 className="text-base font-black text-[#181711] dark:text-white uppercase tracking-tight">
              Thông tin cá nhân
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input rounded="md" label="Họ và tên" defaultValue="Nguyễn Văn A" />
            <Input rounded="md" label="Tên đăng nhập" defaultValue="nguyenvanA" />
            <Input rounded="md" label="Email" type="email" defaultValue="nguyenvanA@example.com" />
            <Input rounded="md" label="Số điện thoại" defaultValue="+84 909 000 000" />
          </div>
          <div className="flex justify-end mt-4">
            <Button size="sm" variant="primary" className="px-6 rounded-full">
              Cập nhật
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-[#1f1d10] p-8 rounded-[1rem] ">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">security</span>
              <h3 className="text-base font-black text-[#181711] dark:text-white">
                Bảo mật
              </h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#181711] dark:text-white">Mật khẩu</p>
                  <p className="text-xs text-[#8c855f]">Cập nhật vào tháng 03/2024</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  className="px-0 h-auto text-sm font-bold underline decoration-primary decoration-2 underline-offset-4"
                >
                  Cập nhật
                </Button>
              </div>
              <div className="h-px bg-[#e6e4db] dark:bg-[#3d3a2a]" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#181711] dark:text-white">
                    Xác thực hai yếu tố
                  </p>
                  <p className="text-xs text-[#8c855f]">
                    Bảo vệ tài khoản của bạn với SMS hoặc ứng dụng
                  </p>
                </div>
                <Switch checked={twoFa} onChange={setTwoFa} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1f1d10] p-8 rounded-[1rem] ">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">link</span>
              <h3 className="text-base font-black text-[#181711] dark:text-white">
                Tài khoản liên kết
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
                    Facebook
                  </p>
                </div>
                <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">check_circle</span>{' '}
                  Đã liên kết
                </span>
              </div>
              <div className="flex items-center justify-between p-3 border border-[#e6e4db] dark:border-[#3d3a2a] rounded-[1rem]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#e6e4db]">
                    <span className="material-symbols-outlined text-sm">work</span>
                  </div>
                  <p className="text-sm font-bold text-[#181711] dark:text-white">
                    Google
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  className="px-0 h-auto text-xs font-bold text-[#181711] dark:text-white hover:underline"
                >
                  Liên kết
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </>
  )
}

export default ProfileSettingsPage

