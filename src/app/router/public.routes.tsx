import { Route, Navigate } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout/PublicLayout";
import LandingPage from "../../features/public-website/pages/LandingPage";
import AboutPage from "../../features/public-website/pages/AboutPage";
import ServicesPage from "../../features/public-website/pages/ServicesPage";
import HowItWorksPage from "../../features/public-website/pages/HowItWorksPage";
import PricingPage from "../../features/public-website/pages/PricingPage";
import FaqPage from "../../features/public-website/pages/FaqPage";
import ContactPage from "../../features/public-website/pages/ContactPage";
import { PrivacyPage, TermsPage } from "../../features/public-website/pages/LegalPages";
import StoreApplicationPage from "../../features/store-applications/pages/StoreApplicationPage";
import ApplicationStatusPage from "../../features/store-applications/pages/ApplicationStatusPage";

export const renderPublicRoutes = () => (
  <Route element={<PublicLayout />}>
    <Route path="/" element={<LandingPage />} />
    <Route path="/business" element={<LandingPage />} />
    <Route path="/services" element={<ServicesPage />} />
    <Route path="/how-it-works" element={<HowItWorksPage />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/faq" element={<FaqPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/privacy" element={<PrivacyPage />} />
    <Route path="/terms" element={<TermsPage />} />
    <Route path="/apply" element={<StoreApplicationPage />} />
    <Route path="/apply/status" element={<ApplicationStatusPage />} />
    <Route path="/home" element={<Navigate to="/" replace />} />
  </Route>
);

export default renderPublicRoutes;
