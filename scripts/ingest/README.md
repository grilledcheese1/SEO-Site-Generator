Within scripts/ingest/* + ingest.ts:

# discoverRoutes.ts: Finds internal links from the source site homepage.
    - filters mailto:, tel:, javascript:
    - filters asset links (.jpg, .pdf, .zip, .css, .js, etc.)
    - normalizes paths and dupes

# fetchHtml.ts: Robust fetch wrapper.
    - custom user agent request
    - retries (max 3)
    - timeout (15s default)
    - polite delay between requests

# parsePage.ts: Turns raw HTML into structured data.
    - picks main content area
    - removes element (nav, footer, script, etc.)
    - extracts h1, h2, h3, paragraphs, bullets 
    - extracts SEO fields (static or dynamic metadata)
    - infers page kind (home, about, blog, etc.)

# ingest.ts: Orchestration entrypoint.
    - discovers routes
    - fetches pages
    - parses pages
    - validates with Zod schema dependancy
    - writes site.json