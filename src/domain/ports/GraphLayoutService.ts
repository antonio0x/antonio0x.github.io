import type { Journey } from '../narrative/Journey'
import type { Vec3 } from '../shared/Vec3'

export interface NodePlacement {
  readonly nodeId: string
  readonly position: Vec3
}

/**
 * Turns the narrative graph into coordinates.
 *
 * Strategy port. A radial layout ships today; a force-directed one could
 * replace it without the scene components knowing anything changed.
 */
export interface GraphLayoutService {
  place(journey: Journey): readonly NodePlacement[]
}
