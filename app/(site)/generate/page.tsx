import { Metadata } from "next";
import ThemePreview from "@/components/ThemePreview";

export const metadata: Metadata = {
    title: "Generate AI Theme",
    description: "Generate a downloadable HTML theme using AI.",
};

export default function GenerateThemePage() {
    return (
        <main className="mx-auto w-full max-w-7xl pt-16 pb-24">
            <div className="text-center mb-10 px-6">
                <h1 className="text-4xl font-bold tracking-tight text-(--theme-heading) sm:text-5xl">
                    AI Theme Generator
                </h1>
                <p className="mt-4 text-lg text-(--theme-muted)">
                    Enter a website URL and prompt the AI to generate a mapped HTML template.
                </p>
            </div>
            <ThemePreview />
        </main>
    );
}
