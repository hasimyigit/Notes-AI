import React from "react";
type props = {
  children?: React.ReactNode | React.ReactElement;
  className?: string;
  id?: string;
  onClick?:()=>void
};
const Card = (props: props) => {
  return (
    <div
      {...props}
      className={`${
        props?.className ? props.className : ""
      } rounded shadow-sm border`}
    >
      {props.children}
    </div>
  );
};

export default Card;
