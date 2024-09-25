import FormNote from '@/components/molecules/FormNote/FormNote';
import { getNoteById } from '@/lib/actions';
import prisma from '@/lib/client';
import { NoteType } from '@/types';
import { auth } from '@clerk/nextjs/server';
import React from 'react'
import { redirect } from 'next/navigation'
const EditPage = async({ params }: { params: { id: string } }) => {
  
  const { userId: currentUserId } = auth();
  const note = (await getNoteById(params.id)) as NoteType;
  if (!note) {
    redirect('/');
  }

  const categories = await prisma.category.findMany({where:{
    userId:currentUserId!
  }});

  return (
    <div className="flex justify-center  ">
       <FormNote categories={categories} note={note} />
    </div>
  );
};

export default EditPage