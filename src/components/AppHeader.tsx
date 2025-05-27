
import React from 'react';
import { OKXWalletButton } from './okx-wallet-button';
import Image from 'next/image';

const AppHeader: React.FC = () => {
  return (
    <header className="flex items-center justify-between py-4 px-6 border-b border-white/10">
      <div className="flex items-center">
          {/* <span className="text-white font-bold">AI</span> */}
          <Image src="/okx.jpg" width={30} height={30} className='mr-2 rounded-xl' alt="OKX Logo" />
        <h1 className="text-xl font-bold text-white  font-mono">Athena</h1>
      </div>
      <div className="flex gap-4 items-center">
        <OKXWalletButton />
      </div>
    </header>
  );
};

export default AppHeader;
