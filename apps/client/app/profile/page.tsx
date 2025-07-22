import { authOptions, getUserData } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import React from 'react'

const page = async() => {
  const session = await getServerSession(authOptions)
  console.log(session)
  
  if(!session || !session.user || !session.user.name){
    redirect("/")
  }
  const data = await getUserData(session.user.name)
  
  return (
    <div className=' flex w-screen h-screen items-center justify-center'>
      <h1>profile page</h1> 
      <h1>{session.user.name ?? " "}</h1>

      <div>

      </div>
    </div>
  )
}

export default page
