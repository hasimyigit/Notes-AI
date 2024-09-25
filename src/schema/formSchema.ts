import { z } from "zod";

export const formSchema = z.object({
  title: z.string().trim().min(2, { message: "Title field has to be filled." }),
  category: z.string().trim().min(1, {
    message: "Category field has to be filled.",
  }),
  description: z
    .string()
    .trim()
    .min(2, { message: "Description field has to be filled." }),
});

export const categorySchema = z.object({
  categoryName: z.string().trim().min(2, { message: "Name field has to be filled." }),
})