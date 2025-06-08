
import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { Role } from '../../types';

interface NotificationBellProps {
  onOpenNotifications: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onOpenNotifications }) => {
  const context = useContext(AppContext);
  if (!context) return null; // Or handle error appropriately

  const { currentUser, notifications } = context;

  if (!currentUser || currentUser.role !== Role.OWNER) {
    return null; // Only show for owner
  }

  const unreadCount = notifications.filter(n => !n.isRead && n.type === 'BILLING_CHANGE_REQUEST').length;

  return (
    <button
      onClick={onOpenNotifications}
      className="relative p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-800 focus:ring-white rounded-full"
      aria-label="View notifications"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 block h-5 w-5 transform -translate-y-1/2 translate-x-1/2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 text-white text-xs font-bold items-center justify-center">
            {unreadCount}
          </span>
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
