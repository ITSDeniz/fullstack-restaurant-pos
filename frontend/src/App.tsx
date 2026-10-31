import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { TableSelector } from './components/layout/TableSelector';
import { MenuSection } from './components/menu/MenuSection';
import { CartPanel } from './components/cart/CartPanel';
import { ToastContainer } from './components/common/Toast';
import { usePosStore } from './stores/usePosStore';

export function App() {
  const { fetchInitialData } = usePosStore();

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Header />

      {/* Tables Quick Selector */}
      <TableSelector />

      {/* Main Two-Panel POS Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Menu Categories & Product Cards */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          <MenuSection />
        </div>

        {/* Right Panel: Active Table Order, Items & Checkout */}
        <CartPanel />
      </main>

      {/* System Toasts */}
      <ToastContainer />
    </div>
  );
}

export default App;
