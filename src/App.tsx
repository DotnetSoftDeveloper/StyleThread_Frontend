import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import NoContentFound from "./NoContentFound";
import renderPublicRoutes from "./app/router/public.routes";
import renderSuperAdminRoutes from "./app/router/superAdmin.routes";
import renderStoreAdminRoutes from "./app/router/storeAdmin.routes";
import renderStorefrontRoutes from "./app/router/storefront.routes";

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        {/* 1. DukaanOnline Public Business Website */}
        {renderPublicRoutes()}

        {/* 2. Super Admin Platform Control Center */}
        {renderSuperAdminRoutes()}

        {/* 3. Store Admin Merchant Management Portal */}
        {renderStoreAdminRoutes()}

        {/* 4. Client Shopping Storefronts */}
        {renderStorefrontRoutes()}

        {/* 404 Fallback */}
        <Route path="/NoContentFound" element={<NoContentFound />} />
        <Route path="*" element={<NoContentFound />} />
      </Routes>
    </div>
  );
};

export default App;
