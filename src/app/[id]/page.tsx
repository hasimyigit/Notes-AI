
import ViewPage from "@/components/pages/ViewPage/ViewPage";
import React from "react";

const page =  ({ params }: { params: { id: string } }) => {
  
  
  return (
   <ViewPage id={params.id}/>
  )
};

export default page;
