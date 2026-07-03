import { MotionConfig } from 'framer-motion';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ConferencePage from './pages/ConferencePage';
import AccountLink from './pages/AccountLink';
import AdminLayout from './components/admin/AdminLayout';
import MentorChat from './components/mentor/MentorChat';
import { AuthProvider } from './lib/auth-context';

export default function App() {
  return (
    // reducedMotion="user" — every Framer animation respects prefers-reduced-motion.
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/conferences/:slug" element={<ConferencePage />} />
          <Route path="/link" element={<AccountLink />} />
          <Route path="/admin" element={<AdminLayout />} />
          <Route path="/mentor" element={<MentorChat />} />
        </Routes>
      </AuthProvider>
    </MotionConfig>
  );
}
