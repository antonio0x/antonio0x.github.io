import { Certification } from '@domain/profile/Certification'
import { CHANNEL_KINDS, ContactChannel } from '@domain/profile/ContactChannel'
import { EDUCATION_STATUSES, Education } from '@domain/profile/Education'
import { Experience, WORK_MODES } from '@domain/profile/Experience'
import { Period } from '@domain/profile/Period'
import { Portrait } from '@domain/profile/Portrait'
import { Profile } from '@domain/profile/Profile'
import { SETUP_CATEGORIES, SetupItem } from '@domain/profile/SetupItem'
import { PROFICIENCIES, SKILL_CATEGORIES, Skill } from '@domain/profile/Skill'
import type { ProfileRepository } from '@domain/ports/ProfileRepository'
import type { Locale } from '@domain/shared/Locale'
import profileEn from '@content/profile.en.json'
import profileEs from '@content/profile.es.json'
import { oneOf } from './parse'

/** The shape of the JSON on disk, before it becomes a domain object. */
type RawProfile = typeof profileEs

const BY_LOCALE: Readonly<Record<Locale, RawProfile>> = {
  es: profileEs,
  en: profileEn,
}

function toProfile(raw: RawProfile): Profile {
  return Profile.create({
    fullName: raw.fullName,
    displayName: raw.displayName,
    headline: raw.headline,
    location: raw.location,
    summary: raw.summary,

    skills: raw.skills.map((skill) =>
      Skill.create({
        id: skill.id,
        name: skill.name,
        category: oneOf(SKILL_CATEGORIES, skill.category, `Skill "${skill.id}" category`),
        proficiency: oneOf(PROFICIENCIES, skill.proficiency, `Skill "${skill.id}" proficiency`),
      }),
    ),

    experiences: raw.experiences.map((experience) =>
      Experience.create({
        id: experience.id,
        organization: experience.organization,
        role: experience.role,
        period: Period.create(experience.period.start, experience.period.end),
        mode: oneOf(WORK_MODES, experience.mode, `Experience "${experience.id}" mode`),
        highlights: experience.highlights,
        skillIds: experience.skillIds,
      }),
    ),

    education: raw.education.map((education) =>
      Education.create({
        id: education.id,
        institution: education.institution,
        program: education.program,
        period: Period.create(education.period.start, education.period.end),
        status: oneOf(EDUCATION_STATUSES, education.status, `Education "${education.id}" status`),
      }),
    ),

    certifications: raw.certifications.map((certification) =>
      Certification.create({
        id: certification.id,
        name: certification.name,
        issuer: certification.issuer,
      }),
    ),

    channels: raw.channels.map((channel, index) =>
      ContactChannel.create({
        kind: oneOf(CHANNEL_KINDS, channel.kind, `Contact channel #${index} kind`),
        label: channel.label,
        href: channel.href,
      }),
    ),

    languages: raw.languages,

    portrait: Portrait.create({
      src: raw.portrait.src,
      webpSrc: raw.portrait.webpSrc,
      alt: raw.portrait.alt,
      width: raw.portrait.width,
      height: raw.portrait.height,
    }),

    setup: raw.setup.map((item) =>
      SetupItem.create({
        id: item.id,
        name: item.name,
        category: oneOf(SETUP_CATEGORIES, item.category, `Setup item "${item.id}" category`),
        note: item.note,
        url: item.url,
      }),
    ),
  })
}

/**
 * Reads the profile from JSON bundled at build time.
 *
 * Results are memoised because the content cannot change at runtime and
 * constructing the aggregate re-runs every invariant in the domain.
 */
export class StaticProfileRepository implements ProfileRepository {
  private readonly cache = new Map<Locale, Profile>()

  load(locale: Locale): Promise<Profile> {
    const cached = this.cache.get(locale)
    if (cached !== undefined) {
      return Promise.resolve(cached)
    }

    const profile = toProfile(BY_LOCALE[locale])
    this.cache.set(locale, profile)
    return Promise.resolve(profile)
  }
}
