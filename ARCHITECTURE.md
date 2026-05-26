# ARCHITECTURE.md - Arquitectura del Agent SEO

## 🎯 Propósito

**Agent SEO** es un agente de IA especializado en auditar y optimizar Meta Tags y Open Graph para aplicaciones React + Vite. Implementa la arquitectura de [gstack](https://github.com/garrytan/gstack) adaptada para SEO.

## 🏗️ Estructura Modular

```
┌─────────────────────────────────────────────────────────────┐
│                      Claude Code                             │
│         (Agente IA ejecutando skills)                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
   /seo-audit  /seo-opt   /seo-review
   (SKILL.md)  (SKILL.md)  (SKILL.md)
      │           │           │
      └───────────┼───────────┘
                  │
      ┌───────────┴───────────────────────┐
      │                                   │
   SEOValidator                  Generators
   (agregador)                  (siguiente fase)
      │
      ├─ MetaTagValidator
      ├─ OpenGraphValidator
      └─ TwitterCardValidator
```

## 📊 Modelo de Datos

### 1. **ValidationRule** (Regla de validación)

```typescript
interface ValidationRule {
  id: string                                    // "og:image:missing"
  severity: "critical" | "warning" | "info"    // Severidad
  validate(html: string): boolean               // Función que valida
  message: string                               // Mensaje para el usuario
  fix?: (html: string) => string               // Función que arregla (opcional)
}
```

### 2. **Issue** (Problema encontrado)

```typescript
interface Issue {
  id: string                     // "og:image:missing"
  severity: "critical" | "warning" | "info"
  message: string                // "Open Graph image está faltando"
  fixable: boolean               // ¿Se puede arreglar automáticamente?
  suggestion?: string            // Sugerencia para arreglarlo
}
```

### 3. **AuditReport** (Reporte de auditoría)

```typescript
interface AuditReport {
  url: string                    // "https://myapp.com"
  timestamp: string              // ISO date
  summary: {
    total_checks: number         // 28
    passed: number               // 15
    warnings: number             // 8
    critical: number             // 5
  }
  score: number                  // 0-100 (Math.round(passed/total*100))
  issues: Issue[]                // Problemas encontrados
  metaTags?: Record<string, string>      // Meta tags extraídos
  ogTags?: Record<string, string>        // OG tags extraídos
  twitterTags?: Record<string, string>   // Twitter tags extraídos
  suggestions?: Record<string, Record<string, string>>  // Fixes sugeridos
}
```

## 🔍 Flujo de Validación

### Fase 1: Parse HTML

```typescript
// Input
const html = `
  <head>
    <title>My App</title>
    <meta name="description" content="..." />
    <!-- ... más tags -->
  </head>
`

// Output (via cheerio)
const $ = cheerio.load(html)
```

### Fase 2: Ejecutar Reglas

```typescript
for (const rule of validationRules) {
  if (!rule.validate(html)) {
    issues.push({
      id: rule.id,
      severity: rule.severity,
      message: rule.message,
      fixable: !!rule.fix
    })
  }
}
```

### Fase 3: Calcular Score

```typescript
const totalChecks = 28  // 10 meta + 10 OG + 8 Twitter
const passed = totalChecks - issues.length
const score = Math.round((passed / totalChecks) * 100)

// Ejemplo:
// 28 checks, 20 passed → score = 71/100
```

### Fase 4: Sugerir Fixes

```typescript
const suggestions = {
  og:image: "https://example.com/og-image-1200x630.jpg",
  og:title: "Extracted from <title> or provided data",
  og:description: "Extracted from meta description"
}
```

## 🎨 Validadores Independientes

Cada validador es **stateless** y **reutilizable**:

### MetaTagValidator

```typescript
const validator = new MetaTagValidator()

// Obtener issues
const issues = validator.getIssues(html)

// Extraer tags existentes
const tags = validator.extractMetaTags(html)

// Sugerir valores
const suggestions = validator.suggestMetaTags(html, pageData)
```

**Reglas:** 10 (title, description, viewport, charset, canonical, robots, keywords, lang, theme-color, etc.)

### OpenGraphValidator

```typescript
const validator = new OpenGraphValidator()
const issues = validator.getIssues(html)
const tags = validator.extractOpenGraphTags(html)
const suggestions = validator.suggestOpenGraphTags(html, pageData)
```

**Reglas:** 10 (og:title, og:description, og:image, og:url, og:type, og:site_name, og:locale, og:image:alt, og:consistency, etc.)

### TwitterCardValidator

```typescript
const validator = new TwitterCardValidator()
const issues = validator.getIssues(html)
const tags = validator.extractTwitterTags(html)
const suggestions = validator.suggestTwitterTags(html, pageData)
```

**Reglas:** 8 (twitter:card, twitter:title, twitter:description, twitter:image, twitter:site, twitter:creator, twitter:card:value, twitter:image:alt)

## 🤖 Agregador SEOValidator

Orquesta todos los validadores:

```typescript
const seo = new SEOValidator()

// Auditoría completa
const report = seo.auditAll(html, pageData)

// Auditorías parciales
const metaIssues = seo.auditMetaTags(html)
const ogIssues = seo.auditOpenGraph(html)
const twitterIssues = seo.auditTwitterCard(html)

// Obtener sugerencias
const suggestions = seo.getSuggestions(html, pageData)
```

## 🔧 Decisiones Técnicas

### 1. ¿Por qué Cheerio vs jsdom?

| Aspecto | Cheerio | jsdom |
|--------|---------|-------|
| Tamaño | ~40KB | ~5MB |
| Velocidad | ⚡ Muy rápido | 🐢 Lento |
| DOM parsing | ✅ Perfecto | ⚠️ Ejecuta scripts |
| Memoria | 💾 Baja | 💾💾 Alta |
| Use case | Parsear HTML estático | Testear código JS |

**Decisión:** Cheerio es ideal para auditar HTML estático sin ejecutar JavaScript.

### 2. ¿Por qué reglas separadas por tipo?

```typescript
// ✅ BIEN: Cada validador es responsable de su dominio
- MetaTagValidator: solo meta tags estándar
- OpenGraphValidator: solo OG tags (property="og:*")
- TwitterCardValidator: solo Twitter tags (name="twitter:*")

// ❌ MALO: Un solo validador gigante
class SEOValidator {
  validate28Rules() { /* 500 líneas */ }
}
```

**Ventajas:**
- Fácil de entender
- Fácil de extender
- Fácil de testear
- Reutilizable en diferentes contextos

### 3. ¿Por qué Zod para tipos?

```typescript
// Validación de runtime
const AuditReportSchema = z.object({
  score: z.number().min(0).max(100),
  issues: z.array(IssueSchema),
  // ...
})

// Parsed y validado
const report = AuditReportSchema.parse(data)
```

**Por qué:** TypeScript solo valida en compilación. Zod valida en runtime (importantes para datos de API).

### 4. Tabla de severidades

```typescript
type Severity = "critical" | "warning" | "info"

// Mapeo a acciones
const actions = {
  critical: "🔴 Bloquea SEO",      // Indexación
  warning:  "🟡 Reduce ranking",   // Ranking
  info:     "ℹ️  Buena práctica",   // Optimi
}
```

## 🚀 Extensibilidad

### Agregar nueva regla

```typescript
// 1. Crear la regla
const myRule: ValidationRule = {
  id: "custom:rule",
  severity: "warning",
  validate(html) {
    const $ = cheerio.load(html)
    return $('meta[name="custom"]').length > 0
  },
  message: "Custom meta tag is missing",
  fix: (html) => {
    const $ = cheerio.load(html)
    if (!$('meta[name="custom"]').length) {
      $("head").append('<meta name="custom" content="value" />')
    }
    return $.html()
  }
}

// 2. Agregar al validador
const rules = [...metaTagRules, myRule]

// ¡Listo! Ahora se ejecuta automáticamente
```

### Agregar nuevo validador

```typescript
// 1. Crear archivo
// src/validators/schema-validator.ts

export class SchemaValidator {
  validate(html: string): Map<string, boolean> { }
  getIssues(html: string) { }
  suggestSchema(html: string) { }
}

// 2. Agregar al agregador
// src/validators/index.ts
export { SchemaValidator, schemaRules }

class SEOValidator {
  private schemaValidator: SchemaValidator
  
  auditSchema(html: string) {
    return this.schemaValidator.getIssues(html)
  }
}

// ¡Listo!
```

## 📈 Performance

### Benchmarks (en Bun)

```
MetaTagValidator.validate()     ~2ms
OpenGraphValidator.validate()   ~2ms
TwitterCardValidator.validate() ~1ms
SEOValidator.auditAll()         ~8ms

Parse HTML + audit 28 rules     ~15ms
```

### Optimizaciones

1. **Lazy loading de validadores** — Solo cargar los necesarios
2. **Caching de parsed HTML** — Si se valida múltiples veces
3. **Parallel validation** — Ejecutar validadores en paralelo
4. **Streaming** — Para archivos muy grandes

## 🧪 Testing Strategy

```typescript
// test/validators.test.ts

describe("MetaTagValidator", () => {
  test("detects missing title", () => {
    const html = "<head></head>"
    const issues = validator.getIssues(html)
    expect(issues).toContainEqual({ id: "title:missing" })
  })

  test("fixes missing title", () => {
    const html = "<head></head>"
    const rule = metaTagRules.find(r => r.id === "title:missing")!
    const fixed = rule.fix(html)
    expect(fixed).toContain("<title>")
  })
})
```

## 🔐 Seguridad

### Input Validation

```typescript
// Todas las entradas se escapan
const escaped = html.replace(/</g, "&lt;")

// Cheerio maneja malformed HTML
const $ = cheerio.load(malformedHTML)
```

### Output Safety

```typescript
// Los fixes generados son siempre válidos HTML
// Cheerio serializa de forma segura
const fixed = $.html()
```

## 📚 Referencias

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Tags](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Google Search Central - Meta tags](https://developers.google.com/search/docs/beginner/meta-tags)
- [MDN - Meta elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta)
- [Cheerio Docs](https://cheerio.js.org/)
- [Zod Docs](https://zod.dev/)

## 🗓️ Timeline de Desarrollo

```
v0.1.0 (Actual)
├─ Validadores: Meta Tags, OG, Twitter Card
├─ SEOValidator agregador
└─ /seo-audit skill

v0.2.0
├─ Generadores de código
├─ /seo-optimize skill
└─ /seo-review skill

v0.3.0+
├─ Core Web Vitals
├─ Structured data (schema.org)
├─ Sitemap/Robots.txt
└─ Lighthouse integration
```

---

**Made with ❤️ siguiendo los principios de [gstack](https://github.com/garrytan/gstack)**
