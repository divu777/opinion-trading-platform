import React from 'react'

const getMarket = async(marketId:string)=>{

}

const page = async({params}:{params:Promise<{marketId:string}>}) => {

    const marketId = (await params).marketId;
    

  return (
    <div>
      {marketId}
    </div>
  )
}

export default page
