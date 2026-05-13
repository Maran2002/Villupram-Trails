'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, Filter, RefreshCcw, Monitor, Smartphone, 
  Tablet, Globe, Eye, Users, MousePointer, ExternalLink,
  ChevronLeft, ChevronRight, Search
} from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  BarChart, Bar, Legend
} from 'recharts'
import { useAuthStore } from '@/lib/store'
import { format } from 'date-fns'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

import { WithPermission } from '@/components/admin/WithPermission'

export default function VisitorLogsPage() {
  const token = useAuthStore((s) => s.token)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  const fetchData = async () => {
    setLoading(true)
    try {
      const t = token || localStorage.getItem('auth_token')
      const res = await fetch(`/api/admin/logs?days=${days}`, {
        headers: { Authorization: `Bearer ${t}` }
      })
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      }
    } catch (err) {
      console.error('Failed to fetch logs', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [days, token])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCcw className="animate-spin text-primary-500" size={32} />
      </div>
    )
  }

  const { dailyVisits, deviceStats, pageStats, browserStats, summary, logs } = data || {}

  return (
    <WithPermission module="logs" action="view">
      <div className="space-y-8 pb-12">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white">Visitor Analytics</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
              Real-time insights into how users are interacting with the platform.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-dark-800 p-1.5 rounded-xl border border-neutral-200 dark:border-dark-700 shadow-sm">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  days === d 
                    ? 'bg-primary-500 text-white shadow-md' 
                    : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-dark-700'
                }`}
              >
                {d === 7 ? 'Last Week' : d === 30 ? 'Last Month' : 'Last Quarter'}
              </button>
            ))}
            <button 
              onClick={fetchData}
              className="p-1.5 hover:bg-neutral-50 dark:hover:bg-dark-700 rounded-lg text-neutral-400 transition-colors"
              title="Refresh data"
            >
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <QuickStat 
            label="Total Sessions" 
            value={summary?.totalVisits} 
            icon={Eye} 
            trend="+12%" 
            color="indigo" 
          />
          <QuickStat 
            label="Unique Visitors" 
            value={summary?.uniqueVisitors} 
            icon={Users} 
            trend="+5%" 
            color="emerald" 
          />
          <QuickStat 
            label="Avg. Pages/Visit" 
            value={(summary?.totalVisits / (summary?.uniqueVisitors || 1)).toFixed(1)} 
            icon={MousePointer} 
            trend="-2%" 
            color="amber" 
          />
          <QuickStat 
            label="Bounce Rate" 
            value="42%" 
            icon={RefreshCcw} 
            trend="-5%" 
            color="rose" 
          />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Traffic Over Time */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-2xl p-6 border border-neutral-200 dark:border-dark-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif font-bold text-lg text-neutral-900 dark:text-white">Traffic Overview</h3>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-primary-500" />
                  <span className="text-neutral-500">Total Visits</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-neutral-500">Unique</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyVisits}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="count" name="Total Visits" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                  <Area type="monotone" dataKey="unique" name="Unique" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUnique)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Device Distribution */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-neutral-200 dark:border-dark-700 shadow-sm">
            <h3 className="font-serif font-bold text-lg text-neutral-900 dark:text-white mb-6">Devices</h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceStats?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
              {deviceStats?.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-neutral-600 dark:text-neutral-400 capitalize">{item.name}</span>
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 dark:border-dark-700 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-neutral-900 dark:text-white">Most Visited Pages</h3>
              <button className="text-primary-500 text-sm hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-dark-900/50 text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-3">Page Path</th>
                    <th className="px-6 py-3 text-right">Views</th>
                    <th className="px-6 py-3 text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-dark-700">
                  {pageStats?.map((page, i) => (
                    <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-dark-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Globe size={14} className="text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[200px]">
                            {page.path}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-neutral-900 dark:text-white">
                        {page.count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                          +{(Math.random() * 20).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Browser Stats */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-neutral-200 dark:border-dark-700 shadow-sm">
            <h3 className="font-serif font-bold text-lg text-neutral-900 dark:text-white mb-6">Browsers & OS</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={browserStats} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#6366f1" barSize={20}>
                    {browserStats?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Logs Table */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 dark:border-dark-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-serif font-bold text-lg text-neutral-900 dark:text-white">Recent Sessions</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input 
                type="text" 
                placeholder="Search IP or path..."
                className="pl-10 pr-4 py-2 bg-neutral-100 dark:bg-dark-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-50 dark:bg-dark-900/50 text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3 text-center">Time</th>
                  <th className="px-6 py-3">Visitor Info</th>
                  <th className="px-6 py-3">Path</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-dark-700">
                {logs?.map((log, i) => (
                  <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-dark-700/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {format(new Date(log.timestamp), 'HH:mm')}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {format(new Date(log.timestamp), 'MMM dd')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-mono">
                          {log.ip}
                        </span>
                        <span className="text-[10px] text-neutral-400 truncate max-w-[200px]">
                          {log.browser} • {log.os} • {log.device}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-dark-700 rounded text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">GET</span>
                        <span className="truncate max-w-[150px]">{log.path}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-neutral-400 hover:text-primary-500 transition-colors">
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-neutral-100 dark:border-dark-700 flex items-center justify-between">
            <p className="text-xs text-neutral-500">Showing last 100 activities</p>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg border border-neutral-200 dark:border-dark-700 disabled:opacity-30" disabled>
                <ChevronLeft size={16} />
              </button>
              <button className="p-1.5 rounded-lg border border-neutral-200 dark:border-dark-700 hover:bg-neutral-50 dark:hover:bg-dark-700">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </WithPermission>
  )
}

function QuickStat({ label, value, icon: Icon, trend, color }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-neutral-200 dark:border-dark-700 shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend}
        </span>
      </div>
      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
        {value !== undefined ? value : '...'}
      </p>
    </motion.div>
  )
}
