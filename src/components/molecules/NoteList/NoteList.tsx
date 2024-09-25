"use client";
import React from "react";
import Note from "../Note/Note";
import { AnimatePresence, motion } from "framer-motion";
import { NoteType } from "@/types";
import { Loader } from "lucide-react";

const NoteList = ({
  notes,
  q,
  limit,
  totalNotes,
}: {
  notes: NoteType[];
  q: string;
  limit: string;
  totalNotes: number;
}) => {
  const contitionLoader =
    Number(limit) * 6 >= totalNotes ? false : q ? false : true;

    
  return (
    <>
      <div className="grid grid-cols-1  lg:grid-cols-2 gap-4 mt-4">
        <AnimatePresence mode="popLayout">
          {notes.map((note,i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ease: "easeInOut", duration: 1 }}
            >
              <Note data={note} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {contitionLoader && (
        <div className="flex justify-center mt-4">
          <Loader className="animate-spin h-6 w-6" />
        </div>
      )}
    </>
  );
};

export default NoteList;
