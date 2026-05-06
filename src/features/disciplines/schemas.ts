import { z } from "zod";

export const createDisciplineSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(120),
  description: z.string().max(500).optional(),
  semester: z.string().regex(/^\d{4}\.[1-2]$/, "Formato esperado: AAAA.1 ou AAAA.2"),
});

export type CreateDisciplineForm = z.infer<typeof createDisciplineSchema>;
