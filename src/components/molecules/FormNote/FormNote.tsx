"use client";
import Input from "@/components/atoms/Input/Input";
import {
  addNote,
  FormState,
  getNoteByCategoryId,
  removeCategory,
  updateNote,
} from "@/lib/actions";
import { noteStore } from "@/lib/store";
import { Category } from "@prisma/client";
import { BadgeInfo, CirclePlus, Loader, X } from "lucide-react";
import React, {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { useFormState } from "react-dom";
import dynamic from "next/dynamic";
import AddCategory from "../AddCategory/AddCategory";
import { NoteType } from "@/types";
import {
  Control,
  Controller,
  FieldErrors,
  useForm,
  UseFormRegister,
} from "react-hook-form";
import { z } from "zod";
import { formSchema } from "@/schema/formSchema";
import { zodResolver } from "@hookform/resolvers/zod";

const Editor = dynamic(() => import("../Editor/Editor"), { ssr: false,
   loading: () => <Loader className="animate-spin"/>
 });

const FormMessage = ({ message }: { message: string }) => (
  <p className="p-4 mt-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 flex items-center gap-2">
    <BadgeInfo />
    {message}
  </p>
);

const FormContent = ({
  optimisticSubmit,
  actionError,
  register,
  errors,
  categories,
  children,
  note,
  control,
}: {
  optimisticSubmit: string;
  actionError: FormState;
  register: UseFormRegister<z.output<typeof formSchema>>;
  errors: FieldErrors<{
    title: string;
    category: string;
    description: string;
  }>;
  categories: Category[];
  children: React.ReactNode;
  note?: NoteType;
  control: Control<
    {
      title: string;
      category: string;
      description: string;
    },
    any
  >;
}) => {
  const { seledtedAnswer, changeAnswer } = noteStore();
  const [desc, setDesc] = useState(seledtedAnswer || note?.description || "");
  const [title, setTitle] = useState(note?.title || "");
  const [category, setCategory] = useState(note?.categoryId || "");
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    return () => {
      changeAnswer("");
    };
  }, []);
  const [isPending, startTransition] = useTransition();
   function handleRemoveCategory(id: string) {
    startTransition(async () => {
      const notesCountByCategory = await getNoteByCategoryId(id);
  
      if (notesCountByCategory > 0) {
        const confirmed = confirm(
          `There are ${notesCountByCategory} notes in this category. Are you sure you want to delete?`
        );
        if (!confirmed) return;
      }
      setCategory('')
      await removeCategory(id);
    });
  }
  return (
    <>
      <div className="flex flex-col gap-3 ">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          {actionError.message}
        </h2>

        {actionError.issues && actionError.issues?.length > 0 && (
          <ul className="max-w-md space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400">
            {actionError.issues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        )}
        <div className="flex flex-col">
          {errors.title && <FormMessage message={errors.title.message!} />}
          <label
            htmlFor="title"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Title
          </label>

          <Input
            id="title"
            type="text"
            value={title}
            {...register("title")}
            onChange={(e) => {
              e && setTitle(e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col ">
          <label
            htmlFor="countries"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Categories
          </label>
          <div className="flex flex-col gap-4">
            {errors.category && (
              <FormMessage message={errors.category.message!} />
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={category}
                {...register("category")}
                className="hidden"
              />
              <Controller
                name="category"
                control={control}
                defaultValue={category}
                render={({ field: { onChange } }) => (
                  <div className="relative w-full">
                    {/* Selected Option */}
                    <div
                      className="bg-gray-200  dark:bg-gray-600  border border-gray-300 p-2 rounded cursor-pointer text-gray-900 dark:text-white"
                      onClick={() => setIsOpen((prev) => !prev)}
                    >
                      {category
                        ? categories.find((c) => c.id === category)?.name
                        : categories.length > 0
                        ? categories[0].name
                        : "Add Category"}
                    </div>

                    {/* Options List */}
                    {isOpen && categories.length > 0 && (
                      <div className="absolute z-40 top-full left-0 w-full bg-white  dark:bg-gray-600  border border-gray-300 mt-1 rounded shadow-lg">
                        {isPending && (
                          <div className="flex justify-center items-center absolute w-full h-full bg-slate-950 bg-opacity-10">
                            <Loader className="animate-spin  text-green-700 dark:text-green-300 z-50" />
                          </div>
                        )}
                        {categories.map((option, index) => (
                          <div
                            key={option.id}
                            className="p-2 hover:bg-gray-100  dark:bg-gray-600 cursor-pointer relative text-gray-900 dark:text-white"
                            onClick={() => {
                              onChange(option.id);
                              setCategory(option.id);
                              setIsOpen((prev) => !prev);
                            }}
                          >
                            {option.name}
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCategory(option.id);
                              }}
                              className="absolute right-1 top-1 text-red-500"
                            >
                              <X />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              />
              {children}
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          {errors.description && (
            <FormMessage message={errors.description.message!} />
          )}
          <label
            htmlFor="message"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Description
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            name="description"
            rows={4}
            className="hidden p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Write your thoughts here..."
          ></textarea>
          <Controller
            name="description"
            control={control}
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <Editor
                {...field}
                onChange={(content) => {
                  field.onChange(content);
                  setDesc(content);
                }}
                value={desc}
              />
            )}
          />
        </div>
        <button
          disabled={optimisticSubmit === "Loading..."}
          className="text-white  self-center bg-gray-800  hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
        >
          {optimisticSubmit}
        </button>
      </div>
    </>
  );
};

type addNoteParams = {
  categories: Category[];
  note?: NoteType;
};
const FormNote = ({ categories, note }: addNoteParams) => {
  const [optimisticSubmit, addOptimisticSubmit] = useOptimistic(
    note ? "Update" : "Add",
    () => "Loading..."
  );
  type FormSchemaType = z.infer<typeof formSchema>;
  const formRef = useRef<HTMLFormElement>(null);
  const {
    control,
    register,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: note?.title,
      description: note?.description,
      category: note?.categoryId,
    },
  });

  const conditionAction = async (
    previousState: FormState,
    data: FormData
  ): Promise<FormState> => {
    addOptimisticSubmit("");
    if (note && note.id) {
      data.append("noteId", note.id);

      return await updateNote(
        {
          message: "",
        },
        data
      );
    } else {
      return await addNote(
        {
          message: "",
        },
        data
      );
    }
  };
  const [error, formAction] = useFormState<FormState, FormData>(
    conditionAction,
    {
      message: "",
    }
  );

  const [show, setShow] = useState(false);
  return (
    <>
      <form
        ref={formRef}
        className="w-[90%]"
        action={formAction}
        onSubmit={(evt) => {
          evt.preventDefault();
          handleSubmit(() => {
            formAction(new FormData(formRef.current!));
          })(evt);
        }}
      >
        <FormContent
          control={control}
          categories={categories}
          note={note}
          register={register}
          errors={errors}
          actionError={error}
          optimisticSubmit={optimisticSubmit}
        >
          <button type="button" onClick={() => setShow((prev) => !prev)}>
            <CirclePlus />
          </button>
        </FormContent>
      </form>
      {show && <AddCategory setShow={setShow} show={show} />}
    </>
  );
};

export default FormNote;
