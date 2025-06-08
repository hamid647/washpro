import React, { useState, useEffect, useContext } from 'react';
import Modal from '../core/Modal';
// import { SERVICE_OPTIONS } from '../../constants'; // No longer needed
import { AppContext } from '../../App'; // Import AppContext
import { Service } from '../../types';

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServicesSelected: (selectedServices: Service[], total: number) => void;
  initialSelectedServices?: Service[];
}

const ServiceSelectionModal: React.FC<ServiceSelectionModalProps> = ({
  isOpen,
  onClose,
  onServicesSelected,
  initialSelectedServices = [],
}) => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not found for ServiceSelectionModal");
  const { services: availableServices } = context; // Get services from context

  const [selectedServices, setSelectedServices] = useState<Service[]>(initialSelectedServices);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    setSelectedServices(initialSelectedServices);
  }, [initialSelectedServices, isOpen]); // Reset when modal opens or initial services change

  useEffect(() => {
    const total = selectedServices.reduce((sum, service) => sum + service.price, 0);
    setTotalPrice(total);
  }, [selectedServices]);

  const toggleService = (service: Service) => {
    setSelectedServices((prev) =>
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const handleConfirm = () => {
    onServicesSelected(selectedServices, totalPrice);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Services">
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {availableServices.length === 0 && <p className="text-gray-500 text-center py-4">No services available. Please contact an administrator.</p>}
        {availableServices.map((service) => (
          <div
            key={service.id}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
              selectedServices.find(s => s.id === service.id)
                ? 'bg-sky-100 border-sky-500 ring-2 ring-sky-500'
                : 'bg-white hover:bg-gray-50 border-gray-200'
            }`}
            onClick={() => toggleService(service)}
          >
            <div>
              <h4 className="font-semibold text-gray-800">{service.name}</h4>
              <p className="text-sm text-gray-600">{service.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-lg font-semibold text-sky-600">${service.price.toFixed(2)}</span>
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-sky-600 rounded border-gray-300 focus:ring-sky-500 cursor-pointer"
                checked={!!selectedServices.find(s => s.id === service.id)}
                readOnly // Click handled by div
                aria-labelledby={`service-name-${service.id}`}
              />
            </div>
             <span id={`service-name-${service.id}`} className="sr-only">{service.name}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-gray-700">Total:</span>
          <span className="text-2xl font-bold text-sky-600">${totalPrice.toFixed(2)}</span>
        </div>
        <button
          onClick={handleConfirm}
          disabled={selectedServices.length === 0}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Services
        </button>
      </div>
    </Modal>
  );
};

export default ServiceSelectionModal;