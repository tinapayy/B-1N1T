import { Home, LineChart, HelpCircle, Settings } from "lucide-react"

export default function Sidebar() {
  return (
    <aside className="w-[240px] bg-[#FF5722] text-white p-6">
      <div className="flex items-center gap-2 mb-12">
        <span className="text-2xl font-bold">B-1N1T</span>
      </div>

      <nav className="space-y-4">
        <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10">
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </a>

        <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10">
          <LineChart className="w-5 h-5" />
          <span>Analytics</span>
        </a>

        <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10">
          <HelpCircle className="w-5 h-5" />
          <span>FAQs</span>
        </a>

        <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </a>
      </nav>
    </aside>
  )
}
