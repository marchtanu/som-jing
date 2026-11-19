import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AdminView } from './components/AdminView';
import { AuctionDetailView } from './components/AuctionDetailView';
import { AuthModal } from './components/AuthModal';
import { CatalogView } from './components/CatalogView';
import { EscrowView } from './components/EscrowView';
import { Navbar } from './components/Navbar';
import { PaymentModal } from './components/PaymentModal';
import { PolicyModal } from './components/PolicyModal';
import { ReportView } from './components/ReportView';
import { SellProductView } from './components/SellProductView';
import { ToastContainer } from './components/ui';
import { VerifyRequestView } from './components/VerifyRequestView';
import { WantedBoardView } from './components/WantedBoardView';

const MainShell: React.FC = () => {
  const {
    activeTab,
    selectedProductId,
    setActiveTab,
    setSelectedProductId,
    setPolicyModalTopic,
    currentUser,
  } = useStore();

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

  const navigateFooter = (tab: typeof activeTab) => {
    setSelectedProductId(null);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Navbar />
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 xl:px-14 py-6 sm:py-8">
        {renderContent()}
      </main>

      {/* Nike-style 4-column Footer with interactive policy modals */}
      <footer className="bg-canvas border-t border-hairline mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 xl:px-14 py-12 space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h3 className="text-base font-medium text-ink">Resources</h3>
              <ul className="space-y-2.5 text-sm font-medium text-mute">
                <li>
                  <button type="button" onClick={() => navigateFooter('catalog')} className="hover:text-ink">
                    หน้ารวมสินค้าและประมูล
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigateFooter('wanted')} className="hover:text-ink">
                    Wanted Listing Board
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigateFooter('sell')} className="hover:text-ink">
                    ลงขายสินค้า / เปิดรอบประมูล
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-medium text-ink">Help &amp; Escrow</h3>
              <ul className="space-y-2.5 text-sm font-medium text-mute">
                <li>
                  <button type="button" onClick={() => navigateFooter('escrow')} className="hover:text-ink">
                    ติดตามสถานะ Escrow 4 ขั้นตอน
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigateFooter('verify')} className="hover:text-ink">
                    ขอรับรองความแท้ (Verify)
                  </button>
                </li>
                {currentUser?.role === 'admin' && (
                  <li>
                    <button type="button" onClick={() => navigateFooter('admin')} className="hover:text-ink">
                      ศูนย์จัดการข้อร้องเรียนแอดมิน
                    </button>
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-medium text-ink">Company &amp; Report</h3>
              <ul className="space-y-2.5 text-sm font-medium text-mute">
                <li>
                  <button type="button" onClick={() => navigateFooter('report')} className="hover:text-ink">
                    รายงานบทที่ 5 (หัวข้อ 5.1 – 5.7)
                  </button>
                </li>
                <li>
                  <a
                    href="https://github.com/marchtanu/som-jing"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ink"
                  >
                    GitHub Repository
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-medium text-ink">Trust &amp; Ethics</h3>
              <ul className="space-y-2.5 text-sm font-medium text-mute">
                <li>
                  <button
                    type="button"
                    onClick={() => setPolicyModalTopic('authenticity')}
                    className="hover:text-ink text-left"
                  >
                    SomJing Authenticity Guarantee
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setPolicyModalTopic('pdpa')}
                    className="hover:text-ink text-left"
                  >
                    PDPA พ.ศ. 2562 Compliance
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setPolicyModalTopic('etransactions')}
                    className="hover:text-ink text-left"
                  >
                    E-Transactions Act &amp; Consumer Protection
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[9px] font-medium text-mute tracking-wide uppercase">
            <p>© 2026 SomJing (สมจริง) University E-Commerce Prototype. All Rights Reserved.</p>
            <div className="flex flex-wrap gap-4">
              <span>Thailand (THB)</span>
              <button
                type="button"
                onClick={() => setPolicyModalTopic('terms')}
                className="hover:text-ink uppercase"
              >
                Terms of Sale
              </button>
              <button
                type="button"
                onClick={() => setPolicyModalTopic('pdpa')}
                className="hover:text-ink uppercase"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setPolicyModalTopic('escrow')}
                className="hover:text-ink uppercase"
              >
                Escrow Protection Policy
              </button>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal />
      <PaymentModal />
      <PolicyModal />
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
