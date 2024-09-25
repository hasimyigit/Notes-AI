import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { NotepadText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <div className="p-3 flex justify-between items-center bg-slate-900 text-white">
      <Link href="/" className="flex items-center gap-2">
      <NotepadText  />
        <h1 >
          Notes 
        </h1>
       
      </Link>
      <div className="flex items-center gap-1">
        <Link href="/create">
          <span>+ New Note</span>
        </Link>
      <ClerkLoading>
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white" />
        </ClerkLoading>
        <ClerkLoaded>
          <SignedIn>
            <div className="cursor-pointer">
             
            </div>
            <div className="cursor-pointer">
            
            </div>
            <div className="cursor-pointer">
              
            </div>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-2 text-sm">
              <Image src="/noAvatar.png" alt="" width={20} height={20} />
              <Link href={"/sign-in"}>Login/Register</Link>
            </div>
          </SignedOut>
        </ClerkLoaded>
    </div>
      </div>
  );
};

export default Header;
