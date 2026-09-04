/**
 * The one vocabulary of node identifiers.
 *
 * These ids used to live privately inside BuildJourney, which meant the
 * network knew that the DOM row labelled "Zellij" and the glowing point in
 * the constellation were the same thing, and had no way to say so. Anything
 * that wants to point at a node — the use case that creates it, a component
 * that wants it to light up — now spells its name the same way.
 *
 * Namespaced so a skill and a project can never collide on a bare id.
 */
export const nodeIds = {
  identity: () => 'identity:root',
  education: (id: string) => `education:${id}`,
  certification: (id: string) => `cert:${id}`,
  role: (id: string) => `role:${id}`,
  skill: (id: string) => `skill:${id}`,
  setup: (id: string) => `setup:${id}`,
  project: (id: string) => `project:${id}`,
  horizon: (id: string) => `horizon:${id}`,
  contact: (kind: string) => `contact:${kind}`,
} as const
