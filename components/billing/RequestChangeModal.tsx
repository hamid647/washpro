import React, { useState, useContext } from 'react';
import Modal from '../core/Modal';
import { AppContext } from '../../App'; 
import { BillingRecord, User } from '../../types';

interface RequestChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  billingRecord: BillingRecord;
}

const RequestChangeModal: React.FC<RequestChangeModalProps> = ({ isOpen, onClose, billingRecord }) => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not found");
  const { requestBillingChange, currentUser } = context;

  const [reason, setReason] = useState('');
  // For simplicity, we'll use a text area for requested changes.
  // A more complex UI could allow structured changes.
  const [requestedChangesDescription, setRequestedChangesDescription] = useState('');

  const handleSubmit = () => {
    if (!currentUser) return;
    // This is a simplified representation of changes.
    // In a real app, you'd have a more structured way to define what's changing.
    const changes: Partial<BillingRecord> = { notes: `Change Request: ${requestedChangesDescription}` };
    
    requestBillingChange(billingRecord.id, changes, reason, currentUser as User);
    onClose();
    setReason('');
    setRequestedChangesDescription('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Request Change for Record ID: ${billingRecord.id.substring(0,8)}`}>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Customer: {billingRecord.customerName}</p>
          <p className="text-sm text-gray-600">Car: {billingRecord.carDetails}</p>
          <p className="text-sm text-gray-600">Total: ${billingRecord.totalAmount.toFixed(2)}</p>
        </div>
        <div>
          <label htmlFor="requestedChanges" className="block text-sm font-medium text-gray-700">
            Describe Requested Changes
          </label>
          <textarea
            id="requestedChanges"
            value={requestedChangesDescription}
            onChange={(e) => setRequestedChangesDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            placeholder="e.g., Add Tire Shine service, correct customer name to..."
            required
          />
        </div>
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
            Reason for Change
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            placeholder="e.g., Customer requested an additional service, typo in original entry."
            required
          />
        </div>
        <div className="flex justify-end space-x-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || !requestedChangesDescription.trim()}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors disabled:opacity-50"
          >
            Submit Request
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RequestChangeModal;