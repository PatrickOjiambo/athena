import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Button } from './ui/button';
import { useOKXWallet } from '@/hooks/useOKXWallet';
import { TokenAssets } from '@/types/okx_types';
import getUserPortfolio from '@/agent/tools/get_user_portfolio';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-2 text-xs">
        <p>{`${payload[0].payload.date}: $${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const PortfolioDashboard: React.FC = () => {
  const { isConnected, publicKey } = useOKXWallet();
  const [portfolioData, setPortfolioData] = useState<Array<{name: string, value: number, color: string}>>([]);
  const [pnlData, setPnlData] = useState<Array<{date: string, value: number}>>([]);
  const [riskData, setRiskData] = useState({
    score: 75,
    memecoinExposure: '4.4%',
    stablecoinRatio: '17.8% (USDC)',
    tokenCount: 4
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchPortfolioData = async (address: string) => {
    try {
      setIsLoading(true);
      const tokenAssets = await getUserPortfolio(address);
      
      const pieData = tokenAssets.map(token => ({
        name: token.symbol,
        value: token.balance * token.tokenPrice,
        color: getTokenColor(token.symbol)
      }));
      setPortfolioData(pieData);

      const pnl = generatePnLData(pieData.reduce((sum, token) => sum + token.value, 0));
      setPnlData(pnl);

      setRiskData(calculateRiskMetrics(tokenAssets));

    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchPortfolioData(publicKey);
      const interval = setInterval(() => fetchPortfolioData(publicKey), 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, publicKey]);

  // Helper functions
const getTokenColor = (symbol: string): string => {
  // Predefined colors for common tokens
  const predefinedColors: Record<string, string> = {
    'SOL': '#F0B90B',
    'JUP': '#14F195',
    'USDC': '#2775CA',
    'BONK': '#9945FF',
    'BTC': '#F7931A',
    'ETH': '#627EEA',
    'OKB': '#2E60FF',
    'DOGE': '#C2A633',
    'SHIB': '#E42D04',
    'MATIC': '#8247E5'
  };

  // Return predefined color if available
  if (predefinedColors[symbol]) {
    return predefinedColors[symbol];
  }

  // Generate consistent random color for unknown tokens
  const hash = Array.from(symbol).reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const hue = Math.abs(hash) % 360;
  const saturation = 70 + Math.abs(hash % 10); // 70-80%
  const lightness = 50 + Math.abs(hash % 15); // 50-65%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

  const generatePnLData = (currentValue: number) => {
    const days = 7;
    const data = [];
    const today = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: currentValue * (0.95 + Math.random() * 0.1) // Random fluctuation
      });
    }
    return data;
  };

  const calculateRiskMetrics = (tokens: TokenAssets[]) => {
    const totalValue = tokens.reduce((sum, token) => sum + (token.balance * token.tokenPrice), 0);
    const riskyValue = tokens.filter(t => t.isRiskToken)
                           .reduce((sum, token) => sum + (token.balance * token.tokenPrice), 0);
    
    return {
      score: Math.min(100, Math.round((riskyValue / totalValue) * 150)),
      memecoinExposure: `${((riskyValue / totalValue) * 100).toFixed(1)}%`,
      stablecoinRatio: `${(tokens.filter(t => t.symbol === 'USDC').reduce((sum, token) => sum + (token.balance * token.tokenPrice), 0) / totalValue * 100).toFixed(1)}% (USDC)`,
      tokenCount: tokens.length
    };
  };

  if (!isConnected) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Portfolio Dashboard</h2>
        <Card className="glass-card p-8 text-center">
          <p className="text-lg mb-4">Please connect your wallet to view portfolio data</p>
          <p className="text-muted-foreground">Use the connect button in the navbar</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Portfolio Dashboard</h2>
        <Card className="glass-card p-8 text-center">
          <p>Loading portfolio data...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Portfolio Dashboard</h2>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/5 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card p-5">
              <h3 className="text-lg font-semibold mb-3">Holdings Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {portfolioData.map((item) => (
                  <div key={item.name} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm">{item.name}: ${item.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="glass-card p-5">
              <h3 className="text-lg font-semibold mb-3">Portfolio Value (7d)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pnlData}>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#9b87f5"
                      strokeWidth={2}
                      dot={{ stroke: '#9b87f5', strokeWidth: 2, r: 4 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          
          <Card className="glass-card p-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Risk Assessment</h3>
                <p className="text-muted-foreground">AI-generated risk analysis of your portfolio</p>
              </div>
              <div className="flex items-center mt-2 md:mt-0">
                <div className={`px-3 py-1 ${
                  riskData.score > 70 ? 'bg-amber-500/20 text-amber-400' :
                  riskData.score > 30 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                } rounded-full text-sm font-medium`}>
                  {riskData.score > 70 ? 'High' : riskData.score > 30 ? 'Medium' : 'Low'} Risk • {riskData.score}/100
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Risk Score</span>
                  <span className="text-sm">{riskData.score}/100</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" 
                    style={{ width: `${riskData.score}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Memecoin Exposure</p>
                  <p className="font-medium">{riskData.memecoinExposure} of portfolio</p>
                  <p className="text-xs text-amber-400">Moderate risk factor</p>
                </div>
                
                <div className="glass-card p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Stablecoin Ratio</p>
                  <p className="font-medium">{riskData.stablecoinRatio}</p>
                  <p className="text-xs text-red-400">High risk factor</p>
                </div>
                
                <div className="glass-card p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Token Diversification</p>
                  <p className="font-medium">{riskData.tokenCount} tokens</p>
                  <p className="text-xs text-amber-400">Moderate risk factor</p>
                </div>
              </div>
              
              <Button className="bg-okx-purple hover:bg-okx-purple/80 text-white w-full md:w-auto">
                Get Rebalancing Suggestions
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card className="glass-card p-5">
            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
            <p className="text-muted-foreground">
              {isConnected ? 'Loading transactions...' : 'Connect your wallet to view your transaction history.'}
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioDashboard;