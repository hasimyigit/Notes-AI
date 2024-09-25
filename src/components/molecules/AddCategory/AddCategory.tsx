"use client";
import Input from "@/components/atoms/Input/Input";
import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useFormState, useFormStatus } from "react-dom";
import { addCategory, FormState } from "@/lib/actions";

const FormContent = ({
  formRef,
  error,
  setShow,
}: {
  formRef: React.RefObject<HTMLDivElement>;
  error: FormState;
  setShow: Dispatch<SetStateAction<boolean>>;
}) => {
  const { pending: isPending } = useFormStatus();

  const closePopup = (): void => {
    setShow(false);
  };

  useEffect(() => {
    if (error.message === "Category Added") {
      setTimeout(closePopup, 2000);
    }
  }, [error.message]);

  return (
    <div className="fixed z-50 dark:bg-[#0f172abf] bg-slate-950 bg-opacity-10  w-full h-screen flex justify-center items-center left-0 top-0">
      <div
        className="flex flex-col dark:bg-slate-500 bg-white border rounded-lg p-5 relative"
        ref={formRef}
      >
        <label
          htmlFor="message"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Category Name
        </label>
        <Input type="text" name="categoryName" />
        <button
          disabled={isPending}
          className="text-white mt-6 self-center bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
        >
          {isPending ? "Loading.." : "Add"}
        </button>
        <p className="mt-6">{error.message}</p>
      </div>
    </div>
  );
};

const AddCategory = ({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) => {
  const formRef = useRef<HTMLDivElement>(null);

  const handleTarget = (e: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(e.target as Node)) {
      setShow(!show);
    }
  };

 useEffect(() => {
    if (typeof window !== "undefined") {
      document.addEventListener("click", handleTarget);
    }
    return () => {
      document.removeEventListener("click", handleTarget);
    };
  })

  const [error, action] = useFormState<FormState, FormData>(addCategory, {
    message: "",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ ease: "backInOut", duration: 0.75 }}
    >
      <form action={action}>
        <FormContent error={error} formRef={formRef} setShow={setShow} />
      </form>
    </motion.div>
  );
};

export default AddCategory;
