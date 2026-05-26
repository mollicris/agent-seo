// validators/index.ts - Agregador SEO (orquesta todos los validadores)

import { MetaTagValidator, metaTagRules } from "./meta-tags"
import { OpenGraphValidator, openGraphRules } from "./open-graph"
import { TwitterCardValidator, twitterCardRules } from "./twitter-card"
import {
  AuditReport,
  AuditSummary,
  Issue,
  PageData,
  ValidatorConfig,
} from "../types"

export {
  MetaTagValidator,
  OpenGraphValidator,
  TwitterCardValidator,
  metaTagRules,
  openGraphRules,
  twitterCardRules,
}

export class SEOValidator {
  private metaTagValidator: MetaTagValidator
  private openGraphValidator: OpenGraphValidator
  private twitterCardValidator: TwitterCardValidator
  private config: ValidatorConfig

  constructor(config: ValidatorConfig = {}) {
    this.metaTagValidator = new MetaTagValidator()
    this.openGraphValidator = new OpenGraphValidator()
    this.twitterCardValidator = new TwitterCardValidator()
    this.config = {
      enableMetaTags: true,
      enableOpenGraph: true,
      enableTwitterCard: true,
      ...config,
    }
  }

  /**
   * Auditoría completa: Meta Tags + Open Graph + Twitter Card
   */
  auditAll(html: string, pageData?: PageData): AuditReport {
    const issues: Issue[] = []

    // Auditar cada validador
    if (this.config.enableMetaTags) {
      const metaIssues = this.auditMetaTags(html, pageData)
      issues.push(...metaIssues)
    }

    if (this.config.enableOpenGraph) {
      const ogIssues = this.auditOpenGraph(html, pageData)
      issues.push(...ogIssues)
    }

    if (this.config.enableTwitterCard) {
      const twitterIssues = this.auditTwitterCard(html, pageData)
      issues.push(...twitterIssues)
    }

    // Calcular resumen
    const summary = this.calculateSummary(issues)

    // Extraer tags
    const metaTags = this.metaTagValidator.extractMetaTags(html)
    const ogTags = this.openGraphValidator.extractOpenGraphTags(html)
    const twitterTags = this.twitterCardValidator.extractTwitterTags(html)

    // Generar sugerencias
    const suggestions = this.getSuggestions(html, pageData)

    return {
      url: pageData?.url || "unknown",
      timestamp: new Date().toISOString(),
      summary,
      issues,
      metaTags,
      ogTags,
      twitterTags,
      suggestions,
    }
  }

  /**
   * Auditoría de Meta Tags
   */
  auditMetaTags(html: string, pageData?: PageData): Issue[] {
    return this.metaTagValidator.getIssues(html, pageData).map((issue) => ({
      ...issue,
      fixable: !!metaTagRules.find((r) => r.id === issue.id)?.fix,
    }))
  }

  /**
   * Auditoría de Open Graph
   */
  auditOpenGraph(html: string, pageData?: PageData): Issue[] {
    return this.openGraphValidator.getIssues(html, pageData).map((issue) => ({
      ...issue,
      fixable: !!openGraphRules.find((r) => r.id === issue.id)?.fix,
    }))
  }

  /**
   * Auditoría de Twitter Card
   */
  auditTwitterCard(html: string, pageData?: PageData): Issue[] {
    return this.twitterCardValidator.getIssues(html, pageData).map((issue) => ({
      ...issue,
      fixable: !!twitterCardRules.find((r) => r.id === issue.id)?.fix,
    }))
  }

  /**
   * Obtener sugerencias de fixes para todos los validadores
   */
  getSuggestions(html: string, pageData?: PageData) {
    return {
      metaTags: this.metaTagValidator.suggestMetaTags(html, pageData),
      ogTags: this.openGraphValidator.suggestOpenGraphTags(html, pageData),
      twitterTags: this.twitterCardValidator.suggestTwitterTags(html, pageData),
    }
  }

  /**
   * Calcular resumen de auditoría
   */
  private calculateSummary(issues: Issue[]): AuditSummary {
    const totalChecks = metaTagRules.length + openGraphRules.length + twitterCardRules.length
    const criticalCount = issues.filter((i) => i.severity === "critical").length
    const warningCount = issues.filter((i) => i.severity === "warning").length
    const passedCount = totalChecks - issues.length

    return {
      total_checks: totalChecks,
      passed: passedCount,
      warnings: warningCount,
      critical: criticalCount,
      score: Math.round((passedCount / totalChecks) * 100),
    }
  }

  /**
   * Aplicar fixes automáticos para problemas fixables
   */
  applyFixes(html: string, issueIds: string[]): string {
    let modified = html

    for (const issueId of issueIds) {
      // Buscar en meta tags
      const metaRule = metaTagRules.find((r) => r.id === issueId)
      if (metaRule?.fix) {
        modified = metaRule.fix(modified)
        continue
      }

      // Buscar en OG
      const ogRule = openGraphRules.find((r) => r.id === issueId)
      if (ogRule?.fix) {
        modified = ogRule.fix(modified)
        continue
      }

      // Buscar en Twitter
      const twitterRule = twitterCardRules.find((r) => r.id === issueId)
      if (twitterRule?.fix) {
        modified = twitterRule.fix(modified)
        continue
      }
    }

    return modified
  }

  /**
   * Generar reporte en formato Markdown
   */
  formatReport(report: AuditReport): string {
    const lines: string[] = []

    lines.push(`# SEO Audit Report`)
    lines.push(`**URL:** ${report.url}`)
    lines.push(`**Timestamp:** ${report.timestamp}`)
    lines.push(`**Score:** ${report.summary.score}/100`)
    lines.push(``)

    lines.push(`## Summary`)
    lines.push(`- Total Checks: ${report.summary.total_checks}`)
    lines.push(`- Passed: ${report.summary.passed} ✅`)
    lines.push(`- Warnings: ${report.summary.warnings} ⚠️`)
    lines.push(`- Critical: ${report.summary.critical} 🔴`)
    lines.push(``)

    if (report.issues.length > 0) {
      lines.push(`## Issues Found`)

      // Agrupar por severidad
      const critical = report.issues.filter((i) => i.severity === "critical")
      const warnings = report.issues.filter((i) => i.severity === "warning")
      const info = report.issues.filter((i) => i.severity === "info")

      if (critical.length > 0) {
        lines.push(`### 🔴 Critical (${critical.length})`)
        critical.forEach((issue) => {
          lines.push(`- **${issue.id}**: ${issue.message}`)
        })
        lines.push(``)
      }

      if (warnings.length > 0) {
        lines.push(`### ⚠️ Warnings (${warnings.length})`)
        warnings.forEach((issue) => {
          lines.push(`- **${issue.id}**: ${issue.message}`)
        })
        lines.push(``)
      }

      if (info.length > 0) {
        lines.push(`### ℹ️ Info (${info.length})`)
        info.forEach((issue) => {
          lines.push(`- **${issue.id}**: ${issue.message}`)
        })
        lines.push(``)
      }
    } else {
      lines.push(`## ✅ No issues found! Perfect SEO score.`)
      lines.push(``)
    }

    if (report.suggestions) {
      lines.push(`## Suggestions`)
      lines.push(`### Meta Tags`)
      Object.entries(report.suggestions.metaTags || {}).forEach(([key, value]) => {
        lines.push(`- \`${key}\`: ${value}`)
      })
      lines.push(``)
    }

    return lines.join("\n")
  }
}

export default SEOValidator
