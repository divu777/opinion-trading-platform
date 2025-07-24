import React from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/newfile'
import { getUserData } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, TrendingUp, User, Wallet } from 'lucide-react'

const page = async () => {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.name) {
    redirect('/')
  }

  type ProfileType ={
    res2:{
      balance:number
    },
    res1:{
      stock_balances: Record<string,Record<string,number>>}
  }

  const data:ProfileType = await getUserData(session.user.name)
  const balance = data.res2.balance ?? 0
  const stockHoldings = data.res1.stock_balances ?? {}


  const totalPortfolioValue = Object.values(stockHoldings).reduce((total, positions) => {
    return total + Object.values(positions).reduce((sum, qty) => sum + qty * 5, 0)
  }, 0)

  const totalPositions = Object.values(stockHoldings).reduce((total, positions) => {
    return total + Object.values(positions).reduce((sum, qty) => sum + qty, 0)
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center space-x-3">
            <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center shadow">
              <User className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session.user.name}</h1>
              <p className="text-gray-500">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border border-gray-200 shadow-sm text-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="flex justify-between items-center">
                <span>Wallet Balance</span>
                <Wallet className="w-5 h-5 text-gray-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <p className="text-sm text-gray-500">Available balance</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm text-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="flex justify-between items-center">
                <span>Portfolio Value</span>
                <TrendingUp className="w-5 h-5 text-gray-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{totalPortfolioValue.toLocaleString('en-IN')}</div>
              <p className="text-sm text-gray-500">Current holdings worth</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm text-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="flex justify-between items-center">
                <span>Total Positions</span>
                <Package className="w-5 h-5 text-gray-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPositions}</div>
              <p className="text-sm text-gray-500">Across {Object.keys(stockHoldings).length} markets</p>
            </CardContent>
          </Card>
        </div>

        {/* Holdings */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <Package className="w-5 h-5 text-gray-600" />
              <span>Your Holdings</span>
            </CardTitle>
            <p className="text-sm text-gray-500">Detailed view of your active positions</p>
          </CardHeader>
          <CardContent className="p-6">
            {Object.keys(stockHoldings).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(stockHoldings).map(([marketId, positions], index) => (
                  <Card key={marketId} className="bg-gray-50 border border-gray-200">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-md font-medium text-gray-800">{marketId}</CardTitle>
                        <Badge variant="outline" className="border border-gray-300 text-gray-600 bg-white">
                          Market #{index + 1}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-4 gap-4 text-sm text-gray-500 font-semibold border-b pb-2">
                        <div>Outcome</div>
                        <div className="text-center">Quantity</div>
                        <div className="text-center">Price</div>
                        <div className="text-right">Total</div>
                      </div>
                      {Object.entries(positions).map(([outcome, qty]) => {
                        const pricePerUnit = 5
                        const total = qty * pricePerUnit
                        return (
                          <div
                            key={outcome}
                            className="grid grid-cols-4 gap-4 text-sm py-3 font-medium border-b border-gray-100 last:border-0 hover:bg-gray-100 rounded-md transition"
                          >
                            <div>
                              <Badge
                                variant="outline"
                                className="border border-gray-300 text-gray-700 bg-gray-100"
                              >
                                {outcome}
                              </Badge>
                            </div>
                            <div className="text-center text-gray-900">{qty}</div>
                            <div className="text-center text-gray-700">₹{pricePerUnit}</div>
                            <div className="text-right text-gray-900 font-semibold">₹{total}</div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4 text-gray-500">
                <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-lg font-medium">No holdings yet</p>
                <p className="text-sm max-w-sm mx-auto">
                  Start trading to build your portfolio. Your active positions will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default page
