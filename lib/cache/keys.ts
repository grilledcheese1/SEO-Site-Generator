import crypto from "crypto";

export const CACHE_TTL = {
    PARSED_BLOCKS: 60 * 60 * 24, // 24 hours
    CLASSIFIED_BLOCKS: 60 * 60 * 24, // 24 hours
    GENERATED_THEMES: 60 * 60 * 24 * 7, // 7 days
};

export const cacheKeys = {
    parsedBlocks: (url: string) => {
        const base64Url = Buffer.from(url).toString("base64");
        return `parsed:${base64Url}`;
  },
  
  classifiedBlocks: (url: string) => {
    const base64Url = Buffer.from(url).toString("base64");
    return `classified:${base64Url}`;
  },
  
  generatedTheme: (requestDetails: string, blockTypesHash: string) => {
    // Generate an MD5 hash of the request and blocks to serve as the key
    const hash = crypto.createHash("md5").update(requestDetails + blockTypesHash).digest("hex");
    return `theme:${hash}`;
  }
};
