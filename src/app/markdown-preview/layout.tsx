import { generateToolMetadata } from "@/lib/seo";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("markdown-preview")!;

export const metadata = generateToolMetadata(tool);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
