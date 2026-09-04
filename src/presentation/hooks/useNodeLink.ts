import { useCallback, useMemo } from 'react'
import { useJourneyStore } from '../state/journeyStore'

/**
 * Ties one element in the document to its point in the network.
 *
 * Every item the visitor reads — a skill, a project, a piece of the workshop —
 * already has a twin in the 3D layer, built from the same id by the same use
 * case. Until now that correspondence was computed and then thrown away at the
 * boundary: the only thing the document told the scene was which chapter was
 * on screen, so the two layers shared a space without ever sharing a subject.
 *
 * This is the missing wire. Pointing at a row lights its node, its
 * connections, and everything on the other end of them — which is the only way
 * a visitor ever finds out that the constellation behind the text is a diagram
 * of what they are reading rather than a screensaver.
 *
 * Keyboard first, not mouse only. Focus and blur carry the same weight as
 * enter and leave, so tabbing through the page drives the network exactly as
 * a pointer does.
 */
export function useNodeLink(nodeId: string) {
  const setHoveredNode = useJourneyStore((state) => state.setHoveredNode)

  const engage = useCallback(() => {
    setHoveredNode(nodeId)
  }, [nodeId, setHoveredNode])

  const release = useCallback(() => {
    setHoveredNode(null)
  }, [setHoveredNode])

  return useMemo(
    () => ({
      /* Also the styling hook for the connector mark; see global.css. */
      'data-node': nodeId,
      onPointerEnter: engage,
      onPointerLeave: release,
      onFocus: engage,
      onBlur: release,
    }),
    [nodeId, engage, release],
  )
}
