import "./App.css";
import { Toaster } from "./components/ui/sonner";
import AppRoutes from "./routes/AppRoutes";
function App() {
  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
}

export default App;
