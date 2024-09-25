"use client";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { noteStore } from "../../../lib/store";
import Markdown from "markdown-to-jsx";
import { useRouter } from "next/navigation";
import { model } from "../../../lib/aiModel";
import { AnimatePresence, motion } from "framer-motion";
import { Content } from "@google/generative-ai";
import { CirclePlus } from "lucide-react";



const ChatPage = () => {
  const scrollDiv = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { history, changeAnswer } = noteStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [chatHistory, setChatHistory] = useState<Content[]>([
    {
      role: "user",
      parts: [{ text: history.message }],
    },
    {
      role: "model",
      parts: [{ text: history.answer }],
    },
  ]);
  const chat = model.startChat({
    history: chatHistory,
  });
  chat.sendMessageStream;
  if (history.message.length <= 2) {
    router.push("/");
  }
  const [selectedFileUrl, setSelectedFileUrl] = useState<{
    data: string;
    mimeType: string;
  }>({ data: "", mimeType: "" });

  function fileToGenerativePart(
    file: File,
    mimeType: string
  ): Promise<{ inlineData: { data: string; mimeType: string } }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (event: ProgressEvent<FileReader>) {
        const result = event.target?.result as string;
        const base64Data = result.split(",")[1]; // Base64 verisini al

        resolve({
          inlineData: {
            data: base64Data,
            mimeType,
          },
        });
      };

      reader.onerror = function (error) {
        reject(error);
      };

      reader.readAsDataURL(file); // Dosyayı base64 formatında oku
    });
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files?.[0];
      setSelectedFile(file);
      try {
        const filePart1 = await fileToGenerativePart(file, file.type);
        setSelectedFileUrl(filePart1.inlineData);
        // aynı file 'ı iki kere seçmek için
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        alert("Yüklendi");
      } catch (error) {
       
      }
    }
  };

  useEffect(() => {
   
    const timeout = setTimeout(() => {
      if (scrollDiv.current) {
        scrollDiv.current.scrollTo({
          top: scrollDiv.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [chatHistory]);

  const handleFileAsk = async () => {
    if (!selectedFile) return;

    try {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ]);
      setPrompt("");
      
      startTransition(async () => {
        const result = await chat.sendMessage([
          {
            inlineData: selectedFileUrl,
          },
          { text: prompt },
        ]);
        setChatHistory((prev) => [
          ...prev,
          {
            role: "model",
            parts: [{ text: result.response.text() }],
          },
        ]);
 
        setSelectedFile(null);
      });
    } catch (error) {
      
    }
  };

  const handleAsk = () => {
    if (!selectedFile) {
      if (prompt.trim().length < 1) return;

      setChatHistory((prev) => [
        ...prev,
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ]);
      setPrompt("");
      startTransition(async () => {
        let result = await chat.sendMessage(prompt);
        setChatHistory((prev) => [
          ...prev,
          {
            role: "model",
            parts: [{ text: result.response.text() }],
          },
        ]);
      });
    }
    handleFileAsk();
  };

  const saveNote = (note: string) => {
    changeAnswer(note);
    router.push("/create");
  };

  return (
    <div className="flex h-[calc(100vh-3.25rem)] antialiased text-gray-800">
      <div className="flex flex-row h-full w-full overflow-x-hidden">
        <div className="flex flex-col flex-auto h-full p-6">
          <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 dark:bg-slate-900 h-full p-4">
            <div
              ref={scrollDiv}
              className="flex flex-col h-full overflow-y-auto overflow-x-hidden  mb-4"
            >
              <div className="flex flex-col h-full">
                <div className="grid grid-cols-12   gap-y-2">
                  <AnimatePresence mode="popLayout">
                    {chatHistory.map((chat, i) =>
                      chat.role === "user" ? (
                        <motion.div
                          key={i}
                          className="col-start-1 md:col-start-2 lg:col-start-4 col-end-13 p-3 rounded-lg"
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ ease: "easeInOut", duration: 0.75 }}
                        >
                          <div className="flex justify-start flex-row-reverse">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                              You
                            </div>
                            <div className="relative mr-3 text-sm bg-indigo-50 dark:bg-slate-800 dark:text-white py-2 px-4 shadow rounded-xl">
                              <Markdown>{chat.parts[0].text || ""}</Markdown>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key={i}
                          className="col-start-1 col-end-13 lg:col-end-10  p-3 rounded-lg"
                          initial={{ x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ ease: "easeInOut", duration: 0.75 }}
                        >
                          <div className="flex flex-row ">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                              AI
                            </div>
                            <div className="relative ml-3 text-sm bg-slate-900 dark:bg-slate-700  py-2 px-4 shadow rounded-xl">
                              <Markdown className=" text-slate-300 dark:text-white rounded-md p-4">
                                {chat.parts[0].text || ""}
                              </Markdown>
                              <button
                                type="button"
                                className="flex items-center gap-1 text-blue-950 bg-gray-300   p-1 rounded-lg -top-3 absolute -right-3"
                                onClick={() =>
                                  saveNote(chat.parts[0].text || "")
                                }
                              >
                                <span className="font-semibold text-xs">Note</span> <CirclePlus size={12}/>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    )}
                    {isPending && (
                      <span className="animate-ping ml-5 mb-5 inline-flex h-4 w-4 rounded-full bg-orange-500 "></span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <div className="flex flex-row items-center h-16 rounded-xl bg-white dark:bg-slate-500 w-full px-4">
              <div>
                <input
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  type="file"
                  className="absolute h-5 w-5 opacity-0"
                />
                <button className="flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    ></path>
                  </svg>
                </button>
              </div>
              <div className="flex-grow ml-4">
                <div className="relative w-full">
                  <input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e)=> e.key ==='Enter' && handleAsk()}
                    type="text"
                    className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
               
                </div>
              </div>
              <div className="ml-4">
                <button
                  type="button"
                  onClick={handleAsk}
                  className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
                >
                  <span>Send</span>
                  <span className="ml-2">
                    <svg
                      className="w-4 h-4 transform rotate-45 -mt-px"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      ></path>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
