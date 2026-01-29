import Card from '../components/ui/Card'
import Switch from '../components/ui/Switch'
import { Table, Thead, Tbody, Th, Td } from '../components/ui/Table'
import Button from '../components/ui/Button'
import AuthenticatedLayout from '../layouts/AuthenticatedLayout'

export function TeamRolesPage() {
  return (
    <AuthenticatedLayout>
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between items-end gap-6 mb-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-primary/20 text-[#a19345] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Admin Panel
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em]">
            Team Roles &amp; Permissions
          </h1>
          <p className="text-[#a19345] dark:text-gray-400 text-base font-medium">
            Manage 12 active seats and granular access levels for your banking team.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-2 rounded-full border border-[#f4f2e6] dark:border-white/10">
          <Button variant="secondary" size="sm">
            Export Audit Log
          </Button>
          <Button size="sm">Add Custom Role</Button>
        </div>
      </div>

      {/* Chips / Filters */}
      <div className="flex gap-3 mb-8 flex-wrap overflow-x-auto pb-2">
        <Button variant="primary" size="sm">
          All Members (12)
        </Button>
        <Button variant="secondary" size="sm">
          Admins (3)
        </Button>
        <Button variant="secondary" size="sm">
          Developers (5)
        </Button>
        <Button variant="secondary" size="sm">
          Viewers (4)
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-[#a19345] font-medium italic">
            Showing 1-8 of 12
          </span>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-bold tracking-tight">Access Control Cards</h2>
        <div className="flex items-center gap-2 text-[#a19345]">
          <span className="material-symbols-outlined text-xl">info</span>
          <span className="text-sm font-medium">Changes take effect immediately</span>
        </div>
      </div>

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {/* Card 1: Admin */}
        <Card className="hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div
                className="size-12 rounded-full border-2 border-primary bg-cover bg-center"
                data-alt="Avatar of Alex Rivera"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuALXlO5sj0WgLvxhU_nkKczPQHedfV47ILWvt3VisKWbpXICeQf2YhMNbb9ZKIX0m6611GQoBFl4o13ZtdwozG3WKtmsT-gfpDvS9nkIEcllQCpNr98FW7GYXeR0LxUTqinkr7qh0uHiFE7pSbx0JeL74YyFPZR0vvxuzFm4LXXYcjmYTv_TegclNsmriiF_kf-IAeg8hv1d2syHjBsiqlF-jxRk49f2nuPUIW3fHubcvjbCsZLjGEZ8TK8bXEQg472g9RCCUQvqEml')",
                }}
              />
              <div>
                <h3 className="font-bold text-base">Alex Rivera</h3>
                <p className="text-xs text-[#a19345] font-medium">alex@fintech.so</p>
              </div>
            </div>
            <div className="bg-black text-white text-[10px] font-black uppercase px-2 py-1 rounded-full">
              Admin
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">All Bank Accounts</span>
              <Switch checked={true} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Manage API Keys</span>
              <Switch checked={true} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Initiate Transfers</span>
              <Switch checked={true} onChange={() => {}} />
            </div>
          </div>
          <button className="w-full mt-6 py-3 rounded-full bg-[#f4f2e6] dark:bg-white/10 text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#eae5cd] transition-colors">
            <span className="material-symbols-outlined text-base">settings</span> Edit Detailed
            Access
          </button>
        </Card>

        {/* Card 2: Developer */}
        <Card className="hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div
                className="size-12 rounded-full border-2 border-gray-200 bg-cover bg-center"
                data-alt="Avatar of Jordan Lee"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCfi8s46zQPB6DZAfRGdy5wlklZfz0iQ2L9o6MF8t26RvWKkXCv-1Leq2v6FKKZ-P-3TUt0bYxbhyzB_SFnNsUYOXE3oTIN7J4wC8_EYCmEOr4mNu8uPeGPCyHM9PaaMNJNn_BudhzUnBbWVjb_tDa6yetFtA94ljCo9nV36Fi5ZdX_lL9EMcA1WYk_KcTxm9fd-rrg6RuPMfkmqBNQzU6H53vNLFp4cVgKUmpR-AIh4ussrBa1xj5KaPQ40V9W2CHuQCxYrcdBsrjU')",
                }}
              />
              <div>
                <h3 className="font-bold text-base">Jordan Lee</h3>
                <p className="text-xs text-[#a19345] font-medium">jordan@dev.fintech.so</p>
              </div>
            </div>
            <div className="bg-[#f4f2e6] dark:bg-white/20 text-[#1d1a0c] dark:text-white text-[10px] font-black uppercase px-2 py-1 rounded-full">
              Developer
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Sandbox Access</span>
              <Switch checked={true} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Read-only Prod Logs</span>
              <Switch checked={true} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-sm font-semibold">Initiate Transfers</span>
              <Switch checked={false} onChange={() => {}} />
            </div>
          </div>
          <button className="w-full mt-6 py-3 rounded-full bg-[#f4f2e6] dark:bg-white/10 text-sm font-bold flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">settings</span> Edit Detailed
            Access
          </button>
        </Card>

        {/* Card 3: Viewer */}
        <Card className="hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div
                className="size-12 rounded-full border-2 border-gray-200 bg-cover bg-center"
                data-alt="Avatar of Taylor Smith"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCH5A6BhxbKu880mk5kY1gFAnJPUBNW3XdwLBE2ywmudrJHyeflUtLHBpBp1E-OIJoZgtulG4LU8nwXsRBWDZF9q2K1H7J0XBmAm4D0G9hstEowWLIzfzhPeiVF0oRvDw90RE0Y0FniJXoBmxhUwPusu4hS8dh0rW_ijXSTDOBB90xNojK0jv1KH7RErMRhV-olNIO3T8AOyt9LzS3ZZyHbm_kVluPjH6lBrwlOs8iGOiXrU918FaoYyzjR-zztCNdm-0K41Uxz6uCI')",
                }}
              />
              <div>
                <h3 className="font-bold text-base">Taylor Smith</h3>
                <p className="text-xs text-[#a19345] font-medium">taylor@finance.fintech.so</p>
              </div>
            </div>
            <div className="bg-[#f4f2e6] dark:bg-white/20 text-[#1d1a0c] dark:text-white text-[10px] font-black uppercase px-2 py-1 rounded-full">
              Viewer
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">View Statements</span>
              <Switch checked={true} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-sm font-semibold">Manage API Keys</span>
              <Switch checked={false} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-sm font-semibold">Initiate Transfers</span>
              <Switch checked={false} onChange={() => {}} />
            </div>
          </div>
          <button className="w-full mt-6 py-3 rounded-full bg-[#f4f2e6] dark:bg-white/10 text-sm font-bold flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">settings</span> Edit Detailed
            Access
          </button>
        </Card>
      </div>

      {/* Table View Section */}
      <div className="mt-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold tracking-tight">Detailed Permission Controls</h2>
          <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-[#f4f2e6] dark:border-white/10 rounded-full px-4 py-2">
            <span className="material-symbols-outlined text-base text-primary">filter_list</span>
            <select className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer">
              <option>Sort by: Name</option>
              <option>Sort by: Role</option>
              <option>Sort by: Recent Activity</option>
            </select>
          </div>
        </div>
        <Table>
          <Thead>
            <tr>
              <Th>Member</Th>
              <Th>Role</Th>
              <Th>Account Access</Th>
              <Th>Permissions</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </Thead>
          <Tbody>
            <tr className="hover:bg-[#fcfbf8] dark:hover:bg-white/5 transition-colors">
              <Td>
                <div className="flex items-center gap-3">
                  <div
                    className="size-8 rounded-full bg-cover bg-center"
                    data-alt="Avatar of Alex Rivera"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA70tNX5_gat8i5ooqA9tcTzVtD66IZ_vUZXzojipyHfYAERRIwKKi3jg8GoJbspkLc3RySt2gtk_Zh4GruLxTEYzZkLCvepbmm8fm74N-yX3DgkrUtPSi6TeUESkl1-DLgGpVol87gnYYUrFRirjFU4Dhu26kkQNQ9QipD4P5cPdNQSkpzYgBSzEhHRLO_rpWLNf4ZaW0e5YWShRkHOIvFyKRkWcMaIdIupE992jQldJw7Cerf7XzxiP2q8WGZXT4KzzzvNrQZ_6i5')",
                    }}
                  />
                  <span className="font-bold">Alex Rivera</span>
                </div>
              </Td>
              <Td>
                <span className="bg-black text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
                  Admin
                </span>
              </Td>
              <Td className="text-sm font-medium">All Accounts (5/5)</Td>
              <Td>
                <div className="flex gap-1">
                  <span className="material-symbols-outlined text-primary text-sm">
                    check_circle
                  </span>
                  <span className="text-sm font-bold">Manage All</span>
                </div>
              </Td>
              <Td className="text-right">
                <button className="text-sm font-black text-[#a19345] hover:text-black dark:hover:text-white underline underline-offset-4 transition-colors">
                  Edit
                </button>
              </Td>
            </tr>
            <tr className="hover:bg-[#fcfbf8] dark:hover:bg-white/5 transition-colors">
              <Td>
                <div className="flex items-center gap-3">
                  <div
                    className="size-8 rounded-full bg-cover bg-center"
                    data-alt="Avatar of Jordan Lee"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCpb8ECIOckReIZRr-QQPKV5Q9xGNZxi4cfIIYdCBlp_3LfeuiS1XhoPIJ9vKeObhjOMSCTYNh5Wiyf2OdMfYZB5VjW-SbM1qezLzgDJlamCW4ql66k64Ed41SKZORJpt5NOLjH7DLdgKD4lVRzCgaQX4tb_BM5ojSRWuPocrjZGeCJze7YIZ6-4tdvFRV8cm-5yu2Opm4qF5FNDS3Ll8dy5x4GRId_PBoVE80gzthQgq-1CNjUn8qwK6LJ1MDs3VtjyLzjS4eUlXLB')",
                    }}
                  />
                  <span className="font-bold">Jordan Lee</span>
                </div>
              </Td>
              <Td>
                <span className="bg-[#f4f2e6] dark:bg-white/20 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                  Developer
                </span>
              </Td>
              <Td className="text-sm font-medium">3/5 Accounts</Td>
              <Td>
                <div className="flex gap-1">
                  <span className="material-symbols-outlined text-[#a19345] text-sm">
                    vpn_key
                  </span>
                  <span className="text-sm font-bold">API Access</span>
                </div>
              </Td>
              <Td className="text-right">
                <button className="text-sm font-black text-[#a19345] hover:text-black dark:hover:text-white underline underline-offset-4 transition-colors">
                  Edit
                </button>
              </Td>
            </tr>
            <tr className="hover:bg-[#fcfbf8] dark:hover:bg-white/5 transition-colors">
              <Td>
                <div className="flex items-center gap-3">
                  <div
                    className="size-8 rounded-full bg-cover bg-center"
                    data-alt="Avatar of Taylor Smith"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCbzO0M6Q9G5VcvgwFvC8ZGwSINWOzd4PGsPsBTgjouc2tXsrEAnyVzgUUiDlkG91LmL8u7nyAQ3vJketHybZsNeJRYzZM-meX4p1cM_NTex-jD-WcCmuuFCNm4UTjxSSEgQGIE4hWypejKJMZLI2xtvzRZMiHjjPd4m8_fSS2S_tQ1bdQFuCpi4YfjcvQ5TudIkT5Rqnt0976XRslGgAwCsn3a1Araut8RwGxR_FzHdcjBdvSy_MdGE_Gvkrpcw2qtm_mswrctVSo0')",
                    }}
                  />
                  <span className="font-bold">Taylor Smith</span>
                </div>
              </Td>
              <Td>
                <span className="bg-[#f4f2e6] dark:bg-white/20 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                  Viewer
                </span>
              </Td>
              <Td className="text-sm font-medium">1/5 Accounts</Td>
              <Td>
                <div className="flex gap-1">
                  <span className="material-symbols-outlined text-[#a19345] text-sm">
                    visibility
                  </span>
                  <span className="text-sm font-bold">View Only</span>
                </div>
              </Td>
              <Td className="text-right">
                <button className="text-sm font-black text-[#a19345] hover:text-black dark:hover:text-white underline underline-offset-4 transition-colors">
                  Edit
                </button>
              </Td>
            </tr>
          </Tbody>
        </Table>
      </div>

      {/* Footer Meta block in original design */}
      <div className="mt-20 flex flex-col items-center justify-center text-center gap-4 py-10 border-t border-[#f4f2e6] dark:border-white/10">
        <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">security</span>
        </div>
        <h4 className="font-bold text-base">Bank-Grade Security Controls</h4>
        <p className="text-[#a19345] dark:text-gray-400 max-w-md mx-auto text-sm">
          All permission changes are recorded in the audit trail. Multi-factor
          authentication is required for Admin role assignments.
        </p>
        <a className="text-primary font-bold text-sm underline underline-offset-4" href="#">
          Learn more about API security
        </a>
      </div>
    </AuthenticatedLayout>
  )
}

export default TeamRolesPage

