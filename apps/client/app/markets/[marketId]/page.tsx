import OpinionOrderBook from '@/components/OpinonCard';
import axios from 'axios';
import { redirect } from 'next/navigation';
import React from 'react';

interface Order {
  price: string;
  totalQty: number;
}

interface MarketData {
  Yes: Order[];
  No: Order[];
}

type MarketResponse={
  message:string,
  success:boolean,
  data?:MarketData
}
 

const getMarket = async (marketId: string): Promise<MarketResponse> => {
  const response = await axios.get(`http://localhost:3000/api/markets/${marketId}`);
  return response.data;
};

const Page = async ({ params }: { params: Promise<{ marketId: string }> }) => {
  const marketId =  (await params).marketId
  const market:MarketResponse = await getMarket(marketId);
  if(!market.data){
    redirect('/markets')
  }


  return (

    //  <OpinionOrderBook market={market} marketId={marketId} />
     
    <OpinionOrderBook market={market.data} marketId={marketId} />
  );
};

export default Page;
