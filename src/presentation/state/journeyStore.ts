import { create } from 'zustand'

/** Rendering budget, chosen from device capability and adjusted live. */
export type QualityTier = 'high' | 'medium' | 'low' | 'static'

export interface JourneyState {
  /** Global scroll position through the story, 0..1. The single source of truth. */
  progress: number
  /** Id of the chapter currently in view. */
  activeChapterId: string | null
  /** Id of the node the pointer or keyboard is focusing, if any. */
  hoveredNodeId: string | null
  quality: QualityTier

  setProgress: (progress: number) => void
  setActiveChapter: (chapterId: string | null) => void
  setHoveredNode: (nodeId: string | null) => void
  setQuality: (quality: QualityTier) => void
}

/**
 * The bridge between GSAP, R3F and React.
 *
 * GSAP writes `progress` and nothing else — it never touches a Three.js
 * object. The camera rig reads `progress` inside useFrame and interpolates.
 * One writer, one number, no two libraries fighting over the same property.
 */
export const useJourneyStore = create<JourneyState>((set) => ({
  progress: 0,
  activeChapterId: null,
  hoveredNodeId: null,
  quality: 'static',

  setProgress: (progress) => {
    set({ progress })
  },
  setActiveChapter: (activeChapterId) => {
    set((state) => (state.activeChapterId === activeChapterId ? state : { activeChapterId }))
  },
  setHoveredNode: (hoveredNodeId) => {
    set((state) => (state.hoveredNodeId === hoveredNodeId ? state : { hoveredNodeId }))
  },
  setQuality: (quality) => {
    set({ quality })
  },
}))
