import { prisma } from "./client";

export async function getCachedTemplateByNiche(niche: string) {
    // Grab the latest template for the given niche
    return prisma.cachedTemplate.findFirst({
        where: { niche },
        orderBy: { createdAt: "desc" },
    });
}

export async function createCachedTemplate(name: string, niche: string, html: string, previewUrl?: string) {
    return prisma.cachedTemplate.create({
        data: {
            name,
            niche,
            html,
            previewUrl
        },
    });
}
