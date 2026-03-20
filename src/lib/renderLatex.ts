import katex from "katex";

export function renderLatex(text: string): string {
  return text
    .replace(/\$\$(.*?)\$\$/g, (_match, tex) => {
      try {
        return katex.renderToString(tex, { throwOnError: false, displayMode: false });
      } catch {
        return tex;
      }
    })
    .replace(/\n/g, "<br/>");
}
