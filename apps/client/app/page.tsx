"use client";

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Shield,
  Zap,
  Target,
  BarChart3,
  CheckCircle,
  Star,
  ArrowRight,
  Menu,
  X,
  Globe,
  Smartphone,
  Award,
  Clock,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const liveMarkets = [
    {
      id: 1,
      question: "Will Bitcoin reach $100K by end of 2024?",
      yesPrice: 0.67,
      noPrice: 0.33,
      volume: "$2.4M",
      category: "Crypto",
      trending: true
    },
    {
      id: 2,
      question: "Will OpenAI release GPT-5 in 2024?",
      yesPrice: 0.42,
      noPrice: 0.58,
      volume: "$1.8M",
      category: "Tech",
      trending: false
    },
    {
      id: 3,
      question: "Will Elon Musk step down as CEO of X by 2025?",
      yesPrice: 0.23,
      noPrice: 0.77,
      volume: "$956K",
      category: "Business",
      trending: true
    }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Day Trader",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150",
      content: "OpinionTrade has revolutionized how I think about prediction markets. The interface is intuitive and the liquidity is excellent."
    },
    {
      name: "Sarah Johnson",
      role: "Financial Analyst",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
      content: "I've been using this platform for 6 months now. The accuracy of crowd predictions is remarkable, and I've made consistent profits."
    },
    {
      name: "Michael Torres",
      role: "Crypto Enthusiast",
      avatar: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150",
      content: "Finally, a prediction market that gets it right. Fast payouts, fair odds, and amazing community insights."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-[#f9f9f9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <TrendingUp className="w-4 h-4" />
                <span>Join 50,000+ Opinion Traders</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Predict the Future.
                <span className="underline decoration-gray-400 ml-2">
                  Profit from It.
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Trade on real-world events with a neutral, focused trading experience.
                Your opinions have value — see what the world thinks and profit from your insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button onClick={()=>router.push("/signup")} className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 flex items-center justify-center">
                  Start Trading Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button className="border-2 border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-black hover:text-black transition-colors">
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>SEC Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>50K+ Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>$10M+ Volume</span>
                </div>
              </div>
            </div>

            {/* Market Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Trending Markets</h3>
                  <span className="text-sm text-gray-500">Live</span>
                </div>

                <div className="space-y-4">
                  {liveMarkets.slice(0, 2).map((market) => (
                    <div key={market.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-medium flex-1 pr-2">{market.question}</h4>
                        {market.trending && (
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">Hot</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button className="bg-green-100 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                          Yes ${(market.yesPrice * 100).toFixed(0)}¢
                        </button>
                        <button className="bg-red-100 text-red-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                          No ${(market.noPrice * 100).toFixed(0)}¢
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">{market.category}</span>
                        <span>Vol: {market.volume}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 text-black hover:text-gray-700 text-sm font-medium flex items-center justify-center">
                  View All Markets
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
<section id="how-it-works" className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl font-bold mb-4">How It Works</h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Start trading your opinions in three simple steps.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <Target className="w-8 h-8 text-gray-700" />
        </div>
        <h3 className="text-xl font-semibold mb-4">1. Choose Your Market</h3>
        <p className="text-gray-600">
          Explore markets on politics, sports, crypto, and more. Find topics you're confident in.
        </p>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <DollarSign className="w-8 h-8 text-gray-700" />
        </div>
        <h3 className="text-xl font-semibold mb-4">2. Place Your Bet</h3>
        <p className="text-gray-600">
          Buy shares in the outcome you believe will happen. Prices range from 1¢ to 99¢.
        </p>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="w-8 h-8 text-gray-700" />
        </div>
        <h3 className="text-xl font-semibold mb-4">3. Collect Your Winnings</h3>
        <p className="text-gray-600">
          If you're right, winning shares pay out $1. Instant settlement — no delays.
        </p>
      </div>
    </div>
  </div>
</section>
{/* Features */}
<section id="features" className="py-16 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl font-bold mb-4">Why Choose OpinionTrade?</h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Built for accuracy, speed, and a clean trading experience.
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
          <Zap className="w-6 h-6 text-gray-700" />
        </div>
        <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
        <p className="text-gray-600">
          Execute trades in milliseconds with a high-speed matching engine.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-gray-700" />
        </div>
        <h3 className="text-xl font-semibold mb-3">Bank-Grade Security</h3>
        <p className="text-gray-600">
          Funds are secured with encryption and cold storage. Regulated and compliant.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
          <Smartphone className="w-6 h-6 text-gray-700" />
        </div>
        <h3 className="text-xl font-semibold mb-3">Mobile First</h3>
        <p className="text-gray-600">
          Trade from any device. Fully responsive and optimized for performance.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
          <BarChart3 className="w-6 h-6 text-gray-700" />
        </div>
        <h3 className="text-xl font-semibold mb-3">Advanced Analytics</h3>
        <p className="text-gray-600">
          Real-time data, price charts, and market depth — at your fingertips.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-gray-700" />
        </div>
        <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
        <p className="text-gray-600">
          Learn from traders, share your views, and grow your edge.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
          <Clock className="w-6 h-6 text-gray-700" />
        </div>
        <h3 className="text-xl font-semibold mb-3">24/7 Trading</h3>
        <p className="text-gray-600">
          Markets never sleep. Trade any time, on your schedule.
        </p>
      </div>
    </div>
  </div>
</section>
{/* Footer */}
<footer className="bg-gray-900 text-white py-12">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">OpinionTrade</span>
        </div>
        <p className="text-gray-400 mb-6">
          The cleanest, fastest, most accurate way to trade your opinions.
        </p>
        <div className="flex space-x-4">
          <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
            <Twitter className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
            <Instagram className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
            <Linkedin className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-6">Product</h3>
        <ul className="space-y-3 text-gray-400">
          <li><a href="#" className="hover:text-white">Markets</a></li>
          <li><a href="#" className="hover:text-white">How It Works</a></li>
          <li><a href="#" className="hover:text-white">Pricing</a></li>
          <li><a href="#" className="hover:text-white">API</a></li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-6">Company</h3>
        <ul className="space-y-3 text-gray-400">
          <li><a href="#" className="hover:text-white">About Us</a></li>
          <li><a href="#" className="hover:text-white">Careers</a></li>
          <li><a href="#" className="hover:text-white">Press</a></li>
          <li><a href="#" className="hover:text-white">Contact</a></li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-6">Support</h3>
        <ul className="space-y-3 text-gray-400">
          <li><a href="#" className="hover:text-white">Help Center</a></li>
          <li><a href="#" className="hover:text-white">Terms of Service</a></li>
          <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-white">Security</a></li>
        </ul>
      </div>
    </div>

    <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
      <p className="text-gray-400 text-sm">
        © 2024 OpinionTrade. All rights reserved.
      </p>
      <div className="flex items-center space-x-6 mt-4 md:mt-0">
        <div className="flex items-center space-x-2 text-gray-400 text-sm">
          <Shield className="w-4 h-4" />
          <span>SEC Registered</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-400 text-sm">
          <Globe className="w-4 h-4" />
          <span>Global Platform</span>
        </div>
      </div>
    </div>
  </div>
</footer>


      {/* Additional sections (How It Works, Features, Footer, etc.) */}
      {/* You can apply similar class replacements in those sections too:
          - Replace bg-blue-100 → bg-gray-200
          - Replace icon color classes → text-gray-700
          - Remove color gradients and use neutral tones
          - Use bg-black and text-white for strong CTA buttons
          - Use green/red ONLY for Yes/No buttons
      */}

    </div>
  );
}
