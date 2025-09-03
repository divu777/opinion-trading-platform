import React from 'react'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
const layout =async ({children}:{children:React.ReactNode}) => {
      const session = await getServerSession(authOptions)

    if(session?.user || session?.user?.name!){
      redirect("/")
    }
  return (
    <div>
      {children}
    </div>
  )
}

export default layout
