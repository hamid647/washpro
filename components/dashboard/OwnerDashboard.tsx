import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../App';
import BillingTable from '../billing/BillingTable';
import Modal from '../core/Modal';
import BillingForm from '../billing/BillingForm';
import { BillingRecord, User, AppNotification, NotificationType, Role } from '../../types';
import { INITIAL_USERS } from '../../constants';
import ReportingSection from '../reporting/ReportingSection'; 
import ServiceManagementSection from '../services/ServiceManagementSection'; // Import ServiceManagementSection

const OwnerDashboard: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not found");

  const { currentUser, billingRecords, updateBillingRecord, deleteBillingRecord, notifications, approveBillingChange, rejectBillingChange, markNotificationAsRead } = context;

  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<BillingRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filteredTableRecords, setFilteredTableRecords] = useState<BillingRecord[]>([]);

  useEffect(() => {
    let records = [...billingRecords].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (filterCustomer) {
      records = records.filter(r => r.customerName.toLowerCase().includes(filterCustomer.toLowerCase()));
    }
    setFilteredTableRecords(records);
  }, [billingRecords, filterCustomer]);

  if (!currentUser) return null;

  const handleOpenEditModal = (record: BillingRecord) => {
    setRecordToEdit(record);
    setIsBillingModalOpen(true);
  };

  const handleCloseBillingModal = () => {
    setRecordToEdit(null);
    setIsBillingModalOpen(false);
  };

  const handleSaveBillingRecord = (updatedRecord: BillingRecord) => {
    updateBillingRecord(updatedRecord.id, updatedRecord);
    handleCloseBillingModal();
  };

  const handleDeleteRecord = (id: string) => {
    deleteBillingRecord(id);
    setRecordToDelete(null); // Close confirmation modal
  };

  const openDeleteConfirmModal = (id: string) => {
    setRecordToDelete(id);
  };

  const pendingChangeRequests = notifications.filter(
    n => n.type === NotificationType.BILLING_CHANGE_REQUEST && n.isRead === false // Show only unread pending
  ).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="pb-4 border-b border-gray-300">
        <h2 className="text-2xl font-semibold text-gray-800">Owner Dashboard</h2>
      </div>

      {/* Service Management Section */}
      <ServiceManagementSection />

      {/* Reporting Section */}
      <ReportingSection />

      {pendingChangeRequests.length > 0 && (
        <div className="bg-sky-50 p-6 rounded-lg shadow-lg border border-sky-200">
          <h3 className="text-xl font-semibold text-sky-800 mb-4">Pending Billing Change Requests</h3>
          <ul className="space-y-4 max-h-72 overflow-y-auto">
            {pendingChangeRequests.map(notification => {
              const relatedRecord = billingRecords.find(br => br.id === notification.billingRecordId);
              if (!relatedRecord || !relatedRecord.changeRequest) return null;
              
              const staffUser = INITIAL_USERS.find(u => u.id === relatedRecord.changeRequest?.requestedBy);


              return (
                <li key={notification.id} className="p-4 bg-white rounded-md shadow border border-gray-200">
                  <p className="font-medium text-gray-700">{notification.message}</p>
                  <p className="text-sm text-gray-600">
                    Record ID: <button onClick={() => relatedRecord && handleOpenEditModal(relatedRecord)} className="text-sky-600 hover:underline">{relatedRecord.id.substring(0,8)}</button> - Customer: {relatedRecord.customerName}
                  </p>
                  <p className="text-sm text-gray-500">Requested by: {staffUser?.name || 'Unknown Staff'}</p>
                  <p className="text-sm text-gray-500">Reason: {relatedRecord.changeRequest.reason}</p>
                   <p className="text-sm text-gray-500">Details: {relatedRecord.changeRequest.requestedChanges.notes || 'No specific details provided for notes field.'}</p>
                  <div className="mt-3 flex space-x-3">
                    <button 
                      onClick={() => { approveBillingChange(notification.id); markNotificationAsRead(notification.id); }}
                      className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => { rejectBillingChange(notification.id); markNotificationAsRead(notification.id); }}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                     <button 
                      onClick={() => markNotificationAsRead(notification.id)}
                      className="px-3 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                    >
                      Mark as Read
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700 mb-2 sm:mb-0">All Billing Records</h3>
            <input 
                type="text"
                placeholder="Filter by customer name..."
                value={filterCustomer}
                onChange={(e) => setFilterCustomer(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm w-full sm:w-auto"
            />
        </div>
        <BillingTable
          records={filteredTableRecords}
          currentUser={currentUser}
          onEdit={handleOpenEditModal}
          onDelete={openDeleteConfirmModal}
        />
      </div>

      {isBillingModalOpen && (
        <Modal isOpen={isBillingModalOpen} onClose={handleCloseBillingModal} title={recordToEdit ? "Edit Billing Record" : "New Record (Owner)"} size="lg">
          <BillingForm
            recordToEdit={recordToEdit}
            onSave={handleSaveBillingRecord}
            // onSubmitNew is not used by Owner for editing, so no need to pass it
            onClose={handleCloseBillingModal}
            isOwnerView={true}
          />
        </Modal>
      )}

      {recordToDelete && (
        <Modal isOpen={!!recordToDelete} onClose={() => setRecordToDelete(null)} title="Confirm Deletion" size="sm">
          <p className="text-gray-700 mb-4">Are you sure you want to delete this billing record? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setRecordToDelete(null)}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteRecord(recordToDelete)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OwnerDashboard;
