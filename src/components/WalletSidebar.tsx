
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowRight } from 'lucide-react';
import { TokenAssets } from '@/types/okx_types';
import getUserPortfolio from '@/agent/tools/get_user_portfolio';
import { useOKXWallet } from '@/hooks/useOKXWallet';

const TokenCard: React.FC<{ token: TokenAssets; priceChange?: number }> = ({ 
  token, 
  priceChange = 0 
}) => {
  const isPositive = priceChange >= 0;
  const changeDisplay = `${isPositive ? '+' : ''}${priceChange.toFixed(2)}%`;

  return (
    <Card className="glass-card mb-3 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center">
            <span className="text-xs font-bold">{token.symbol}</span>
          </div>
          <div>
            <p className="text-sm font-medium">{token.symbol}</p>
            <p className="text-xs text-muted-foreground">{token.balance.toFixed(4)} {token.symbol}</p>
          </div>
        </div>
        <Badge className={isPositive ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"}>
          {changeDisplay}
        </Badge>
      </div>
      <p className="text-sm font-semibold">
        ${(token.balance * token.tokenPrice).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </p>
    </Card>
  );
};

const WalletSidebar: React.FC = () => {
  const { isConnected, publicKey } = useOKXWallet();
  const [tokens, setTokens] = useState<TokenAssets[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
 
  const fetchTokenData = async (address: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      console.log("Fetching for address:", address);
      const tokenAssets = await getUserPortfolio(address);
      setTokens(tokenAssets);
      
       // Calculate total value
      const total = tokenAssets.reduce((sum, token) => {
        return sum + (token.balance * token.tokenPrice);
      }, 0);
      setTotalValue(total);

      const changes = tokenAssets.reduce((acc, token) => {
        acc[token.tokenContractAddress] = token.isRiskToken 
          ? (Math.random() * 10 - 2)
          : (Math.random() * 4 - 1);
        return acc;
      }, {} as Record<string, number>);
      setPriceChanges(changes);
    } catch (err) {
      console.log("focking address",address);
      setError('Failed to fetch token data');
      console.error('Error fetching token data:', err);
    } finally {
      setIsLoading(false);
    }
  };

 useEffect(() => {
    if (isConnected && publicKey) {
      fetchTokenData(publicKey);
      const intervalId = setInterval(() => fetchTokenData(publicKey), 30000);
      return () => clearInterval(intervalId);
    }
  }, [isConnected, publicKey]);

  const calculateRiskScore = (tokens: TokenAssets[]) => {
    if (tokens.length === 0) return 50;
    
    const riskyValue = tokens.reduce((sum, token) => {
      return token.isRiskToken 
        ? sum + (token.balance * token.tokenPrice)
        : sum;
    }, 0);
    
    const riskPercentage = (riskyValue / totalValue) * 100;
    return Math.min(100, Math.max(0, riskPercentage * 1.5));
  };

  const riskScore = calculateRiskScore(tokens);
  const riskLevel = riskScore > 70 ? 'High' : riskScore > 30 ? 'Medium' : 'Low';
  const riskBadgeColor = riskScore > 70 ? 'bg-amber-500/20 text-amber-400' : 
                        riskScore > 30 ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-green-500/20 text-green-400';

  const portfolioChange = tokens.length > 0
    ? Object.values(priceChanges).reduce((sum, change) => sum + change, 0) / tokens.length
    : 0;

  if (!isConnected) {
    return (
      <aside className="w-80 border-r border-white/10 p-4 h-full">
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-center mb-4">Please connect your wallet</p>
          <p className="text-sm text-muted-foreground">
            Use the connect button in the navbar
          </p>
        </div>
      </aside>
    );
  }

  if (isLoading) {
    return (
      <aside className="w-80 border-r border-white/10 p-4 h-full">
        <div className="flex justify-center items-center h-full">
          <p>Loading wallet data...</p>
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="w-80 border-r border-white/10 p-4 h-full">
        <div className="text-red-400 p-4">
          <p>Error: {error}</p>
          <button 
            onClick={() => publicKey && fetchTokenData(publicKey)}
            className="mt-2 text-sm text-okx-purple"
          >
            Retry
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 border-r border-white/10 p-4 h-full">
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-1">Wallet Balance</h2>
        <div className="flex items-baseline">
          <p className="text-2xl font-bold">
            ${totalValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
          <Badge className={`${portfolioChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} hover:bg-opacity-30 ml-2`}>
            {portfolioChange >= 0 ? '+' : ''}{portfolioChange.toFixed(2)}%
          </Badge>
        </div>
        <div className="my-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Risk Level</span>
            <Badge className={`${riskBadgeColor} hover:bg-opacity-30`}>
              {riskLevel}
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
        </div>
        
        {tokens.length > 0 ? (
          tokens.map((token) => (
            <TokenCard 
              key={token.tokenContractAddress}
              token={token}
              priceChange={priceChanges[token.tokenContractAddress] || 0}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No tokens found</p>
        )}
      </div>
    </aside>
  );
};

export default WalletSidebar;
