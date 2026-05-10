'use client'

import { useState } from 'react'
import { Save, Info } from 'lucide-react'

const settingSections = [
  {
    title: 'Platform Identity',
    description: 'Basic platform name and branding configuration.',
    fields: [
      { id: 'platform_name', label: 'Platform Name', type: 'text', defaultValue: 'Villupuram Discovery Hub' },
      { id: 'tagline', label: 'Tagline', type: 'text', defaultValue: 'Unearth Hidden Gems of Tamil Nadu' },
    ]
  },
  {
    title: 'Contribution Settings',
    description: 'Control how community contributions are handled.',
    fields: [
      { id: 'require_approval', label: 'Require approval for new places', type: 'toggle', defaultValue: true },
      { id: 'require_verification', label: 'Require account verification to contribute', type: 'toggle', defaultValue: true },
      { id: 'min_review_length', label: 'Minimum review length (characters)', type: 'number', defaultValue: 50 },
    ]
  },
  {
    title: 'Points & Gamification',
    description: 'Configure the points system for contributor rewards.',
    fields: [
      { id: 'points_place', label: 'Points for approved place', type: 'number', defaultValue: 100 },
      { id: 'points_review', label: 'Points for approved review', type: 'number', defaultValue: 20 },
      { id: 'points_photo', label: 'Points for photo upload', type: 'number', defaultValue: 10 },
    ]
  }
]

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-1">Platform Settings</h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Configure global platform behaviour and community guidelines.</p>
      </div>

      {settingSections.map((section) => (
        <div key={section.title} className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 p-6 shadow-sm">
          <h3 className="font-serif font-bold text-lg text-neutral-900 dark:text-white mb-1">{section.title}</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">{section.description}</p>
          <div className="space-y-5">
            {section.fields.map((field) => (
              <div key={field.id} className="flex items-center justify-between gap-6">
                <label htmlFor={field.id} className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex-1">
                  {field.label}
                </label>
                {field.type === 'toggle' ? (
                  <div className="w-11 h-6 bg-primary-500 rounded-full relative cursor-pointer shrink-0">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow" />
                  </div>
                ) : (
                  <input
                    id={field.id}
                    type={field.type}
                    defaultValue={field.defaultValue}
                    className="w-52 px-3 py-2 text-sm bg-neutral-50 dark:bg-dark-700 border border-neutral-200 dark:border-dark-600 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Save size={16} />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
        {saved && (
          <p className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
            <Info size={14} /> Settings saved successfully.
          </p>
        )}
      </div>
    </div>
  )
}
