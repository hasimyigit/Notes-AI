"use client";

import { myStorage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Loader } from "lucide-react";
import Quill from "quill";
import { useCallback, useRef, useTransition, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {createWorker }  from 'tesseract.js';

interface EditorProps {
  onChange: (value: string) => void;
  value: string;
  options?: { heigth: string };
}

const Editor = ({ onChange, value }: EditorProps) => {
  const quillRef = useRef<ReactQuill>(null);
  const [isPending, startTransition] = useTransition();
  const [observer, setObserver] = useState<MutationObserver | null>(null);
  useEffect(() => {
    const quill = quillRef.current?.getEditor();

    if (quill) {
      quill.root.addEventListener("paste", handlePaste);

      const newObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach(async (node) => {
            if (node.nodeName === "IMG") {
              const imgElement = node as HTMLImageElement; 

              if (imgElement.getAttribute('data-processed')) return;
              imgElement.setAttribute('data-processed',"true")
              const imgSrc = imgElement.getAttribute('src'); 

              if (imgSrc && imgSrc.startsWith('data:image/')) {
                let uniqFileName = generateUniqueId()
                const file = base64ToFile(imgSrc, uniqFileName);
                const worker = await createWorker('eng');
                const fileUrl = URL.createObjectURL(file)
                const { data: { text } } = await worker.recognize(fileUrl);
                const hiddenOcrElement = `<ol style="display: none"><li>${text}</li></ol>`
                
                const editor = quillRef.current?.getEditor();
                if (editor) {
                  editor.root.innerHTML += hiddenOcrElement
                }
              }
            }
          });
        });
      });

      newObserver.observe(quill.root, {
        childList: true,
        subtree: true,
      });
      setObserver(newObserver);
    }

    return () => {
      if (quill) {
        quill.root.removeEventListener("paste", handlePaste);
        observer?.disconnect();
      }
    };
  }, []);

  const handlePaste = async (event: ClipboardEvent) => {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;
    const editor = quillRef.current?.getEditor();
    const items = clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file && editor) {
          let id = generateUniqueId();
          await uploadAndInsertImage(file, editor, id);
          
        }
      }
    }
  };

  const imageHandler = useCallback(() => {
    const input: HTMLInputElement = document.createElement("input");
    const editor = quillRef.current?.getEditor();
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file: File | null = input.files ? input.files[0] : null;

      if (file && editor) {
        await uploadAndInsertImage(file, editor);
      }
    };
  }, []);

  function generateUniqueId(): string {
    const timestamp = new Date().getTime();
    const randomNum = Math.random().toString(36).slice(2);
    return `id-${timestamp}-${randomNum}`;
  }

  function base64ToFile(base64Data: string, fileName: string): File {
    const [header, data] = base64Data.split(',');
    
    if (!header || !data) {
      throw new Error('Invalid base64 format');
    }
    
    const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
  
    try {
      const binaryData = atob(data);
      const arrayBuffer = new ArrayBuffer(binaryData.length);
      const uint8Array = new Uint8Array(arrayBuffer);
  
      // Binary veriyi Uint8Array içine aktar
      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }
  
      // Blob ve File nesnesini oluştur
      const blob = new Blob([arrayBuffer], { type: mimeType });
      return new File([blob], fileName, { type: mimeType });
  
    } catch (error) {
      throw new Error('Failed to decode base64 data');
    }
  }
  
  

  const uploadAndInsertImage = async (
    file: File,
    editor: Quill,
    id?: string
  ) => {
    const storageRef = ref(myStorage, id ? id + file.name  : file.name);
    const worker = await createWorker('eng');
    const fileUrl = URL.createObjectURL(file)
    startTransition(async () => {
      
      try {

        const range = editor.getSelection();
        const downloadURL = await getDownloadURL(storageRef);
        range && editor.insertEmbed(range.index, "image", downloadURL);
       
      
        const { data: { text } } = await worker.recognize(fileUrl);
       
        const hiddenOcrElement = `<ol style="display: none"><li>${text}</li></ol>`
        editor.root.innerHTML += hiddenOcrElement
      } catch (error) {
        const range = editor.getSelection();
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        range && editor.insertEmbed(range.index, "image", downloadURL);
       
        const { data: { text } } = await worker.recognize(fileUrl);
       
        const hiddenOcrElement = `<ol style="display: none"><li>${text}</li></ol>`
        editor.root.innerHTML += hiddenOcrElement
      }
    });
  };

  const modules = {
    toolbar: {
      container: [
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  };
  const formats = [
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];
  return (
    <div className="relative">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        className={
          isPending
            ? "mb-6 whitespace-pre-wrap blur-sm"
            : "mb-6 whitespace-pre-wrap"
        }
        modules={modules}
        formats={formats}
      ></ReactQuill>
      {isPending && (
        <div className="z-10 absolute inset-1/2  -translate-x-1/2 -translate-y-1/2">
          <Loader className="animate-spin" />
        </div>
      )}
    </div>
  );
};

export default Editor;
