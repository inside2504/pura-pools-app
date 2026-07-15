'use client'

import { useEffect, useRef } from 'react'

type TickerItem = {
  teamName: string
  conference: string
  ownerName: string
  isNew?: boolean
}

type Props = {
  items: TickerItem[]
}

export function DraftTicker({ items }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const posRef = useRef(0)
  const rafRef = useRef<number>()

  useEffect(() => {
    const track = trackRef.current
    if (!track || items.length === 0) return

    function animate() {
      if (!track) return
      posRef.current -= 0.5
      const halfWidth = track.scrollWidth / 2
      if (Math.abs(posRef.current) >= halfWidth) {
        posRef.current = 0
      }
      track.style.transform = `translateX(${posRef.current}px)`
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [items])

  if (items.length === 0) return null

  const doubled = [...items, ...items]

  return (
    <div className="bg-blue-900 rounded-xl overflow-hidden flex items-stretch mb-4">
      <div className="bg-blue-700 px-4 flex items-center shrink-0">
        <span className="text-blue-200 text-xs font-medium uppercase tracking-widest">
          En vivo
        </span>
      </div>
      <div className="flex-1 overflow-hidden h-10">
        <div ref={trackRef} className="flex items-center h-full whitespace-nowrap">
          {doubled.map((item, i) => (
            <div
              key={i}
              className={`
                inline-flex items-center gap-2 px-5 h-full border-r border-blue-800 text-sm
                ${item.isNew ? 'bg-emerald-800' : ''}
              `}
            >
              <span className={`
                text-xs px-1.5 py-0.5 rounded font-medium
                ${item.conference === 'AFC' ? 'bg-blue-600 text-blue-100' : 'bg-green-700 text-green-100'}
              `}>
                {item.conference}
              </span>
              <span className="text-white font-medium">{item.teamName}</span>
              <span className="text-blue-300">→</span>
              <span className="text-emerald-300">{item.ownerName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}