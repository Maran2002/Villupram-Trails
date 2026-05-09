import { Card } from '@/components/common/Card'

export function StatsCard({ label, value, icon }) {
  return (
    <Card className="flex items-center p-6 space-x-4">
      <div className="p-3 bg-primary-100 text-primary-600 rounded-lg text-2xl">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
      </div>
    </Card>
  )
}
