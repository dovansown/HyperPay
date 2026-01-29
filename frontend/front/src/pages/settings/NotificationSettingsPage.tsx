import { useState } from 'react'
import Button from '../../components/ui/Button'
import Switch from '../../components/ui/Switch'

export function NotificationSettingsPage() {
  const [newTx, setNewTx] = useState(true)
  const [syncErr, setSyncErr] = useState(true)
  const [blocked, setBlocked] = useState(true)
  const [transfer, setTransfer] = useState(false)

  return (
    <div className="max-w-[1300px] mx-auto">
      <header className="p-8 max-w-[1300px] mx-auto w-full">
        <div className="flex items-center gap-2 mb-4 text-[#8c855f] text-sm font-bold">
          <span className="hover:text-primary transition-colors cursor-default">
            Settings
          </span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-[#181711] dark:text-white">Notifications</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-[#181711] dark:text-white text-3xl md:text-4xl font-black tracking-tight mb-4">
              Notification Center
            </h1>
            <p className="text-[#8c855f] dark:text-[#a19b80] text-base font-medium">
              Control how your team stays informed about transaction events, security
              alerts, and system integrations.
            </p>
          </div>
          <button className="bg-primary text-[#181711] font-bold py-3 px-6 rounded-full flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            <span className="material-symbols-outlined">notifications_off</span>
            Mute All Alerts
          </button>
        </div>
      </header>

      <div className="max-w-[1300px] mx-auto w-full px-8">
        <div className="flex border-b border-[#e6e4db] dark:border-[#3d3a2a] gap-10 mb-8 overflow-x-auto">
          <button className="pb-4 border-b-4 border-primary text-[#181711] dark:text-white font-extrabold text-sm flex items-center gap-2 whitespace-nowrap">
            <span className="material-symbols-outlined">webhook</span>
            Webhooks
          </button>
          <button className="pb-4 border-b-4 border-transparent text-[#8c855f] hover:text-[#181711] dark:hover:text-white font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all">
            <span className="material-symbols-outlined">mail</span>
            Email Alerts
          </button>
          <button className="pb-4 border-b-4 border-transparent text-[#8c855f] hover:text-[#181711] dark:hover:text-white font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all">
            <span className="material-symbols-outlined">chat_bubble</span>
            Slack Integration
            <span className="bg-[#181711] text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">
              Pro
            </span>
          </button>
        </div>

        <div className="space-y-8 pb-20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#181711] dark:text-white">
                Webhook Configuration
              </h2>
              <p className="text-[#8c855f] font-medium">
                Define your endpoints and choose which event triggers should be pushed.
              </p>
            </div>
            <button className="bg-[#181711] dark:bg-white dark:text-[#181711] text-white font-bold py-2.5 px-6 rounded-full text-sm hover:opacity-90 transition-opacity">
              Add Endpoint
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#1f1d10] p-6 rounded-lg border border-[#e6e4db] dark:border-[#3d3a2a] flex items-center justify-between group hover:border-primary transition-colors">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-background-light dark:bg-[#2c2918] flex items-center justify-center text-[#181711] dark:text-white group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined">paid</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-[#181711] dark:text-white">
                    New Transaction
                  </h4>
                  <p className="text-sm text-[#8c855f]">payment.succeeded</p>
                </div>
              </div>
              <Switch checked={newTx} onChange={setNewTx} />
            </div>

            <div className="bg-white dark:bg-[#1f1d10] p-6 rounded-lg border border-[#e6e4db] dark:border-[#3d3a2a] flex items-center justify-between group hover:border-primary transition-colors">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-background-light dark:bg-[#2c2918] flex items-center justify-center text-[#181711] dark:text-white group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined">sync_problem</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-[#181711] dark:text-white">
                    Sync Error
                  </h4>
                  <p className="text-sm text-[#8c855f]">bank.sync_failed</p>
                </div>
              </div>
              <Switch checked={syncErr} onChange={setSyncErr} />
            </div>

            <div className="bg-white dark:bg-[#1f1d10] p-6 rounded-lg border border-[#e6e4db] dark:border-[#3d3a2a] flex items-center justify-between group hover:border-primary transition-colors">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-background-light dark:bg-[#2c2918] flex items-center justify-center text-[#181711] dark:text-white group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined">shield_person</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-[#181711] dark:text-white">
                    Account Blocked
                  </h4>
                  <p className="text-sm text-[#8c855f]">risk.account_flagged</p>
                </div>
              </div>
              <Switch checked={blocked} onChange={setBlocked} />
            </div>

            <div className="bg-white dark:bg-[#1f1d10] p-6 rounded-lg border border-[#e6e4db] dark:border-[#3d3a2a] flex items-center justify-between group hover:border-primary transition-colors">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-background-light dark:bg-[#2c2918] flex items-center justify-center text-[#181711] dark:text-white group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined">outbox</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-[#181711] dark:text-white">
                    Transfer Created
                  </h4>
                  <p className="text-sm text-[#8c855f]">transfer.initiated</p>
                </div>
              </div>
              <Switch checked={transfer} onChange={setTransfer} />
            </div>
          </div>

          <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-8 mt-12">
            <div className="flex items-start gap-4">
              <div className="bg-primary p-3 rounded-full">
                <span className="material-symbols-outlined text-[#181711]">vpn_key</span>
              </div>
              <div>
                <h3 className="text-base font-black text-[#181711] mb-2">
                  Endpoint Security
                </h3>
                <p className="text-[#181711]/70 font-medium mb-4">
                  All webhooks are signed with a shared secret to ensure payload integrity.
                  You can rotate your keys anytime in the Developer Portal.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className="rounded-full">Rotate Webhook Secret</Button>
                  <button className="text-[#181711] font-bold text-sm underline decoration-2 underline-offset-4">
                    View Docs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-[18rem] right-0 bg-white/80 dark:bg-[#1a180b]/80 backdrop-blur-md border-t border-[#e6e4db] dark:border-[#3d3a2a] p-4 flex justify-center z-50">
        <div className="max-w-[1300px] w-full flex items-center justify-between">
          <p className="text-[#8c855f] text-sm font-medium hidden sm:block">
            You have unsaved changes in your Slack configuration.
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-full font-bold text-[#8c855f] hover:bg-background-light dark:hover:bg-[#2c2918] transition-colors">
              Discard
            </button>
            <Button className="flex-1 sm:flex-none px-10 py-2.5 !h-auto rounded-full font-black">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationSettingsPage

