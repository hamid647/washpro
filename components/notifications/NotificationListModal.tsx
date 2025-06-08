import React, { useContext } from 'react';
import { AppContext } from '../../App';
import Modal from '../core/Modal';
import { AppNotification, NotificationType, BillingRecord } from '../../types';
import { INITIAL_USERS } from '../../constants';

interface NotificationListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewBillingRecord?: (recordId: string) => void;
}

const NotificationListModal: React.FC<NotificationListModalProps> = ({ isOpen, onClose, onViewBillingRecord }) => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { notifications, markNotificationAsRead, approveBillingChange, rejectBillingChange, billingRecords } = context;

  const ownerNotifications = notifications
    .filter(n => n.type === NotificationType.BILLING_CHANGE_REQUEST)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }
    if (notification.billingRecordId && onViewBillingRecord) {
      onViewBillingRecord(notification.billingRecordId);
    }
    // Potentially close modal or keep open
  };
  
  const getBillingRecordDetails = (recordId?: string): BillingRecord | undefined => {
    if (!recordId) return undefined;
    return billingRecords.find(br => br.id === recordId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notifications" size="lg">
      {ownerNotifications.length === 0 ? (
        <p className="text-gray-600">No new notifications.</p>
      ) : (
        <ul className="space-y-3 max-h-96 overflow-y-auto">
          {ownerNotifications.map((notification) => {
            const relatedBillingRecord = getBillingRecordDetails(notification.billingRecordId);
            const changeRequest = relatedBillingRecord?.changeRequest;
            const requestingStaff = INITIAL_USERS.find(u => u.id === changeRequest?.requestedBy);

            return (
            <li
              key={notification.id}
              className={`p-4 rounded-lg shadow ${notification.isRead ? 'bg-gray-100' : 'bg-sky-50 hover:bg-sky-100'} cursor-pointer transition-colors`}
            >
              <div onClick={() => handleNotificationClick(notification)}>
                <p className={`font-semibold ${notification.isRead ? 'text-gray-700' : 'text-sky-700'}`}>
                  {notification.message}
                </p>
                {relatedBillingRecord && (
                    <p className="text-xs text-gray-500 mt-1">
                        Customer: {relatedBillingRecord.customerName}, Car: {relatedBillingRecord.carDetails}
                    </p>
                )}
                {changeRequest && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <p><strong>Requested By:</strong> {requestingStaff?.name || 'Unknown Staff'}</p>
                        <p><strong>Reason:</strong> {changeRequest.reason}</p>
                        <p><strong>Status:</strong> <span className={`font-semibold ${
                            changeRequest.status === 'PENDING' ? 'text-yellow-600' : 
                            changeRequest.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'
                        }`}>{changeRequest.status}</span></p>
                    </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleString()}
                </p>
              </div>
              {changeRequest?.status === 'PENDING' && notification.billingRecordId && (
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => { approveBillingChange(notification.id); onClose(); }}
                    className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => { rejectBillingChange(notification.id); onClose(); }}
                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          )})}
        </ul>
      )}
    </Modal>
  );
};

export default NotificationListModal;