import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generates a globally unique ID using the Web Crypto API (replaces Math.random) */
export const generateId = (): string => crypto.randomUUID();

/** Opens a receipt URL (base64 or external) in a new browser tab via iframe */
export function openReceiptInNewTab(url: string): void {
  const newWindow = window.open();
  if (newWindow) {
    newWindow.document.write(
      `<iframe src="${url}" frameborder="0" style="border:0;top:0;left:0;bottom:0;right:0;width:100%;height:100%;" allowfullscreen></iframe>`
    );
  }
}
