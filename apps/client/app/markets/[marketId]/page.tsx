import OpinionOrderBook from '@/components/OpinonCard';
import axios from 'axios';
import React from 'react';

interface Order {
  price: string;
  totalQty: number;
}

interface MarketData {
  Yes: Order[];
  No: Order[];
}
 

const getMarket = async (marketId: string): Promise<MarketData> => {
  const response = await axios.get(`http://localhost:3000/api/market/${marketId}`);
  return response.data.data;
};

const Page = async ({ params }: { params: Promise<{ marketId: string }> }) => {
  const marketId =  (await params).marketId
  const market = await getMarket(marketId);
  


  return (

    //  <OpinionOrderBook market={market} marketId={marketId} />
     
    <OpinionOrderBook market={market} marketId={marketId} />
  );
};

export default Page;
