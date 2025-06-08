
import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { Role } from '../../types';
import NotificationBell from '../notifications/NotificationBell';
import NotificationListModal from '../notifications/NotificationListModal';
import { APP_NAME } from '../../constants';

const Navbar: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null; // Or handle error appropriately

  const { currentUser, logout } = context;
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <>
      <nav className="bg-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-sky-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                 </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-white">{APP_NAME}</span>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser.role === Role.OWNER && (
                <NotificationBell onOpenNotifications={() => setIsNotificationsModalOpen(true)} />
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-white">{currentUser.name}</p>
                <p className="text-xs text-sky-300">{currentUser.role}</p>
              </div>
              <button
                onClick={logout}
                className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      {currentUser.role === Role.OWNER && (
        <NotificationListModal
          isOpen={isNotificationsModalOpen}
          onClose={() => setIsNotificationsModalOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
