"use server";

import { categorySchema, formSchema } from "@/schema/formSchema";
import prisma from "./client";
import { revalidatePath } from "next/cache";
import { Category, Note } from "@prisma/client";
import { redirect } from "next/navigation";
import { UploadFileResponse } from "@google/generative-ai/server";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { auth } from "@clerk/nextjs/server";
import { NoteType } from "@/types";

const fileManager = new GoogleAIFileManager(
  process.env.NEXT_PUBLIC_GEMINI_KEY || ""
);
export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

export const addNote = async (
  previousState: FormState,
  data: FormData
): Promise<FormState> => {
  const { userId: currentUserId } = auth();

  if (!currentUserId) {
    throw new Error("User is not authenticated!");
  }

  const title = data.get("title") as string;
  const category = data.get("category") as string;
  const description = data.get("description") as string;

  const dataForm = Object.fromEntries(data);

  const parsed = formSchema.safeParse(dataForm);

  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const key of Object.keys(dataForm)) {
      fields[key] = dataForm[key].toString();
    }
    return {
      message: "Invalid form data",
      fields,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }
  // let arr = [];
  // for (let index = 0; index < 3000; index++) {
  //   arr.push({
  //     userId: currentUserId,
  //     title: title,
  //     categoryId: category,
  //     description: description,
  //   })
    
  // }
  // await prisma.note.createMany({data:arr})
  try {
    await prisma.note.create({
      data: {
        userId: currentUserId,
        title: title,
        categoryId: category,
        description: description,
      },
    });
    revalidatePath("/");
  } catch (error: unknown) {
    return { message: "Hata var" };
  }

  redirect("/");
};

export const updateNote = async (
  previousState: FormState,
  data: FormData
): Promise<FormState> => {
  const { userId: currentUserId } = auth();

  if (!currentUserId) {
    throw new Error("User is not authenticated!");
  }
  const noteId = data.get("noteId") as string;
  const title = data.get("title") as string;
  const category = data.get("category") as string;
  const description = data.get("description") as string;

  const dataForm = Object.fromEntries(data);

  const parsed = formSchema.safeParse(dataForm);

  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const key of Object.keys(dataForm)) {
      fields[key] = dataForm[key].toString();
    }
    return {
      message: "Invalid form data",
      fields,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  try {
    await prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        userId: currentUserId,
        title: title,
        categoryId: category,
        description: description,
      },
    });
    revalidatePath("/");
  } catch (error: unknown) {
    return { message: "Hata var" };
  }

  redirect("/");
};

export const removeNote = async (
  previousState: FormState,
  data: FormData
): Promise<FormState> => {
  const id = data.get("id") as string;
  try {
    await prisma.note.delete({
      where: {
        id: id,
      },
    });
    revalidatePath("/");
  } catch (error) {
    return { message: "Hata var" };
  }
  return { message: "Note Silindi" };
};

export const removeCategory = async (id:string) => {
  
  try {
    await prisma.category.delete({
      where: {
        id: id,
      },
    });
    revalidatePath("/create");
  } catch (error) {
    
  }

};

export type FilterType = {
  validation: FormState;
  data: (Note & { cat: Pick<Category, "name"> })[] | null;
};



export const getFilterNote = async (
  query: string,
  limit: string
): Promise<{
  data: (Note & { cat: Pick<Category, "name"> })[] | null;
  message: string;
  totalNotes: number;
}> => {
  const { userId: currentUserId } = auth();
  if (!currentUserId) {
    throw new Error("User is not authenticated!");
  }

  try {
    const [totalNotes, notes] = await prisma.$transaction([
      prisma.note.count({
        where: {
          userId: currentUserId,
        },
      }),

      prisma.note.findMany({
        orderBy: [{ createdAt: "desc" }],
        where: {
          userId: currentUserId,

          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              cat: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
            {
              description: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        include: {
          cat: {
            select: {
              name: true,
            },
          },
        },
        take: 6 * Number(limit),
      }),
    ]);

    return {
      message: "Arama işlemi Gerçekleşti",
      data: notes,
      totalNotes,
    };
  } catch (error) {
    return {
      message: "Arama İşlemi Başarısız",
      data: null,
      totalNotes: 0,
    };
  }
};

export const addCategory = async (
  previousState: FormState,
  data: FormData
): Promise<FormState> => {
  const categoryName = data.get("categoryName") as string;
  const dataForm = Object.fromEntries(data);
  const parsed = categorySchema.safeParse(dataForm);
  const { userId: currentUserId } = auth();

  if (!currentUserId) {
    throw new Error("User is not authenticated!");
  }

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0].message,
    };
  }
  try {
    let equalsCategory = await prisma.category.findMany({
      where: {
        name: {
          equals: categoryName,
          mode: "insensitive",
        },
      },
    });
    if (equalsCategory.length > 0) {
      return {
        message: "Category Already Exists",
      };
    }

    await prisma.category.create({
      data: {
        name: categoryName,
        userId: currentUserId,
      },
    });
    revalidatePath("/create");
    return {
      message: "Category Added",
    };
  } catch (error: unknown) {
    return { message: "Hata var" };
  }
};

export const fileUploadAI = async (
  formData: FormData
): Promise<UploadFileResponse | string> => {
  const file = formData.get("file") as File;

  if (!file) {
    return "hata var";
  }

  const uploadResponse = await fileManager.uploadFile(file.name, {
    mimeType: "application/pdf",
    displayName: file.name,
  });
  return uploadResponse;
};

export const getNoteById = async (
  id: string
): Promise<NoteType | null | { message: string }> => {
  try {
    let note = await prisma.note.findFirst({
      where: {
        id: id,
      },
      include: {
        cat: {
          select: {
            name: true,
          },
        },
      },
    });
    return note as NoteType;
  } catch {
    return { message: "Unknown error" };
  }
};

export const getNoteByCategoryId = async (
  id: string
): Promise<number> => {
  const { userId: currentUserId } = auth();

  if (!currentUserId) {
    throw new Error("User is not authenticated!");
  }
  try {
    let noteCount = await  prisma.note.count({
      where: {
        userId: currentUserId,
        categoryId:id
      },
    })
    return noteCount
  } catch {
    return 0;
  }
};