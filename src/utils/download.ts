export function downloadTextFile(filename: string, contents: string, mimeType = "text/plain") {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

export async function readFileAsText(file: File) {
  return file.text();
}
