import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/Dashboard";
import { RawMaterialsPage } from "./pages/RawMaterials";
import { RawMaterialFormPage } from "./pages/RawMaterialForm";
import { RecipesPage } from "./pages/Recipes";
import { RecipeFormPage } from "./pages/RecipeForm";
import { RecipeDetailPage } from "./pages/RecipeDetail";
import { SettingsPage } from "./pages/Settings";
import { ComparePage } from "./pages/Compare";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
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
    </HashRouter>
  );
}

export default App;
