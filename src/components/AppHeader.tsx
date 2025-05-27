
import React from 'react';
import { OKXWalletButton } from './okx-wallet-button';

const AppHeader: React.FC = () => {
  return (
    <header className="flex items-center justify-between py-4 px-6 border-b border-white/10">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-md bg-gradient-purple flex items-center justify-center mr-3">
          <span className="text-white font-bold">AI</span>
        </div>
        <h1 className="text-xl font-bold text-white  font-mono">Athena</h1>
      </div>
      <div className="flex gap-4 items-center">
        <OKXWalletButton />
      </div>
    </header>
  );
};

export default AppHeader;
