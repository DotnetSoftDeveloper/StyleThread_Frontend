import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../Shared/Navbar";
import Footer from "../../Shared/Footer";

export const StorefrontLayout: React.FC = () => {
  return (
    <div className="storefront-layout">
      <Navbar />
      <main className="storefront-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default StorefrontLayout;
