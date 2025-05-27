"use client"
import { Card } from '@/components/ui/card';
import { useOKXWallet } from '@/hooks/useOKXWallet';
import { TransactionHistory } from '@/types/okx_types';
import getTransactionHistory from '@/agent/tools/transaction_history';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatTimestamp } from '@/lib/utils';

const formatTransactionType = (itype: string) => {
  const types: Record<string, string> = {
    '0': 'Transfer',
    '1': 'Swap',
    '2': 'Deposit',
    '3': 'Withdraw'
  };
  return types[itype] || itype;
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function TransactionsPage() {
  const { isConnected, publicKey } = useOKXWallet();
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async (address: string) => {
    try {
      setIsLoading(true);
      const txHistory = await getTransactionHistory(address);
      setTransactions(txHistory);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchTransactions(publicKey);
      const interval = setInterval(() => fetchTransactions(publicKey), 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, publicKey]);

  if (!isConnected) {
    return (
      <div className="p-6">
        <Card className="glass-card p-8 text-center">
          <p className="text-lg mb-4">Please connect your wallet to view transaction history</p>
          <Link href="/" passHref>
            <Button variant="outline" className="mt-4 cursor-pointer">
              Back to Portfolio
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <Link href="/" passHref>
          <Button className='cursor-pointer' variant="outline">
            Back to Portfolio
          </Button>
        </Link>
      </div>
      
      <Card className="glass-card p-5">
        {isLoading ? (
          <p>Loading transactions...</p>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left pb-3">Type</th>
                  <th className="text-left pb-3">Token</th>
                  <th className="text-left pb-3">Amount</th>
                  <th className="text-left pb-3">From</th>
                  <th className="text-left pb-3">To</th>
                  <th className="text-left pb-3">Status</th>
                  <th className="text-left pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.txHash} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3">{formatTransactionType(tx.itype)}</td>
                    <td>{tx.symbol}</td>
                    <td>{tx.amount}</td>
                    <td className="text-sm text-muted-foreground">
                      {tx.from[0]?.address?.slice(0, 6)}...{tx.from[0]?.address?.slice(-4)}
                    </td>
                    <td className="text-sm text-muted-foreground">
                      {tx.to[0]?.address?.slice(0, 6)}...{tx.to[0]?.address?.slice(-4)}
                    </td>
                    <td>
                      <span className={tx.txStatus === 'success' ? 'text-green-400' : 'text-red-400'}>
                        {formatStatus(tx.txStatus)}
                      </span>
                    </td>
                    <td className="text-sm text-muted-foreground">
                      {formatTimestamp(tx.txTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No transactions found</p>
        )}
      </Card>
    </div>
  );
}