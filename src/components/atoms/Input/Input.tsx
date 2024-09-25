import React, { ChangeEvent, forwardRef } from "react";
type Props = {
  id?: string;
  type: string;
  className?: string;
  placeholder?: string;
  value?: any;
  name?: string;
  onChange?: (
    e?: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
};
const Input = forwardRef<HTMLInputElement, Props>((props, ref) => {
  return (
    <input
     ref={ref}
      autoComplete="off"
      {...props}
      className={`${
        props?.className ? props.className : ""
      } block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500  focus:ring-blue-5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
    />
  );
});

Input.displayName = "Input";

export default Input;
