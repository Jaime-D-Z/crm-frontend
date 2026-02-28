import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import AppRoutes from "./pages/AppRoutes";
import PageTransition from "./components/ui/PageTransition";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <PageTransition>
            <AppRoutes />
          </PageTransition>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
