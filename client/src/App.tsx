import { Navigate, Route, Routes, useNavigate } from "react-router";
import { BrowserRouter } from "react-router";
import "./App.css";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import HomeAfterLogin from "./pages/HomeAfterLogin";
import { addUserToDatabase } from "./apiClient";
import { useEffect } from "react";
import WalletTracker from "./pages/WalletTracker";
import Profile from "./pages/Profile";
import SavedWalletsPage from "./pages/SavedWalletsPage";
import TransactionPage from "./pages/Transactions";
import AgentDetails from "./pages/AgentDetails";
import Home from "./pages/Home";
import { LoginCallBack } from "@opencampus/ocid-connect-js";
import { toast } from "sonner";

function App() {
  const navigate = useNavigate();
  const { authenticated, user } = usePrivy();
  
  useEffect(() => {
    if (authenticated) {
      addUserToDatabase(user);
    }
  }, [user]);

  const loginSuccess = () => {
    toast.success("Open Campus Connect Successful");
    navigate("/profile");
  };

  const loginError = () => {
    toast.error("Open Campus Connect Failed");
    navigate("/profile");
  };

  return (
    <>
      {authenticated ? (
        <HomeAfterLogin />
      ) : (
        <>
          <Home />
          <Routes>
            <Route
              path="/redirect"
              element={
                <LoginCallBack
                  errorCallback={loginError}
                  successCallback={loginSuccess}
                  customErrorComponent={undefined}
                  customLoadingComponent={undefined}
                />
              }
            />
          </Routes>
        </>
      )}
    </>
  );
}

export default App;
