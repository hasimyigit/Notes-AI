"use server"
import Note from "@/components/molecules/Note/Note";
import { getNoteById } from "@/lib/actions";
import { NoteType } from "@/types";

import { redirect } from "next/navigation";
import React from "react";

const ViewPage = async ({id}:{id:string}) => {
  const note = (await getNoteById(id)) as NoteType;
  const options = { screen: "full" } as const;
  if (!note) {
    redirect('/')
  }
  return (
    <div className="p-6">
      <Note data={note} options={options} />
    </div>
  )
};

export default ViewPage;
