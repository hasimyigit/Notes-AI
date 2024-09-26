"use client";
import Input from "@/components/atoms/Input/Input";
import { SearchCode } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";

const Search = ({ totalNotes }: { totalNotes: number }) => {
  
  const { replace,prefetch } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qLimit = searchParams.get("limit");
  const query = searchParams.get("q");
  const [text, setText] = useState(query || "");
  const [limit, setLimit] = useState(
    Number(qLimit) > 1 ? Number(qLimit) : 1
  );
  const [offSet, setOffSet] = useState(0);

  useEffect(()=>{
    if(!qLimit || limit > 1){
      const params = new URLSearchParams(searchParams);
      params.set("limit", limit.toString());
      const preParams = new URLSearchParams(searchParams);
      preParams.set("limit", (limit+1).toString());
      replace(`${pathname}?${params}`, { scroll: false });
      prefetch(`${pathname}?${preParams}`);
    }
  },[qLimit, limit])
  


  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight+2;
      const offsetHeight = document.body.offsetHeight
      if (scrollPosition >= offsetHeight && offSet < offsetHeight) {
        if (limit * 6 < totalNotes) {
          setLimit((prev) => prev + 1);
          setOffSet(offsetHeight)
         
          
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [totalNotes, limit]);

  useEffect(() => {
    const id = setTimeout(() => {
      handleChange();
    }, 200);
    return () => {
      clearTimeout(id);
    };
  }, [text]);

  const handleChange = () => {
    const params = new URLSearchParams(searchParams);
    if (text.length > 2) {
      params.set("q", text);
    } else {
      params.delete("q");
    }
    replace(`${pathname}?${params}`);
  };

  return (
    <div className="relative">
      <SearchCode className="absolute left-2 top-3" />
      <Input
        type="text"
        name="key"
        value={text}
        placeholder="Search.."
        onChange={(e) => setText(e?.target.value || "")}
      />
    </div>
  );
};

export default Search;
