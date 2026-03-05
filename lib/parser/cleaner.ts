import sanitizeHtml from "sanitize-html";

export function cleanText(value: string): string {
    return value.replaceAll("\u00A0", " ").replace(/\s+/g, " ").trim();
}

export function cleanHtml(value: string): string {
    if (!value) return "";
    const sanitized = sanitizeHtml(value, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br', 'span'],
        allowedAttributes: {
            'a': ['href', 'title']
        }
    });
    return sanitized.replaceAll("\u00A0", " ").replace(/\s+/g, " ").trim();
}
