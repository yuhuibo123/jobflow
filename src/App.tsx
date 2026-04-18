import { useState } from 'react';
import { TabType } from './types';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import ReviewLibrary from './pages/ReviewLibrary';
import Insights from './pages/Insights';
import Schedule from './pages/Schedule';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [reviewCreateRequest, setReviewCreateRequest] = useState(0);
  const [scheduleCreateRequest, setScheduleCreateRequest] = useState(0);

  const openReviewCreate = () => {
    setActiveTab('review');
    setReviewCreateRequest((count) => count + 1);
  };

  const openScheduleCreate = () => {
    setActiveTab('schedule');
    setScheduleCreateRequest((count) => count + 1);
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onStartReview={openReviewCreate} />;
      case 'review': return <ReviewLibrary createRequest={reviewCreateRequest} onAddToSchedule={openScheduleCreate} />;
      case 'insights': return <Insights />;
      case 'schedule': return <Schedule createRequest={scheduleCreateRequest} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="pb-16 md:pb-0">{renderPage()}</div>
    </div>
  );
}
