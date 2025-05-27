"use client";
import AppHeader from "@/components/AppHeader";
import WalletSidebar from "@/components/WalletSidebar";
import ChatContainer from "@/components/ChatContainer";
import PortfolioDashboard from "@/components/PortfolioDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <WalletSidebar />

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="chat" className="w-full h-full">
            <div className="border-b border-white/10 px-6">
              <TabsList className="bg-transparent">
                <TabsTrigger
                  value="chat"
                  className="cursor-pointer data-[state=active]:bg-white/8"
                >
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="portfolio"
                  className="cursor-pointer data-[state=active]:bg-white/8"
                >
                  Portfolio
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="chat"
              className="h-[calc(100%-41px)] m-0 overflow-hidden"
            >
              <ChatContainer />
            </TabsContent>

            <TabsContent
              value="portfolio"
              className="h-[calc(100%-41px)] m-0 overflow-auto"
            >
              <PortfolioDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
