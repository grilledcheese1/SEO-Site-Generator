import JSZip from "jszip";

/**
 * Creates an in-memory zip file containing the generated theme HTML.
 * Additional files mapping to CSS/JS can easily be appended here.
 */
export async function createZipBuffer(htmlContent: string): Promise<Buffer> {
    const zip = new JSZip();

    // Pack the main HTML footprint
    zip.file("index.html", htmlContent);

    // Zip standard delivery footprint adding fake generic assets structures if missing
    const assetsFolder = zip.folder("assets");
    if (assetsFolder) {
        assetsFolder.file("style.css", "/* Tailwind is injected in index.html, custom styles can go here */\\n");
        assetsFolder.file("main.js", "// Interactions\\n");
    }

    // Generate memory Buffer 
    return await zip.generateAsync({ type: "nodebuffer" });
}
