import AdminDashboard from '@/components/AdminDashboard'
import {  fetchAllMarkets } from '@/lib/utils'
import React from 'react'

const page = async() => {

  const markets = await fetchAllMarkets()

  console.log(markets)
  return (
    <div>
      <AdminDashboard marketsData={markets}/>
    </div>
  )
}

export default page
