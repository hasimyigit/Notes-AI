import "./styles.module.css";
import Search from "@/components/molecules/Search/Search";
import { getFilterNote } from "@/lib/actions";
import { Loader, NotebookIcon } from "lucide-react";

import NoteList from "@/components/molecules/NoteList/NoteList";
import Link from "next/link";
import { Suspense } from "react";

export interface PropsType {
  searchParams?: { [key: string]: string | undefined };
}

const Home = async ({ searchParams }: PropsType) => {
  const q = searchParams?.q?.trim() || "";
  const limit = searchParams?.limit?.trim() || "1";
  const { data, message, totalNotes } = await getFilterNote(q, limit);

  return (
    <div id="Home" className="p-6">
      {/* SEARCH */}
      <Search totalNotes={totalNotes} />
      {!q && (
        <p className="text-end mt-3">
          {" "}
          Total notes :{" "}
          {(6 * Number(limit) > totalNotes ? totalNotes : 6 * Number(limit)) +
            "/" +
            totalNotes}
        </p>
      )}
      {/* LIST */}
      <Suspense fallback={<Loader className="animate-spin" />}>
        {data && data.length > 0 ? (
          <NoteList notes={data} q={q} totalNotes={totalNotes} limit={limit} />
        ) : (
          <div className="flex justify-center flex-col items-center h-[calc(100vh-12.5rem)]">
            <Link className="flex flex-col items-center" href={"/create"}>
              <NotebookIcon />
              You don&apos;t have any notes yet, click to add{" "}
            </Link>
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default Home;
