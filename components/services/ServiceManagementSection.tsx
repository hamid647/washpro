import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { Service } from '../../types';
import ServiceManagementTable from './ServiceManagementTable';
import ServiceFormModal from './ServiceFormModal';
import Modal from '../core/Modal'; // For delete confirmation

const ServiceManagementSection: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext not found for ServiceManagementSection");

  const { services, addService, updateService, deleteService } = context;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [serviceToDeleteId, setServiceToDeleteId] = useState<string | null>(null);

  const handleOpenAddModal = () => {
    setServiceToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setServiceToEdit(service);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setServiceToEdit(null);
  };

  const handleSaveService = (serviceData: Omit<Service, 'id'> | Service) => {
    if ('id' in serviceData) { // Editing existing service
      updateService(serviceData.id, serviceData);
    } else { // Adding new service
      addService(serviceData);
    }
    handleCloseFormModal();
  };

  const openDeleteConfirmModal = (serviceId: string) => {
    setServiceToDeleteId(serviceId);
  };

  const closeDeleteConfirmModal = () => {
    setServiceToDeleteId(null);
  };

  const confirmDeleteService = () => {
    if (serviceToDeleteId) {
      deleteService(serviceToDeleteId);
    }
    closeDeleteConfirmModal();
  };
  
  // Sort services alphabetically by name for consistent display
  const sortedServices = [...services].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center pb-3 border-b">
        <h3 className="text-xl font-semibold text-gray-800 mb-3 sm:mb-0">Manage Services & Packages</h3>
        <button
          onClick={handleOpenAddModal}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Add New Service / Package</span>
        </button>
      </div>

      <ServiceManagementTable
        services={sortedServices}
        onEdit={handleOpenEditModal}
        onDelete={openDeleteConfirmModal}
      />

      {isFormModalOpen && (
        <ServiceFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModal}
          onSave={handleSaveService}
          serviceToEdit={serviceToEdit}
        />
      )}

      {serviceToDeleteId && (
        <Modal isOpen={!!serviceToDeleteId} onClose={closeDeleteConfirmModal} title="Confirm Deletion" size="sm">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this service/package? This action cannot be undone. 
            Existing billing records will retain historical data but this service will no longer be available for new entries.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeDeleteConfirmModal}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteService}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
            >
              Confirm Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ServiceManagementSection;