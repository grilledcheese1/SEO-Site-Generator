import { prisma } from "./client";
import { JobStatus } from "@prisma/client";

export async function createJob(userId: string, url: string, themeRequestStr: string) {
    return prisma.job.create({
        data: {
            userId,
            url,
            themeRequest: themeRequestStr,
            status: "PENDING",
        },
    });
}

export async function updateJobStatus(id: string, status: JobStatus, downloadUrl?: string) {
    return prisma.job.update({
        where: { id },
        data: {
            status,
            downloadUrl
        },
    });
}

export async function getJobById(id: string) {
    return prisma.job.findUnique({
        where: { id },
    });
}
