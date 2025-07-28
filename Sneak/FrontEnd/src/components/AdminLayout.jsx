import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen h-screen bg-sneakhead-black text-white flex overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Page Content */}
        <main className="p-4 lg:p-6 h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
