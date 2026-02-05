import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { GroupProvider } from './context/GroupContext';
import InvitePage from './pages/InvitePage';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <GroupProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<InvitePage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </HashRouter>
    </GroupProvider>
  );
}

export default App;