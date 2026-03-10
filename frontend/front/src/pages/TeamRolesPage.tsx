import AuthenticatedLayout from '../layouts/AuthenticatedLayout'

function TeamRolesPage() {
  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">Team Security Verification</h1>
          <p className="mt-2 text-slate-500">Phong cách nội dung lấy từ `verify.html`, tối ưu cho xác minh truy cập đội ngũ.</p>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-4xl">stay_primary_portrait</span>
            </div>
            <h2 className="text-2xl font-bold">Verify your identity</h2>
            <p className="mt-2 max-w-md text-sm text-slate-500">Nhập mã xác minh 6 chữ số trước khi cập nhật vai trò hoặc quyền quản trị.</p>
          </div>

          <div className="mx-auto flex max-w-sm justify-between gap-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <input
                key={idx}
                className="h-14 w-12 rounded-lg border-2 border-slate-200 text-center text-xl font-bold outline-none transition focus:border-primary"
                maxLength={1}
                type="text"
              />
            ))}
          </div>

          <button className="mt-8 w-full rounded-lg bg-primary py-3.5 font-bold text-white hover:bg-primary/90">
            Verify and continue
          </button>
        </section>
      </div>
    </AuthenticatedLayout>
  )
}

export default TeamRolesPage
