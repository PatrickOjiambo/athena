
import React from 'react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Button } from './ui/button';

// Sample data for charts
const portfolioData = [
  { name: 'SOL', value: 1245, color: '#9945FF' },
  { name: 'JUP', value: 587.5, color: '#14F195' },
  { name: 'USDC', value: 420.69, color: '#2775CA' },
  { name: 'BONK', value: 104.23, color: '#F0B90B' },
];

const pnlData = [
  { date: 'May 14', value: 2100 },
  { date: 'May 15', value: 2050 },
  { date: 'May 16', value: 2200 },
  { date: 'May 17', value: 2320 },
  { date: 'May 18', value: 2180 },
  { date: 'May 19', value: 2280 },
  { date: 'May 20', value: 2357 },
];

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
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Portfolio Dashboard</h2>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/5 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
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
                    <span className="text-sm">{item.name}: ${item.value}</span>
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
                <div className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
                  High Risk • 75/100
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Risk Score</span>
                  <span className="text-sm">75/100</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" 
                    style={{ width: '75%' }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Memecoin Exposure</p>
                  <p className="font-medium">4.4% of portfolio</p>
                  <p className="text-xs text-amber-400">Moderate risk factor</p>
                </div>
                
                <div className="glass-card p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Stablecoin Ratio</p>
                  <p className="font-medium">17.8% (USDC)</p>
                  <p className="text-xs text-red-400">High risk factor</p>
                </div>
                
                <div className="glass-card p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Token Diversification</p>
                  <p className="font-medium">4 tokens</p>
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
              Connect your wallet to view your transaction history.
            </p>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations">
          <Card className="glass-card p-5">
            <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
            <p className="text-muted-foreground">
              Connect your wallet to receive personalized AI recommendations.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioDashboard;
