import { useState } from 'react';
import { TabType } from './types';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import ReviewLibrary from './pages/ReviewLibrary';
import Insights from './pages/Insights';
import Schedule from './pages/Schedule';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'review': return <ReviewLibrary />;
      case 'insights': return <Insights />;
      case 'schedule': return <Schedule />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="pb-16 md:pb-0">{renderPage()}</div>
    </div>
  );
}
