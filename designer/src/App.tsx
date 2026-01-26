import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Designer from './pages/Designer';
import MainLayout from './layouts/MainLayout';
import SchemaManagement from './pages/SchemaManagement';
import MockDataManagement from './pages/MockDataManagement';
import TemplateManagement from './pages/TemplateManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 设计器全屏模式 */}
        <Route path="/designer" element={<Designer />} />

        {/* 管理页面布局 */}
        <Route element={<MainLayout />}>
          <Route path="/templates" element={<TemplateManagement />} />
          <Route path="/schemas" element={<SchemaManagement />} />
          <Route path="/mock-data" element={<MockDataManagement />} />
        </Route>

        {/* 默认跳转到模板管理 */}
        <Route path="/" element={<Navigate to="/templates" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
