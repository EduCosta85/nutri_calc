import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/Dashboard";
import { RawMaterialsPage } from "./pages/RawMaterials";
import { RawMaterialFormPage } from "./pages/RawMaterialForm";
import { RecipesPage } from "./pages/Recipes";
import { RecipeFormPage } from "./pages/RecipeForm";
import { RecipeDetailPage } from "./pages/RecipeDetail";
import { SettingsPage } from "./pages/Settings";
import { ComparePage } from "./pages/Compare";
import { LoginPage } from "./pages/LoginPage";
import { useAuth } from "./contexts/AuthContext";

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="/materias-primas" element={<RawMaterialsPage />} />
        <Route path="/materias-primas/novo" element={<RawMaterialFormPage />} />
        <Route path="/materias-primas/:id" element={<RawMaterialFormPage />} />
        <Route path="/receitas" element={<RecipesPage />} />
        <Route path="/receitas/nova" element={<RecipeFormPage />} />
        <Route path="/receitas/:id" element={<RecipeDetailPage />} />
        <Route path="/receitas/:id/editar" element={<RecipeFormPage />} />
        <Route path="/comparar" element={<ComparePage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}

export default App;
