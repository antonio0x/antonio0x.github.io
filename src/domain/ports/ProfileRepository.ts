import type { Profile } from '../profile/Profile'
import type { Locale } from '../shared/Locale'

/**
 * Where the profile comes from.
 *
 * Today a bundled JSON file. Tomorrow a CMS or an API — and nothing inside the
 * domain or the use cases would change, which is the entire point of the port.
 */
export interface ProfileRepository {
  load(locale: Locale): Promise<Profile>
}
