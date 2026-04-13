export interface Chapter {
  id: number
  startYear: number
  endYear: number | null
  title: string
  subtitle: string
  company: string
  location: string
  color: string
  tags: readonly string[]
  content: string
}

export interface Capability {
  domain: string
  headline: string
  statement: string
  tools: readonly string[]
  proofPoint: string
  color: string
}
