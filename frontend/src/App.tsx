import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/Dashboard";
import { RawMaterialsPage } from "./pages/RawMaterials";
import { RawMaterialFormPage } from "./pages/RawMaterialForm";
import { RecipesPage } from "./pages/Recipes";
import { RecipeFormPage } from "./pages/RecipeForm";
import { RecipeDetailPage } from "./pages/RecipeDetail";
import { RecipeComparePage } from "./pages/RecipeCompare";
import { SettingsPage } from "./pages/Settings";
import { ComparePage } from "./pages/Compare";
import { LoginPage } from "./pages/LoginPage";
import { useAuth } from "./contexts/AuthContext";

// Inventory
import { InventoryListPage } from "./pages/inventory/InventoryList";
import { InventoryItemFormPage } from "./pages/inventory/InventoryItemForm";
import { StockLotManagementPage } from "./pages/inventory/StockLotManagement";

// Production
import { ProductionOrderListPage } from "./pages/production/ProductionOrderList";
import { ProductionOrderFormPage } from "./pages/production/ProductionOrderForm";
import { ProductionOrderDetailsPage } from "./pages/production/ProductionOrderDetails";
import { ProductionOrderSeparationPage } from "./pages/production/ProductionOrderSeparation";
import { ProductionOrderFinishingPage } from "./pages/production/ProductionOrderFinishing";

// Sales
import { SalesSkuListPage } from "./pages/sales/SalesSkuList";
import { SalesSkuFormPage } from "./pages/sales/SalesSkuForm";
import { QuickSaleListPage } from "./pages/sales/QuickSaleList";
import { SaleFormPage } from "./pages/sales/SaleForm";

// Customers
import { CustomerListPage } from "./pages/customers/CustomerList";
import { CustomerFormPage } from "./pages/customers/CustomerForm";
import { PickupPointListPage } from "./pages/customers/PickupPointList";

// Orders
import { SalesIntentionListPage } from "./pages/orders/SalesIntentionList";

// Reports
import { ReportsHubPage } from "./pages/reports/ReportsHub";
import { FinancialReportPage } from "./pages/reports/FinancialReport";
import { SalesByPeriodReportPage } from "./pages/reports/SalesByPeriodReport";
import { TopProductsReportPage } from "./pages/reports/TopProductsReport";
import { InactiveCustomersReportPage } from "./pages/reports/InactiveCustomersReport";
import { PurchaseBalanceReportPage } from "./pages/reports/PurchaseBalanceReport";

// Settings
import { AppearanceSettingsPage } from "./pages/settings/AppearanceSettings";
import { PaymentSettingsPage } from "./pages/settings/PaymentSettings";

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
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />

        {/* Raw Materials (legacy) */}
        <Route path="/materias-primas" element={<RawMaterialsPage />} />
        <Route path="/materias-primas/novo" element={<RawMaterialFormPage />} />
        <Route path="/materias-primas/:id" element={<RawMaterialFormPage />} />

        {/* Recipes (legacy) */}
        <Route path="/receitas" element={<RecipesPage />} />
        <Route path="/receitas/nova" element={<RecipeFormPage />} />
        <Route path="/receitas/comparar/:id1/:id2" element={<RecipeComparePage />} />
        <Route path="/receitas/:id" element={<RecipeDetailPage />} />
        <Route path="/receitas/:id/editar" element={<RecipeFormPage />} />
        <Route path="/comparar" element={<ComparePage />} />

        {/* Inventory */}
        <Route path="/estoque" element={<InventoryListPage />} />
        <Route path="/estoque/novo" element={<InventoryItemFormPage />} />
        <Route path="/estoque/:id" element={<StockLotManagementPage />} />
        <Route path="/estoque/:id/editar" element={<InventoryItemFormPage />} />

        {/* Production */}
        <Route path="/producao" element={<ProductionOrderListPage />} />
        <Route path="/producao/nova" element={<ProductionOrderFormPage />} />
        <Route path="/producao/:id" element={<ProductionOrderDetailsPage />} />
        <Route path="/producao/:id/separacao" element={<ProductionOrderSeparationPage />} />
        <Route path="/producao/:id/finalizacao" element={<ProductionOrderFinishingPage />} />

        {/* Sales */}
        <Route path="/vendas" element={<SalesSkuListPage />} />
        <Route path="/vendas/sku/novo" element={<SalesSkuFormPage />} />
        <Route path="/vendas/sku/:id" element={<SalesSkuFormPage />} />
        <Route path="/vendas/rapida" element={<QuickSaleListPage />} />
        <Route path="/vendas/rapida/nova" element={<SaleFormPage />} />
        <Route path="/vendas/intencoes" element={<SalesIntentionListPage />} />

        {/* Customers */}
        <Route path="/clientes" element={<CustomerListPage />} />
        <Route path="/clientes/novo" element={<CustomerFormPage />} />
        <Route path="/clientes/:id" element={<CustomerFormPage />} />
        <Route path="/clientes/pontos-retirada" element={<PickupPointListPage />} />

        {/* Reports */}
        <Route path="/relatorios" element={<ReportsHubPage />} />
        <Route path="/relatorios/financeiro" element={<FinancialReportPage />} />
        <Route path="/relatorios/vendas-periodo" element={<SalesByPeriodReportPage />} />
        <Route path="/relatorios/top-produtos" element={<TopProductsReportPage />} />
        <Route path="/relatorios/clientes-inativos" element={<InactiveCustomersReportPage />} />
        <Route path="/relatorios/balanco-compras" element={<PurchaseBalanceReportPage />} />

        {/* Settings */}
        <Route path="/configuracoes" element={<SettingsPage />} />
        <Route path="/configuracoes/aparencia" element={<AppearanceSettingsPage />} />
        <Route path="/configuracoes/pagamentos" element={<PaymentSettingsPage />} />
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
