import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import BillingTable from '../billing/BillingTable';
import Modal from '../core/Modal';
import BillingForm from '../billing/BillingForm';
import RequestChangeModal from '../billing/RequestChangeModal';
import { BillingRecord, Service, User } from '../../types';

const StaffDashboard: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not found");
  const { currentUser, billingRecords, addBillingRecord } = context;

  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isRequestChangeModalOpen, setIsRequestChangeModalOpen] = useState(false);
  const [selectedRecordForChange, setSelectedRecordForChange] = useState<BillingRecord | null>(null);
  
  if (!currentUser) return null;

  const staffBillingRecords = billingRecords.filter(br => br.staffId === currentUser.id)
    .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleOpenNewBilling = () => {
    setIsBillingModalOpen(true);
  };

  const handleCloseBillingModal = () => {
    setIsBillingModalOpen(false);
  };

  const handleSubmitNewBilling = (data: Omit<BillingRecord, 'id' | 'timestamp' | 'staffId' | 'totalAmount' | 'services'>, selectedServices: Service[]) => {
    addBillingRecord(data, selectedServices, currentUser as User);
    setIsBillingModalOpen(false);
  };

  const handleOpenRequestChange = (record: BillingRecord) => {
    setSelectedRecordForChange(record);
    setIsRequestChangeModalOpen(true);
  };

  const handleCloseRequestChangeModal = () => {
    setSelectedRecordForChange(null);
    setIsRequestChangeModalOpen(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-gray-300">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">Staff Dashboard</h2>
        <button
          onClick={handleOpenNewBilling}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>New Wash / Billing</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Your Recent Billing Records</h3>
        <BillingTable
          records={staffBillingRecords}
          currentUser={currentUser}
          onRequestChange={handleOpenRequestChange}
        />
      </div>

      {isBillingModalOpen && (
        <Modal isOpen={isBillingModalOpen} onClose={handleCloseBillingModal} title="Create New Billing Record" size="lg">
          <BillingForm
            onSubmitNew={handleSubmitNewBilling}
            onClose={handleCloseBillingModal}
            isOwnerView={false}
          />
        </Modal>
      )}

      {selectedRecordForChange && isRequestChangeModalOpen && (
        <RequestChangeModal
          isOpen={isRequestChangeModalOpen}
          onClose={handleCloseRequestChangeModal}
          billingRecord={selectedRecordForChange}
        />
      )}
       <div className="mt-8 p-6 bg-yellow-50 border border-yellow-300 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Simulated Car Owner Communication</h3>
        <p className="text-sm text-yellow-700 mb-3">
          Use the "Communication / Notes for Owner" field in the billing form to pass messages or observations to the owner regarding a specific service.
        </p>
        <textarea
          rows={3}
          className="w-full p-2 border border-yellow-400 rounded-md focus:ring-yellow-500 focus:border-yellow-500 bg-white"
          placeholder="For general notes, not tied to a specific billing. This is a placeholder and not saved."
        />
      </div>
    </div>
  );
};

export default StaffDashboard;