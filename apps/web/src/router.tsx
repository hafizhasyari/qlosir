import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { RequireAuthed, RequireUnlocked } from './components/guards';

import { LoginScreen } from './screens/auth/LoginScreen';
import { SignupScreen } from './screens/auth/SignupScreen';
import { ForgotPasswordScreen } from './screens/auth/ForgotPasswordScreen';
import { PinScreen } from './screens/auth/PinScreen';

import { CashierScreen } from './screens/pos/CashierScreen';
import { CartScreen } from './screens/pos/CartScreen';
import { CashScreen } from './screens/pos/CashScreen';
import { QrisScreen } from './screens/pos/QrisScreen';
import { ReceiptScreen } from './screens/pos/ReceiptScreen';
import { BuyerInvoiceScreen } from './screens/buyer/BuyerInvoiceScreen';

import { ProductListScreen } from './screens/products/ProductListScreen';
import { ProductFormScreen } from './screens/products/ProductFormScreen';
import { ProductDetailScreen } from './screens/products/ProductDetailScreen';

import { HistoryScreen } from './screens/reports/HistoryScreen';
import { SalesReportScreen } from './screens/reports/SalesReportScreen';

import { SettingsScreen } from './screens/settings/SettingsScreen';
import { ChangePinScreen } from './screens/settings/ChangePinScreen';

const unlocked = (el: React.ReactNode) => <RequireUnlocked>{el}</RequireUnlocked>;

export const router = createBrowserRouter([
  // Public buyer invoice — standalone deep-link, no app chrome.
  { path: '/i/:id', element: <BuyerInvoiceScreen /> },

  {
    element: <AppLayout />,
    children: [
      { path: '/login', element: <LoginScreen /> },
      { path: '/signup', element: <SignupScreen /> },
      { path: '/forgot-password', element: <ForgotPasswordScreen /> },
      {
        path: '/pin',
        element: (
          <RequireAuthed>
            <PinScreen />
          </RequireAuthed>
        ),
      },

      { path: '/cashier', element: unlocked(<CashierScreen />) },
      { path: '/cart', element: unlocked(<CartScreen />) },
      { path: '/cash', element: unlocked(<CashScreen />) },
      { path: '/qris', element: unlocked(<QrisScreen />) },
      { path: '/receipt', element: unlocked(<ReceiptScreen />) },

      { path: '/products', element: unlocked(<ProductListScreen />) },
      { path: '/products/new', element: unlocked(<ProductFormScreen />) },
      { path: '/products/:id', element: unlocked(<ProductDetailScreen />) },
      { path: '/products/:id/edit', element: unlocked(<ProductFormScreen />) },

      { path: '/history', element: unlocked(<HistoryScreen />) },
      { path: '/reports', element: unlocked(<SalesReportScreen />) },

      { path: '/settings', element: unlocked(<SettingsScreen />) },
      { path: '/settings/pin', element: unlocked(<ChangePinScreen />) },

      { index: true, element: <Navigate to="/login" replace /> },
      { path: '*', element: <Navigate to="/login" replace /> },
    ],
  },
]);
