import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import React from 'react'

const layout = async({children}:{children:React.ReactNode}) => {
    const session = await getServerSession(authOptions)

    if(!session?.user || session?.user?.name!='secured'){
      redirect("/login")
    }
  return (
    <div>

      {children}
    </div>
  )
}

export default layout
