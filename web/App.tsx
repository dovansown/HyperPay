/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from '@/components/ScrollToTop';
import { RequireAuth } from '@/components/RequireAuth';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { Dashboard } from '@/pages/Dashboard';
import { Bank } from '@/pages/Bank';
import { Webhook } from '@/pages/Webhook';
import { WebhookForm } from '@/pages/WebhookForm';
import { Billing } from '@/pages/Billing';
import { Profile } from '@/pages/Profile';
import { Features } from '@/pages/Features';
import { Pricing } from '@/pages/Pricing';
import { Blog } from '@/pages/Blog';
import { BlogPost } from '@/pages/BlogPost';
import { Docs } from '@/pages/Docs';
import { Support } from '@/pages/Support';
import { VerifyOTP } from '@/pages/VerifyOTP';

import { LanguageProvider } from '@/context/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/docs/:slug" element={<Docs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/bank"
            element={
              <RequireAuth>
                <Bank />
              </RequireAuth>
            }
          />
          <Route
            path="/webhook"
            element={
              <RequireAuth>
                <Webhook />
              </RequireAuth>
            }
          />
          <Route
            path="/webhook/create"
            element={
              <RequireAuth>
                <WebhookForm />
              </RequireAuth>
            }
          />
          <Route
            path="/webhook/:id"
            element={
              <RequireAuth>
                <WebhookForm />
              </RequireAuth>
            }
          />
          <Route
            path="/billing"
            element={
              <RequireAuth>
                <Billing />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/support"
            element={
              <RequireAuth>
                <Support />
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}
