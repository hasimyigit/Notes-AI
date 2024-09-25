"use client";
import Card from "@/components/atoms/Card/Card";
import { FormState, removeNote } from "@/lib/actions";
import { model } from "@/lib/aiModel";

import { FilePenLine, Loader, X } from "lucide-react";
import React, { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { noteStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { NoteType } from "@/types";
import Link from "next/link";
import MarkdownRenderer from "../../atoms/Markdown/Markdown";

type OptionsType = {
  screen?: "full";
};

const FormContent = ({
  note,
  options,
}: {
  note: NoteType;
  options?: OptionsType;
}) => {
  const { changeNote } = noteStore();
  const router = useRouter();
  const { pending: isPending } = useFormStatus();
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isPendingAi, startTransition] = useTransition();

  const helpme = () => {
    startTransition(async () => {
      const result = await model.generateContentStream(note.description);
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        setAiResponse((prev) => prev + " " + chunkText);
      }
    });
  };

  const handleNote = () => {
    const history = { message: note.description, answer: aiResponse };
    changeNote(history);
    router.push("/chat");
  };

  const btnClass = `text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ${
    aiResponse.length > 0 ? "inline-block" : "hidden"
  }`;

  return (
    <>
      <Card className="flex flex-col gap-1 p-6 relative h-full">
        <button
          disabled={isPending}
          className="flex gap-3 absolute top-3 right-3"
        >
          <Link href={`/edit/${note.id}`}>
            <FilePenLine />
          </Link>

          <span>{isPending ? <Loader className="animate-spin" /> : <X />}</span>
        </button>
        <Link href={`/${note.id}`} className="max-w-fit">
          <h3 className="font-semibold mt-2 text-black text-2xl dark:text-white">
            {note.title}
          </h3>
        </Link>
        <span className="text-neutral-500">{note.cat?.name}</span>
        <MarkdownRenderer
          content={note.description}
          className={
            options?.screen
              ? "my-4 whitespace-normal"
              : " my-4 whitespace-normal max-h-48 overflow-y-auto"
          }
        />

        <div className="flex justify-between">
          <div>
            <button
              type="button"
              disabled={isPendingAi || aiResponse.length > 0}
              className="disabled:cursor-not-allowed text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 dark:shadow-lg dark:shadow-teal-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
              onClick={() => helpme()}
            >
              Get Support
            </button>
            <button type="button" onClick={handleNote} className={btnClass}>
              Chat
            </button>
          </div>

          <span className="text-end">
            {note.createdAt.toLocaleDateString("en-En", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        {/* AI RESPONSE */}
        <div className="w-full">
          {isPendingAi && (
            <div className="flex justify-center">
              <Loader className="animate-spin" />
            </div>
          )}

          {aiResponse && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ease: "easeInOut", duration: 1 }}
            >
              <MarkdownRenderer
                content={aiResponse}
                className={
                  options?.screen
                    ? "bg-slate-900 text-slate-300 rounded-md p-6 whitespace-normal"
                    : " bg-slate-900 text-slate-300 rounded-md p-6 whitespace-normal max-h-56 overflow-y-auto"
                }
              />
            </motion.div>
          )}
        </div>
      </Card>
      <input type="hidden" name="id" value={note.id} />
    </>
  );
};

const Note = ({ data, options }: { data: NoteType; options?: OptionsType }) => {
  const [error, action] = useFormState<FormState, FormData>(removeNote, {
    message: "",
  });
  return (
    <form action={action}>
      <FormContent note={data} options={options} />
    </form>
  );
};

export default Note;
