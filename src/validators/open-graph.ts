// validators/open-graph.ts - Validador de Open Graph tags

import { ValidationRule, PageData } from "../../types"
import * as cheerio from "cheerio"

export const openGraphRules: ValidationRule[] = [
  {
    id: "og:title:missing",
    severity: "critical",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const og = $('meta[property="og:title"]').attr("content") || ""
      return og.trim().length > 0
    },
    message: "Open Graph title está faltando (importante para redes sociales)",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      const title = $("title").text() || "Your Title"
      if (!$('meta[property="og:title"]').length) {
        $("head").append(`<meta property="og:title" content="${title}" />`)
      }
      return $.html()
    },
  },

  {
    id: "og:description:missing",
    severity: "critical",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const og = $('meta[property="og:description"]').attr("content") || ""
      return og.trim().length > 0
    },
    message:
      "Open Graph description está faltando (importante para preview en redes)",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      const desc =
        $('meta[name="description"]').attr("content") || "Your description"
      if (!$('meta[property="og:description"]').length) {
        $("head").append(
          `<meta property="og:description" content="${desc}" />`
        )
      }
      return $.html()
    },
  },

  {
    id: "og:image:missing",
    severity: "critical",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const og = $('meta[property="og:image"]').attr("content") || ""
      return og.trim().length > 0
    },
    message:
      "Open Graph image está faltando (crítico: sin imagen en redes sociales)",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      if (!$('meta[property="og:image"]').length) {
        $("head").append(
          '<meta property="og:image" content="https://example.com/og-image.jpg" />'
        )
      }
      return $.html()
    },
  },

  {
    id: "og:image:size",
    severity: "warning",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const ogImage = $('meta[property="og:image"]').attr("content") || ""
      // TODO: Validar dimensiones reales con HEAD request
      // Por ahora solo verificar que existe
      return ogImage.trim().length > 0
    },
    message: "Open Graph image debe ser 1200x630px (recomendado)",
  },

  {
    id: "og:url:missing",
    severity: "warning",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const og = $('meta[property="og:url"]').attr("content") || ""
      return og.trim().length > 0
    },
    message: "Open Graph URL está faltando (buena práctica)",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      if (!$('meta[property="og:url"]').length) {
        $("head").append(
          '<meta property="og:url" content="https://example.com/page" />'
        )
      }
      return $.html()
    },
  },

  {
    id: "og:type:missing",
    severity: "warning",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const og = $('meta[property="og:type"]').attr("content") || ""
      return og.trim().length > 0
    },
    message: 'Open Graph type está faltando (defaultea a "website")',
    fix: (html: string) => {
      const $ = cheerio.load(html)
      if (!$('meta[property="og:type"]').length) {
        $("head").append('<meta property="og:type" content="website" />')
      }
      return $.html()
    },
  },

  {
    id: "og:site_name:missing",
    severity: "info",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const og = $('meta[property="og:site_name"]').attr("content") || ""
      return og.trim().length > 0
    },
    message:
      "Open Graph site_name no está definido (buena práctica para branding)",
  },

  {
    id: "og:locale:missing",
    severity: "info",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const og = $('meta[property="og:locale"]').attr("content") || ""
      return og.trim().length > 0
    },
    message: 'Open Graph locale no está definido (defaultea a "en_US")',
    fix: (html: string) => {
      const $ = cheerio.load(html)
      if (!$('meta[property="og:locale"]').length) {
        const lang = $("html").attr("lang") || "es"
        const locale = lang === "es" ? "es_ES" : "en_US"
        $("head").append(`<meta property="og:locale" content="${locale}" />`)
      }
      return $.html()
    },
  },

  {
    id: "og:image:alt:missing",
    severity: "info",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      return $('meta[property="og:image:alt"]').length > 0
    },
    message: "Open Graph image:alt no está definido (accesibilidad)",
  },

  {
    id: "og:consistency",
    severity: "warning",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const ogTitle = $('meta[property="og:title"]').attr("content") || ""
      const pageTitle = $("title").text() || ""
      // Verificar que sean similares (al menos 50% de match)
      if (!ogTitle || !pageTitle) return true
      const similarity = ogTitle.toLowerCase().includes(
        pageTitle.toLowerCase().slice(0, 5)
      )
      return similarity
    },
    message:
      "Open Graph title no coincide con page title (pueden causar confusión)",
  },
]

export class OpenGraphValidator {
  validate(html: string, data?: PageData): Map<string, boolean> {
    const results = new Map<string, boolean>()

    for (const rule of openGraphRules) {
      results.set(rule.id, rule.validate(html, data))
    }

    return results
  }

  getIssues(html: string, data?: PageData) {
    const issues = []

    for (const rule of openGraphRules) {
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

  extractOpenGraphTags(html: string): Record<string, string> {
    const $ = cheerio.load(html)
    const ogTags: Record<string, string> = {}

    $("meta[property^='og:']").each((_, el) => {
      const property = $(el).attr("property") || ""
      const content = $(el).attr("content") || ""
      ogTags[property] = content
    })

    return ogTags
  }

  suggestOpenGraphTags(html: string, pageData?: PageData): Record<string, string> {
    const $ = cheerio.load(html)
    const title = $("title").text() || pageData?.title || "Your Title"
    const description =
      $('meta[name="description"]').attr("content") ||
      pageData?.description ||
      "Your description"
    const url = pageData?.url || "https://example.com"
    const image = pageData?.image || "https://example.com/og-image.jpg"
    const lang = $("html").attr("lang") || "es"
    const locale = lang === "es" ? "es_ES" : "en_US"

    return {
      "og:title": title,
      "og:description": description,
      "og:image": image,
      "og:url": url,
      "og:type": "website",
      "og:site_name": "Your Site Name",
      "og:locale": locale,
      "og:image:alt": "Image alt text",
    }
  }
}
