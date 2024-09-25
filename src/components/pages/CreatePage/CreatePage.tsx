

import FormNote from "@/components/molecules/FormNote/FormNote";
import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import React from "react";

const CreatePage = async () => {
  const { userId: currentUserId } = auth();
 
  const categories = await prisma.category.findMany({where:{
    userId:currentUserId!
  }});

  return (
    <div className="flex justify-center  ">
       <FormNote categories={categories}/>
    </div>
  );
};

export default CreatePage;
