import React, { useState, useEffect, useContext } from 'react';
import { BillingRecord, Service, PaymentStatus, Role } from '../../types';
import { AppContext } from '../../App';
import ServiceSelectionModal from './ServiceSelectionModal';
import { PAYMENT_STATUS_OPTIONS } from '../../constants';

interface BillingFormProps {
  recordToEdit?: BillingRecord | null;
  onSave?: (record: BillingRecord) => void; // For owner edit
  onSubmitNew?: (data: Omit<BillingRecord, 'id' | 'timestamp' | 'staffId' | 'totalAmount' | 'services'>, selectedServices: Service[]) => void; // For staff create
  onClose: () => void;
  isOwnerView: boolean;
}

const BillingForm: React.FC<BillingFormProps> = ({ recordToEdit, onSave, onSubmitNew, onClose, isOwnerView }) => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not found");
  const { currentUser } = context;

  const [customerName, setCustomerName] = useState('');
  const [carDetails, setCarDetails] = useState('');
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDING);
  const [notes, setNotes] = useState('');

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  useEffect(() => {
    if (recordToEdit) {
      setCustomerName(recordToEdit.customerName);
      setCarDetails(recordToEdit.carDetails);
      setSelectedServices(recordToEdit.services);
      setTotalAmount(recordToEdit.totalAmount);
      setPaymentStatus(recordToEdit.paymentStatus);
      setNotes(recordToEdit.notes || '');
    } else {
      // Reset for new form
      setCustomerName('');
      setCarDetails('');
      setSelectedServices([]);
      setTotalAmount(0);
      setPaymentStatus(PaymentStatus.PENDING);
      setNotes('');
    }
  }, [recordToEdit]);

  const handleServicesSelected = (services: Service[], total: number) => {
    setSelectedServices(services);
    setTotalAmount(total);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (isOwnerView && recordToEdit && onSave) {
      const updatedRecord: BillingRecord = {
        ...recordToEdit,
        customerName,
        carDetails,
        services: selectedServices,
        totalAmount,
        paymentStatus,
        notes,
      };
      onSave(updatedRecord);
    } else if (!isOwnerView && onSubmitNew) {
      const newRecordData: Omit<BillingRecord, 'id' | 'timestamp' | 'staffId' | 'totalAmount' | 'services'> = {
        customerName,
        carDetails,
        paymentStatus,
        notes,
      };
      onSubmitNew(newRecordData, selectedServices);
    }
    onClose();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 p-1">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
          <input
            type="text"
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="carDetails" className="block text-sm font-medium text-gray-700">Car Details (e.g., Make, Model, Color)</label>
          <input
            type="text"
            id="carDetails"
            value={carDetails}
            onChange={(e) => setCarDetails(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Services</label>
          <button
            type="button"
            onClick={() => setIsServiceModalOpen(true)}
            className="mt-1 w-full text-left bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm text-gray-700"
          >
            {selectedServices.length > 0 ? `${selectedServices.length} service(s) selected` : 'Select Services...'}
          </button>
          {selectedServices.length > 0 && (
            <div className="mt-2 space-y-1 text-xs text-gray-600">
              {selectedServices.map(s => <p key={s.id}>- {s.name} (${s.price.toFixed(2)})</p>)}
            </div>
          )}
        </div>
        
        <div className="text-xl font-semibold">Total: ${totalAmount.toFixed(2)}</div>

        <div>
          <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">Payment Status</label>
          <select
            id="paymentStatus"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
            required
            disabled={!isOwnerView && !!recordToEdit} // Staff cannot change status on existing records via this form directly
          >
            {PAYMENT_STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {!isOwnerView && (
             <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Communication / Notes for Owner</label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="Any specific instructions or observations..."
                />
            </div>
        )}

        {isOwnerView && recordToEdit && (
            <div>
                <label htmlFor="ownerNotes" className="block text-sm font-medium text-gray-700">Owner Notes</label>
                 <textarea
                    id="ownerNotes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                />
            </div>
        )}


        <div className="pt-5">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedServices.length === 0 && !recordToEdit} // Must select services for new record
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
            >
              {isOwnerView && recordToEdit ? 'Save Changes' : 'Submit Billing'}
            </button>
          </div>
        </div>
      </form>
      <ServiceSelectionModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onServicesSelected={handleServicesSelected}
        initialSelectedServices={selectedServices}
      />
    </>
  );
};

export default BillingForm;