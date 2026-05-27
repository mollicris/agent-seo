// src/validators/twitter-card.ts - Validador de Twitter Card tags

import { ValidationRule, PageData } from "../types"
import * as cheerio from "cheerio"

export const twitterCardRules: ValidationRule[] = [
  {
    id: "twitter:card:missing",
    severity: "critical",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const card = $('meta[name="twitter:card"]').attr('content') || ''
      return card.trim().length > 0
    },
    message: "Twitter Card type está faltando (importante para compartir en Twitter/X)",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      if (!$('meta[name="twitter:card"]').length) {
        $('head').append('<meta name="twitter:card" content="summary_large_image" />')
      }
      return $.html()
    },
  },

  {
    id: "twitter:title:missing",
    severity: "critical",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const title = $('meta[name="twitter:title"]').attr('content') || ''
      return title.trim().length > 0
    },
    message: "Twitter title está faltando",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      const pageTitle = $('title').text() || 'Your Title'
      if (!$('meta[name="twitter:title"]').length) {
        $('head').append(`<meta name="twitter:title" content="${pageTitle}" />`)
      }
      return $.html()
    },
  },

  {
    id: "twitter:description:missing",
    severity: "critical",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const desc = $('meta[name="twitter:description"]').attr('content') || ''
      return desc.trim().length > 0
    },
    message: "Twitter description está faltando",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      const pageDesc = $('meta[name="description"]').attr('content') || 'Your description'
      if (!$('meta[name="twitter:description"]').length) {
        $('head').append(`<meta name="twitter:description" content="${pageDesc}" />`)
      }
      return $.html()
    },
  },

  {
    id: "twitter:image:missing",
    severity: "critical",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const image = $('meta[name="twitter:image"]').attr('content') || ''
      return image.trim().length > 0
    },
    message: "Twitter image está faltando (crítico: sin imagen en tweets)",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      if (!$('meta[name="twitter:image"]').length) {
        $('head').append('<meta name="twitter:image" content="https://example.com/twitter-image.jpg" />')
      }
      return $.html()
    },
  },

  {
    id: "twitter:site:missing",
    severity: "warning",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const site = $('meta[name="twitter:site"]').attr('content') || ''
      return site.trim().length > 0
    },
    message: "Twitter site (@handle) no está definido",
  },

  {
    id: "twitter:creator:missing",
    severity: "info",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const creator = $('meta[name="twitter:creator"]').attr('content') || ''
      return creator.trim().length > 0
    },
    message: "Twitter creator (@handle) no está definido",
  },

  {
    id: "twitter:card:value",
    severity: "warning",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const card = $('meta[name="twitter:card"]').attr('content') || ''
      const validCards = ['summary', 'summary_large_image', 'app', 'player']
      return validCards.includes(card)
    },
    message: "Twitter Card type debe ser: summary, summary_large_image, app, o player",
  },

  {
    id: "twitter:image:alt:missing",
    severity: "info",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      return $('meta[name="twitter:image:alt"]').length > 0
    },
    message: "Twitter image alt text no está definido (accesibilidad)",
  },
]

export class TwitterCardValidator {
  validate(html: string, data?: PageData): Map<string, boolean> {
    const results = new Map<string, boolean>()

    for (const rule of twitterCardRules) {
      results.set(rule.id, rule.validate(html, data))
    }

    return results
  }

  getIssues(html: string, data?: PageData) {
    const issues = []

    for (const rule of twitterCardRules) {
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

  extractTwitterTags(html: string): Record<string, string> {
    const $ = cheerio.load(html)
    const tags: Record<string, string> = {}

    $('meta[name^="twitter:"]').each((_, el) => {
      const name = $(el).attr('name') || ''
      const content = $(el).attr('content') || ''
      tags[name] = content
    })

    return tags
  }

  suggestTwitterTags(html: string, pageData?: PageData): Record<string, string> {
    const $ = cheerio.load(html)
    const title = $('title').text() || pageData?.title || 'Your Title'
    const description = $('meta[name="description"]').attr('content') ||
      pageData?.description ||
      'Your description'
    const image = pageData?.image || 'https://example.com/twitter-image.jpg'

    return {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
      'twitter:image:alt': 'Image alt text',
      'twitter:site': '@yourhandle',
      'twitter:creator': '@yourname',
    }
  }
}
