import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AdminView } from './components/AdminView';
import { AuctionDetailView } from './components/AuctionDetailView';
import { AuthModal } from './components/AuthModal';
import { CatalogView } from './components/CatalogView';
import { EscrowView } from './components/EscrowView';
import { Navbar } from './components/Navbar';
import { PaymentModal } from './components/PaymentModal';
import { ReportView } from './components/ReportView';
import { SellProductView } from './components/SellProductView';
import { ToastContainer } from './components/ui';
import { VerifyRequestView } from './components/VerifyRequestView';
import { WantedBoardView } from './components/WantedBoardView';

const MainShell: React.FC = () => {
  const { activeTab, selectedProductId } = useStore();

  const renderContent = () => {
    if (activeTab === 'catalog' && selectedProductId) {
      return <AuctionDetailView />;
    }
    switch (activeTab) {
      case 'catalog':
        return <CatalogView />;
      case 'sell':
        return <SellProductView />;
      case 'verify':
        return <VerifyRequestView />;
      case 'wanted':
        return <WantedBoardView />;
      case 'escrow':
        return <EscrowView />;
      case 'admin':
        return <AdminView />;
      case 'report':
        return <ReportView />;
      default:
        return <CatalogView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-ink">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {renderContent()}
      </main>
      <footer className="border-t border-stoneBorder bg-paper py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-mutedInk">
          <p>
            <strong className="text-ink">SomJing (สมจริง)</strong> — ต้นแบบระบบ E-Commerce
            ซื้อขายและประมูลของสะสมพร้อมระบบ Verified Badge &amp; Escrow Protection
          </p>
          <p className="font-mono">
            University Prototype • GitHub: marchtanu/som-jing
          </p>
        </div>
      </footer>

      <AuthModal />
      <PaymentModal />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <MainShell />
    </StoreProvider>
  );
}

export default App;
