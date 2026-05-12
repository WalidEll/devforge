import { architectureSchema } from "@/domain/models/schemas";

export function serializeArchitectureJson(data: unknown) {
  return JSON.stringify(data, null, 2);
}

export function parseArchitectureJson(raw: string) {
  return architectureSchema.safeParse(JSON.parse(raw));
}
