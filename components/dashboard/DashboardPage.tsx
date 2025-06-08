
import React, { useContext } from 'react';
import { AppContext } from '../../App';
import OwnerDashboard from './OwnerDashboard';
import StaffDashboard from './StaffDashboard';
import { Role } from '../../types';
import Navbar from '../core/Navbar';

const DashboardPage: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return <div className="p-8 text-center text-red-500">Error: Application context not available.</div>;
  
  const { currentUser } = context;

  if (!currentUser) {
    // This should ideally be handled by App.tsx routing to LoginScreen
    return <div className="p-8 text-center">Not authenticated.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {currentUser.role === Role.OWNER ? <OwnerDashboard /> : <StaffDashboard />}
      </main>
      <footer className="bg-slate-800 text-center py-4 mt-auto">
        <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} WashPro Management. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default DashboardPage;
