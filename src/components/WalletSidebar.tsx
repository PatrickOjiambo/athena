
import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowRight } from 'lucide-react';

interface TokenProps {
  symbol: string;
  name: string;
  amount: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const TokenCard: React.FC<TokenProps> = ({ symbol, name, amount, value, change, isPositive }) => {
  return (
    <Card className="glass-card mb-3 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center">
            <span className="text-xs font-bold">{symbol}</span>
          </div>
          <div>
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{amount} {symbol}</p>
          </div>
        </div>
        <Badge className={isPositive ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"}>
          {change}
        </Badge>
      </div>
      <p className="text-sm font-semibold">${value}</p>
    </Card>
  );
};

const WalletSidebar: React.FC = () => {
  // Sample data
  const tokens: TokenProps[] = [
    { symbol: 'SOL', name: 'Solana', amount: '12.45', value: '1,245.00', change: '+2.4%', isPositive: true },
    { symbol: 'JUP', name: 'Jupiter', amount: '1,459.32', value: '587.50', change: '-0.8%', isPositive: false },
    { symbol: 'USDC', name: 'USD Coin', amount: '420.69', value: '420.69', change: '+0.1%', isPositive: true },
    { symbol: 'BONK', name: 'Bonk', amount: '15,928,300', value: '104.23', change: '+12.5%', isPositive: true },
  ];

  const totalValue = "2,357.42";
  const riskScore = 75;

  return (
    <aside className="w-80 border-r border-white/10 p-4 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-1">Wallet Balance</h2>
        <div className="flex items-baseline">
          <p className="text-2xl font-bold">${totalValue}</p>
          <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 ml-2">
            +4.2%
          </Badge>
        </div>
        <div className="my-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Risk Level</span>
            <Badge className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">
              High
            </Badge>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" 
              style={{ width: `${riskScore}%` }}
            />
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">Assets</h3>
          <button className="text-xs text-okx-purple flex items-center">
            View All 
            <ArrowRight className="h-3 w-3 ml-1" />
          </button>
        </div>
        
        {tokens.map((token) => (
          <TokenCard key={token.symbol} {...token} />
        ))}
      </div>
    </aside>
  );
};

export default WalletSidebar;
