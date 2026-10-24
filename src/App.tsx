import React, { useState } from 'react';
import { IssueProvider, useIssues } from './context/IssueContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { IncidentDirectory } from './components/IncidentDirectory';
import { CampusMapExplorer } from './components/CampusMapExplorer';
import { AnalyticsView } from './components/AnalyticsView';
import { EmergencySection } from './components/EmergencySection';
import { ReportIssueModal } from './components/ReportIssueModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { Footer } from './components/Footer';

function MainApp() {
  const [activeTab, setActiveTab] = useState<'incidents' | 'map' | 'analytics' | 'emergency'>('incidents');
  const { isReportModalOpen, setIsReportModalOpen, setSelectedBlockFilter } = useIssues();

  const handleSelectBlockForFilter = (blockName: string) => {
    setSelectedBlockFilter(blockName);
    setActiveTab('incidents');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-rose-100 selection:text-rose-900">
      {/* 3-Zone Navigation Header with Role Switcher */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Hero Section with Kalasalingam University facade & 4-column KPI strip */}
      <HeroSection
        onQuickReportClick={() => setIsReportModalOpen(true)}
        onExploreMapClick={() => setActiveTab('map')}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'incidents' && <IncidentDirectory />}
        {activeTab === 'map' && (
          <CampusMapExplorer onSelectBlockForFilter={handleSelectBlockForFilter} />
        )}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'emergency' && <EmergencySection />}
      </main>

      {/* Modals & Overlays */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
      <TicketDetailModal />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <IssueProvider>
      <MainApp />
    </IssueProvider>
  );
}
