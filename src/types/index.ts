import { Category,Note } from "@prisma/client";

export type NoteType = Note & { cat: Pick<Category, "name"> };