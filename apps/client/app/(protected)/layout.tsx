import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import React from 'react'

const layout = async({children}:{children:React.ReactNode}) => {
    const session = await getServerSession(authOptions)
    console.log(JSON.stringify(session)+"===========session")

    if(session?.user?.name!='secured'){
        redirect("/login")
    }
  return (
    <div>

      {children}
    </div>
  )
}

export default layout
