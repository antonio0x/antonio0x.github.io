import { requireText } from '../shared/guards'

export interface CertificationProps {
  readonly id: string
  readonly name: string
  /**
   * Nullable on purpose: a CV often lists training without naming the issuer,
   * and inventing one to satisfy a type is how a portfolio starts lying.
   */
  readonly issuer: string | null
}

export class Certification {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly issuer: string | null,
  ) {
    Object.freeze(this)
  }

  static create(props: CertificationProps): Certification {
    const issuer = props.issuer?.trim() ?? ''

    return new Certification(
      requireText(props.id, 'Certification id'),
      requireText(props.name, 'Certification name'),
      issuer.length > 0 ? issuer : null,
    )
  }

  get hasIssuer(): boolean {
    return this.issuer !== null
  }
}
