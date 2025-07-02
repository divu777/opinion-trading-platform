import React from 'react'

const ProtectedRoute = ({children}:{children:React.ReactNode}) => {
  // this will be usefull when i store things in db and have token that i can set and then user cookie
  return (
    <div>
    {children}
    </div>
  )
}

export default ProtectedRoute
