import html2canvas from "html2canvas";

/** Capture an HTML element as a PNG data URL */
export async function captureElementAsImage(element: HTMLElement): Promise<string> {
  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
  });
  return canvas.toDataURL("image/png");
}

/** Download a data URL as a file */
export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Share image via Web Share API (if supported) */
export async function shareImage(dataUrl: string, title: string): Promise<boolean> {
  if (!navigator.share || !navigator.canShare) return false;

  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `${title}.png`, { type: "image/png" });

    if (navigator.canShare({ files: [file] })) {
      await navigator.share({ title, files: [file] });
      return true;
    }
  } catch {
    // User cancelled or not supported
  }
  return false;
}

/** Capture, then share (fallback to download) */
export async function captureAndShare(element: HTMLElement, title: string) {
  const dataUrl = await captureElementAsImage(element);
  const shared = await shareImage(dataUrl, title);
  if (!shared) {
    downloadImage(dataUrl, `${title}.png`);
  }
}
