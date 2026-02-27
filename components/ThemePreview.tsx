"use client";

import { useState } from "react";

export default function ThemePreview() {
    const [url, setUrl] = useState("");
    const [themeStyle, setThemeStyle] = useState("ModernTech");
    const [tone, setTone] = useState("Professional");
    const [seoGoals, setSeoGoals] = useState("Maximize local lead generation");
    const [html, setHtml] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleGenerate(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, themeStyle, tone, seoGoals })
            });
            const data = await res.json();

            if (data.error) {
                setHtml(`<h1>Error: ${data.error}</h1>`);
            } else if (data.html) {
                setHtml(data.html);
            } else if (data.promptPreview) {
                // Scaffold fallback display
                setHtml(`
          <div style="padding: 2rem; font-family: sans-serif; color: white;">
            <h2>API Route Scaffold Hit Successfully</h2>
            <p><strong>URL Parsed:</strong> ${url}</p>
            <h3>Prompt Preview Delivered to LLM:</h3>
            <pre style="background: #1e293b; padding: 1rem; border-radius: 8px; overflow-x: auto;">${data.promptPreview}</pre>
          </div>
        `);
            }
        } catch (err) {
            console.error(err);
            setHtml("<h1>Error generating theme</h1>");
        } finally {
            setLoading(false);
        }
    }

    function handleDownload() {
        if (!html) return;
        const blob = new Blob([html], { type: "text/html" });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "generated-theme.html";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto p-6">
            <div className="lg:col-span-1 rounded-2xl border border-(--theme-border) bg-(--theme-surface) p-6 shadow-(--theme-shadow-soft) backdrop-blur-sm">
                <h2 className="text-xl font-bold text-(--theme-heading) mb-4">Generate Theme</h2>
                <form onSubmit={handleGenerate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-(--theme-muted) mb-1">Target Website URL</label>
                        <input
                            required
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full rounded-lg border border-(--theme-border) bg-black/20 p-2.5 text-(--theme-text) focus:border-(--theme-accent) focus:outline-none focus:ring-1 focus:ring-(--theme-accent)"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-(--theme-muted) mb-1">Theme Style</label>
                        <select
                            value={themeStyle}
                            onChange={(e) => setThemeStyle(e.target.value)}
                            className="w-full rounded-lg border border-(--theme-border) bg-black/20 p-2.5 text-(--theme-text) focus:border-(--theme-accent) focus:outline-none"
                        >
                            <option>ModernTech</option>
                            <option>Scholarly</option>
                            <option>Enterprise</option>
                            <option>Playful</option>
                            <option>Minimalist</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-(--theme-muted) mb-1">Copywriting Tone</label>
                        <input
                            required
                            type="text"
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full rounded-lg border border-(--theme-border) bg-black/20 p-2.5 text-(--theme-text) focus:border-(--theme-accent) focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-(--theme-muted) mb-1">SEO Goals</label>
                        <textarea
                            required
                            value={seoGoals}
                            onChange={(e) => setSeoGoals(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-(--theme-border) bg-black/20 p-2.5 text-(--theme-text) focus:border-(--theme-accent) focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-(--theme-brand) px-4 py-3 font-semibold text-(--theme-brand-contrast) transition-colors hover:bg-(--theme-brand)/80 disabled:opacity-50"
                    >
                        {loading ? "Generating..." : "Generate AI Theme"}
                    </button>
                </form>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-(--theme-border) bg-[#0b1220] flex flex-col overflow-hidden shadow-(--theme-shadow-soft)">
                <div className="flex items-center justify-between border-b border-(--theme-border) bg-black/40 px-4 py-3">
                    <span className="text-sm font-medium text-(--theme-muted)">Live Preview</span>
                    {html && (
                        <button
                            onClick={handleDownload}
                            className="rounded bg-(--theme-accent) px-3 py-1.5 text-xs font-medium text-(--theme-accent-contrast) transition-colors hover:bg-(--theme-accent)/80"
                        >
                            Download HTML
                        </button>
                    )}
                </div>
                <div className="flex-1 min-h-125 relative bg-white">
                    {html ? (
                        <iframe
                            srcDoc={html}
                            sandbox="allow-scripts allow-same-origin"
                            className="absolute inset-0 w-full h-full border-0"
                            title="Generated Theme Preview"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-500">
                            Generated theme will appear here. No Next.js hydration conflict!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
