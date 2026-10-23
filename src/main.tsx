import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import store from "./Store/ConfigureStore";
import { AuthProvider } from "./Pages/Login/AuthContext";
import { TenantProvider } from "./Context/TenantContext";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <BrowserRouter>
      <TenantProvider>
        <AuthProvider>
          <App />
          <ToastContainer position="bottom-center" />
        </AuthProvider>
      </TenantProvider>
    </BrowserRouter>
  </Provider>
);
