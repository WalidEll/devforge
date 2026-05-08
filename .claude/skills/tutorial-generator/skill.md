# Tutorial Generator

Generate a complete DevForge markdown tutorial file from a topic description and write it to `/content/tutorials/{slug}.md`.

## Usage

```
/tutorial-generator <topic or description>
```

**Examples:**
```
/tutorial-generator How JWT authentication works
/tutorial-generator Docker networking and bridge mode
/tutorial-generator SQL window functions explained
```

---

## Instructions

You are generating a technical tutorial for **DevForge** — a developer tools site at devforge.tools. Voice: technical, concise, direct. No filler phrases like "In this tutorial we will learn…" or "By the end of this guide…". Write for working developers who know the basics and want depth.

### Step 1: Derive Metadata

From the input topic, determine:

| Field | Rules |
|-------|-------|
| `slug` | kebab-case, max 5 words, e.g. `jwt-authentication-explained` |
| `title` | Title Case, under 60 characters, no "A Guide To" prefixes |
| `description` | One sentence, 120–160 characters, includes the primary search keyword |
| `category` | One of: `networking` · `security` · `devops` · `web` · `databases` · `linux` · `programming` |
| `difficulty` | One of: `beginner` · `intermediate` · `advanced` |
| `keywords` | 4–7 lowercase phrases a developer would search for |
| `icon` | 2–4 uppercase letters abbreviating the topic (e.g. `JWT`, `TLS`, `SQL`, `WS`) |
| `readingTime` | Integer minutes — estimate ~200 words/min across all section bodies |
| `relatedSlugs` | 0–3 slugs from the list below that are **genuinely** related — omit if none fit |
| `toolSlugs` | Only if a DevForge tool directly applies; otherwise `[]` |

**Existing tutorial slugs** (only reference these in `relatedSlugs`):
- `how-dns-works`
- `http-status-codes-explained`
- `ssl-tls-handshake`
- `docker-fundamentals`
- `linux-file-permissions`
- `rest-api-design-basics`
- `ssh-key-authentication`
- `git-branching-strategies`
- `sql-joins-visualized`
- `kubernetes-core-concepts`
- `understanding-jwt-authentication`
- `base64-encoding-explained`
- `hash-functions-explained`
- `uuid-guide`
- `unix-timestamps-explained`
- `regex-guide-for-developers`
- `url-encoding-explained`
- `cron-job-scheduling-guide`
- `json-yaml-comparison`
- `css-color-formats-guide`
- `sql-injection-prevention`
- `xml-json-data-formats`
- `password-security-best-practices`
- `html-validation-and-semantics`
- `sql-database-indexing`
- `websocket-protocol-guide`

### Step 2: Structure Sections

Write **4–7 sections**. Each section is an `##` heading followed by body text and optionally one fenced code block.

**Section rules:**
- Headings are action-oriented or concept-named — not generic labels like "Introduction", "Overview", or "Conclusion"
- Body: 2–4 paragraphs or short prose followed by a bullet list. Use `**bold**` for key terms on first use only.
- Code blocks: real, runnable examples with a language tag. One code block per section maximum. If a section needs multiple examples, pick the most illustrative one.
- The final section should be practical takeaways: gotchas, when NOT to use the thing, or operational considerations.
- Separate paragraphs with a blank line. Bullet lists use `- ` prefix.

**Do not** use `#` h1 headings in the body — only `##` for sections.

### Step 3: Write the File

Write the complete tutorial to `/content/tutorials/{slug}.md` using this exact schema:

```
---
title: "..."
slug: "..."
description: "..."
category: "..."
difficulty: "..."
keywords:
  - keyword one
  - keyword two
icon: "..."
readingTime: N
relatedSlugs:
  - existing-slug
toolSlugs: []
---

## Section Heading

Body text with **bold key terms**. Multiple paragraphs separated by blank lines.

- Bullet item one
- Bullet item two

```lang
code here
```

## Next Section

More content...
```

### Step 4: Self-Validation Checklist

Before writing the file, verify:

- [ ] Filename is `{slug}.md` — slug in frontmatter matches filename exactly
- [ ] All required frontmatter fields are present (`title`, `slug`, `description`, `category`, `difficulty`, `keywords`, `icon`, `readingTime`)
- [ ] `category` is one of the 7 valid values
- [ ] `difficulty` is one of the 3 valid values
- [ ] At least 4 sections with `##` headings
- [ ] No section has more than one fenced code block
- [ ] `relatedSlugs` only references slugs from the list above
- [ ] No `#` h1 headings in the markdown body
- [ ] `readingTime` is a reasonable integer (count words, divide by 200)

After writing the file, confirm to the user: "Tutorial written to `/content/tutorials/{slug}.md`. Run `npm run build` to include it in the site."
