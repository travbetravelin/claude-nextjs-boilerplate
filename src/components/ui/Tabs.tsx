'use client'

import { useState } from 'react'

export interface TabDef {
  key: string
  label: string
  content: React.ReactNode
}

// The underline tab strip. Panels toggle with display: none, never
// conditional render -- switching tabs must not remount content, re-fetch,
// or lose scroll position.
export default function Tabs({ tabs, initial }: { tabs: TabDef[]; initial?: string }) {
  const [active, setActive] = useState(initial ?? tabs[0]?.key)

  return (
    <div>
      <div className="tab-strip">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            className={`tab-strip-btn${active === t.key ? ' active' : ''}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map(t => (
        <div key={t.key} style={{ display: active === t.key ? 'block' : 'none' }}>
          {t.content}
        </div>
      ))}
    </div>
  )
}
