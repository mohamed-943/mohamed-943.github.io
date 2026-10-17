import type { JSX } from 'react'
import type { CoverKind } from '../../data/types'
import ReputationCover from './ReputationCover'
import ClinicalCover from './ClinicalCover'
import SentinelCover from './SentinelCover'
import RagCover from './RagCover'
import EnergyCover from './EnergyCover'
import TradingCover from './TradingCover'
import './covers.css'

const MAP: Record<CoverKind, (p: { active: boolean }) => JSX.Element> = {
  reputation: ReputationCover,
  clinical: ClinicalCover,
  sentinel: SentinelCover,
  rag: RagCover,
  energy: EnergyCover,
  trading: TradingCover,
}

/** Couverture animée (motion design SVG + GSAP) d'un projet. */
export default function ProjectCover({ kind, active = true, className = '' }: { kind: CoverKind; active?: boolean; className?: string }) {
  const Cover = MAP[kind]
  return (
    <div className={`cover ${className}`}>
      <Cover active={active} />
    </div>
  )
}
