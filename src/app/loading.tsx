import Image from 'next/image'
import React from 'react'

const loading = () => {
  return (
    <div className='flex justify-center items-center h-screen'>
    <Image
    src="/notes.gif"
    alt="Loading.."
    width="192"
    height="192"
    quality="95"
    priority={true}
    className="rounded-full object-cover border-[0.35rem] border-white shadow-xl"
  /></div>
  )
}

export default loading