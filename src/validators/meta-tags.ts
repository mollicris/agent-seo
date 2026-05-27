// src/validators/meta-tags.ts - Validador de Meta Tags estándar

import { ValidationRule, PageData } from "../types"
import * as cheerio from "cheerio"

export const metaTagRules: ValidationRule[] = [
  {
    id: "title:missing",
    severity: "critical",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      return $('title').text().trim().length > 0
    },
    message: "Meta title está faltando (crítico para SEO y redes sociales)",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      if ($('title').length === 0) {
        $('head').prepend('<title>Your Page Title</title>')
      }
      return $.html()
    },
  },

  {
    id: "title:length",
    severity: "warning",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const title = $('title').text().trim()
      return title.length >= 30 && title.length <= 60
    },
    message: "Meta title debe tener entre 30-60 caracteres (actual: ${length})",
  },

  {
    id: "description:missing",
    severity: "critical",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const desc = $('meta[name="description"]').attr('content') || ''
      return desc.trim().length > 0
    },
    message: "Meta description está faltando (crítico para SEO)",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      if ($('meta[name="description"]').length === 0) {
        $('head').append('<meta name="description" content="Your page description here" />')
      }
      return $.html()
    },
  },

  {
    id: "description:length",
    severity: "warning",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const desc = $('meta[name="description"]').attr('content') || ''
      return desc.length >= 120 && desc.length <= 160
    },
    message: "Meta description debe tener entre 120-160 caracteres",
  },

  {
    id: "viewport:missing",
    severity: "critical",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      return $('meta[name="viewport"]').length > 0
    },
    message: "Viewport meta tag está faltando (necesario para mobile responsive)",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      if ($('meta[name="viewport"]').length === 0) {
        $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0" />')
      }
      return $.html()
    },
  },

  {
    id: "charset:missing",
    severity: "critical",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      return $('meta[charset]').length > 0 || $('meta[http-equiv="Content-Type"]').length > 0
    },
    message: "Charset meta tag está faltando (utf-8 recomendado)",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      if ($('meta[charset]').length === 0) {
        $('head').prepend('<meta charset="UTF-8" />')
      }
      return $.html()
    },
  },

  {
    id: "canonical:missing",
    severity: "warning",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      return $('link[rel="canonical"]').length > 0
    },
    message: "Canonical link está faltando (buena práctica para evitar duplicados)",
  },

  {
    id: "robots:missing",
    severity: "info",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      return $('meta[name="robots"]').length > 0
    },
    message: "Robots meta tag no está definido (controla indexación en buscadores)",
  },

  {
    id: "keywords:missing",
    severity: "info",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      return $('meta[name="keywords"]').length > 0
    },
    message: "Keywords meta tag no está definido (menor importancia en 2024)",
  },

  {
    id: "lang:missing",
    severity: "warning",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      return $('html[lang]').length > 0
    },
    message: "Atributo lang en <html> está faltando (importante para accesibilidad y SEO)",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      $('html').attr('lang', 'es')
      return $.html()
    },
  },
]

export class MetaTagValidator {
  validate(html: string, data?: PageData): Map<string, boolean> {
    const results = new Map<string, boolean>()

    for (const rule of metaTagRules) {
      results.set(rule.id, rule.validate(html, data))
    }

    return results
  }

  getIssues(html: string, data?: PageData) {
    const issues = []

    for (const rule of metaTagRules) {
      if (!rule.validate(html, data)) {
        issues.push({
          id: rule.id,
          severity: rule.severity,
          message: rule.message,
        })
      }
    }

    return issues
  }

  extractMetaTags(html: string): Record<string, string> {
    const $ = cheerio.load(html)
    const tags: Record<string, string> = {}

    $('meta').each((_, el) => {
      const name = $(el).attr('name') || $(el).attr('property')
      const content = $(el).attr('content') || ''
      if (name) {
        tags[name] = content
      }
    })

    return tags
  }

  suggestMetaTags(html: string, pageData?: PageData): Record<string, string> {
    const $ = cheerio.load(html)
    const title = $('title').text() || pageData?.title || 'Your Page Title'
    const description = $('meta[name="description"]').attr('content') ||
      pageData?.description ||
      'Your page description'

    return {
      title,
      description,
      viewport: 'width=device-width, initial-scale=1.0',
      charset: 'UTF-8',
      'theme-color': '#ffffff',
      robots: 'index, follow',
    }
  }
}
