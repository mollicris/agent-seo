// validators/twitter-card.ts - Validador de Twitter Card tags

import { ValidationRule, PageData } from "../../types"
import * as cheerio from "cheerio"

export const twitterCardRules: ValidationRule[] = [
  {
    id: "twitter:card:missing",
    severity: "critical",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      return $('meta[name="twitter:card"]').length > 0
    },
    message: "Twitter Card type está faltando",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      if (!$('meta[name="twitter:card"]').length) {
        $("head").append(
          '<meta name="twitter:card" content="summary_large_image" />'
        )
      }
      return $.html()
    },
  },

  {
    id: "twitter:title:missing",
    severity: "warning",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const title = $('meta[name="twitter:title"]').attr("content") || ""
      return title.trim().length > 0
    },
    message: "Twitter Card title está faltando",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      const title = $('meta[property="og:title"]').attr("content") || "Your Title"
      if (!$('meta[name="twitter:title"]').length) {
        $("head").append(`<meta name="twitter:title" content="${title}" />`)
      }
      return $.html()
    },
  },

  {
    id: "twitter:description:missing",
    severity: "warning",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const desc = $('meta[name="twitter:description"]').attr("content") || ""
      return desc.trim().length > 0
    },
    message: "Twitter Card description está faltando",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      const desc =
        $('meta[property="og:description"]').attr("content") || "Your description"
      if (!$('meta[name="twitter:description"]').length) {
        $("head").append(
          `<meta name="twitter:description" content="${desc}" />`
        )
      }
      return $.html()
    },
  },

  {
    id: "twitter:image:missing",
    severity: "critical",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const image = $('meta[name="twitter:image"]').attr("content") || ""
      return image.trim().length > 0
    },
    message: "Twitter Card image está faltando (crítico para preview)",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      const image =
        $('meta[property="og:image"]').attr("content") ||
        "https://example.com/twitter-image.jpg"
      if (!$('meta[name="twitter:image"]').length) {
        $("head").append(`<meta name="twitter:image" content="${image}" />`)
      }
      return $.html()
    },
  },

  {
    id: "twitter:site:missing",
    severity: "info",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      return $('meta[name="twitter:site"]').length > 0
    },
    message: "Twitter @site no está definido (buena práctica)",
    fix: (html: string) => {
      const $ = cheerio.load(html)
      if (!$('meta[name="twitter:site"]').length) {
        $("head").append('<meta name="twitter:site" content="@yourTwitterHandle" />')
      }
      return $.html()
    },
  },

  {
    id: "twitter:creator:missing",
    severity: "info",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      return $('meta[name="twitter:creator"]').length > 0
    },
    message: "Twitter @creator no está definido (buena práctica)",
  },

  {
    id: "twitter:card:value",
    severity: "info",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      const cardType = $('meta[name="twitter:card"]').attr("content") || ""
      const validTypes = ["summary", "summary_large_image", "app", "player"]
      return validTypes.includes(cardType)
    },
    message:
      "Twitter Card type inválido (debe ser: summary, summary_large_image, app, player)",
  },

  {
    id: "twitter:image:alt:missing",
    severity: "info",
    validate(html: string): boolean {
      const $ = cheerio.load(html)
      return $('meta[name="twitter:image:alt"]').length > 0
    },
    message: "Twitter image:alt no está definido (accesibilidad)",
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

  extractTwitterCardTags(html: string): Record<string, string> {
    const $ = cheerio.load(html)
    const twitterTags: Record<string, string> = {}

    $("meta[name^='twitter:']").each((_, el) => {
      const name = $(el).attr("name") || ""
      const content = $(el).attr("content") || ""
      twitterTags[name] = content
    })

    return twitterTags
  }

  suggestTwitterCardTags(
    html: string,
    pageData?: PageData
  ): Record<string, string> {
    const $ = cheerio.load(html)
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text() ||
      "Your Title"
    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "Your description"
    const image =
      $('meta[property="og:image"]').attr("content") ||
      pageData?.image ||
      "https://example.com/twitter-image.jpg"

    return {
      "twitter:card": "summary_large_image",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": image,
      "twitter:image:alt": "Image description",
      "twitter:site": "@yourTwitterHandle",
      "twitter:creator": "@author",
    }
  }
}
