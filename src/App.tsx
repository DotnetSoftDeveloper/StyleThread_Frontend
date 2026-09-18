import "./App.css";
import About from "./Pages/About/About";
import {  Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import NoContentFound from "./NoContentFound";
import ProductList from "./Components/ProductList/ProductList";
import ProductDetail from "./Pages/ProductDetail/ProductDetail";
import Home from "./Pages/Home/Home";
import Navbar from "./Shared/Navbar";
import AddProduct from "./Pages/AddProduct/AddProduct";
import Cart from "./Pages/Cart/Cart";
import Profile from "./Pages/Profile/Profile";
import Footer from "./Shared/Footer";
import React from "react";
import Confirm from "./Pages/Login/Confirm";
import { Auth } from "./Pages/Login/Auth";

import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./Pages/Login/ForgotPassword";
import ResetPassword from "./Pages/Login/ResetPassword";
import ThankYou from "./Pages/ThankYou/ThankYou";

const App: React.FC = () => {
  return (
      <div className="App">
        <Navbar />
     
          <Routes>
            {/* Redirect root "/" to "/signin" */}
            <Route path="/" element={<Navigate to="/signin" replace />} />

            {/* Public routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/signin" element={<Auth mode="signin" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route path="/confirm" element={<Confirm />} />
            <Route path="/about" element={<About />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/thank-you" element={<ThankYou />} />
            {/* Protected routes */}
            <Route
              path="/productList"
              element={
                <ProtectedRoute
                  element={ProductList}
                  allowedRoles={["Administrator"]}
                />
              }
            />
            <Route
              path="/addProduct"
              element={
                <ProtectedRoute
                  element={AddProduct}
                  allowedRoles={["Administrator"]}
                />
              }
            />
            <Route
              path="/editProduct/:id"
              element={
                <ProtectedRoute
                  element={(props) => <AddProduct {...props} />}
                  allowedRoles={["Administrator"]}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute element={Profile} allowedRoles={["Visitor"]} />
              }
            />
            <Route
              path="/product/:id"
              element={
                <div className="product-form">
                  <ProductDetail />
                </div>
              }
            />
            <Route
              path="/cart"
              element={
                <div className="product-form">
                  <ProtectedRoute
                    element={Cart}
                    allowedRoles={["Administrator", "Visitor"]}
                  />
                </div>
              }
            />

            {/* 404 - No content found */}
            <Route path="/NoContentFound" element={<NoContentFound />} />
            <Route path="*" element={<NoContentFound />} />
          </Routes>

        <Footer />
      </div>
  );
};

export default App;
