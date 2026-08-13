import { Header } from './components/layout/Header';
import { HeroSection } from './components/hero/HeroSection';
import { MarqueeBanner } from './components/sections/MarqueeBanner';
import { CourseModulesSection } from './components/sections/CourseModulesSection';
import { CurriculumSection } from './components/sections/CurriculumSection';
import { BenefitsSection } from './components/sections/BenefitsSection';
import { PrivilegesSection } from './components/sections/PrivilegesSection';
import { AuthorSection } from './components/sections/AuthorSection';
import { FaqSection } from './components/sections/FaqSection';
import { Footer } from './components/layout/Footer';
import { landingData } from './data/landingData';

import { AppProvider } from './context/AppContext';
import { AuthModal } from './components/auth/AuthModal';
import { PayPalModal } from './components/payment/PayPalModal';
import { VideoPlayerModal } from './components/video/VideoPlayerModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';

export function AppContent() {
  return (
    <div className="min-h-screen bg-[#031a48] text-white flex flex-col font-sans selection:bg-[#fabb15] selection:text-[#001848]">
      {/* Header Navigation */}
      <Header channels={landingData.navigation.channels} />

      <main className="flex-1">
        {/* Hero Section + Sticky Form */}
        <HeroSection />

        {/* Endless Marquee Ticker */}
        <MarqueeBanner />

        {/* 100+ Videos Course Modules & Syllabus Section */}
        <CourseModulesSection />

        {/* Course Curriculum & Modules Overview */}
        <CurriculumSection />

        {/* Dynamic Benefits Grid Cards */}
        <BenefitsSection />

        {/* Member Privileges 01-05 */}
        <PrivilegesSection />

        {/* Author & Instructor Bio (SAR0) */}
        <AuthorSection />

        {/* FAQs Accordion */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Interactive Modals */}
      <AuthModal />
      <PayPalModal />
      <VideoPlayerModal />
      <AdminDashboardModal />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
