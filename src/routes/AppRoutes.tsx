import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Login, NotFound, PublicSurvey, Register } from "../pages";

import Builder from "../pages/survey/Builder";

import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/dashboard/Dashboard";
import ResponseDetail from "@/pages/response/ResponseDetail";
import Responses from "@/pages/response/Responses";
import SurveyAnalytics from "@/pages/survey/Analytics";
import Surveys from "@/pages/survey/Surveys";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/survey/:slug" element={<PublicSurvey />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/surveys" element={<Surveys />} />
              <Route path="/responses" element={<Responses />} />
              <Route path="/responses/:id" element={<ResponseDetail />} />
              <Route
                path="/surveys/:id/analytics"
                element={<SurveyAnalytics />}
              />
              <Route path="/surveys/create" element={<Builder />} />

              <Route path="/surveys/:id/edit" element={<Builder />} />
            </Route>
          </Route>
        </Route>



        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
