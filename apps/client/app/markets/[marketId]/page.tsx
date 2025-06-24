import axios from 'axios';
import React from 'react'

const getMarket = async(marketId:string)=>{
  const response = await axios.get(`http:localhost:3000/api/market/${marketId}`)
  console.log(JSON.stringify(response.data)+"-------><")

}

const page = async({params}:{params:Promise<{marketId:string}>}) => {

    const marketId = (await params).marketId;
    await getMarket(marketId)

  return (
    <div>
      {marketId}
    </div>
  )
}

export default page
