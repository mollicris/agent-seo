// src/types.ts - Tipos compartidos del agente SEO

export interface PageData {
  url?: string
  title?: string
  description?: string
  image?: string
  author?: string
}

export interface ValidationRule {
  id: string
  severity: "critical" | "warning" | "info"
  validate(html: string, data?: PageData): boolean
  message: string
  fix?: (html: string) => string
}

export interface Issue {
  id: string
  severity: "critical" | "warning" | "info"
  message: string
  fixable: boolean
}

export interface AuditSummary {
  total_checks: number
  passed: number
  warnings: number
  critical: number
  score: number // 0-100
}

export interface AuditReport {
  url: string
  timestamp: string
  summary: AuditSummary
  issues: Issue[]
  metaTags?: Record<string, string>
  ogTags?: Record<string, string>
  twitterTags?: Record<string, string>
  suggestions?: {
    metaTags?: Record<string, string>
    ogTags?: Record<string, string>
    twitterTags?: Record<string, string>
  }
}

export interface ValidatorConfig {
  enableMetaTags?: boolean
  enableOpenGraph?: boolean
  enableTwitterCard?: boolean
}
