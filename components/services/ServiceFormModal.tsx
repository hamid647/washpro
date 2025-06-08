import React, { useState, useEffect } from 'react';
import Modal from '../core/Modal';
import { Service } from '../../types';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: Omit<Service, 'id'> | Service) => void;
  serviceToEdit?: Service | null;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ isOpen, onClose, onSave, serviceToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.name);
      setDescription(serviceToEdit.description);
      setPrice(serviceToEdit.price);
    } else {
      // Reset form for new service
      setName('');
      setDescription('');
      setPrice('');
    }
    setFormError(''); // Clear error on open or when serviceToEdit changes
  }, [serviceToEdit, isOpen]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPrice(value === '' ? '' : parseFloat(value));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !description.trim() || price === '' || price < 0) {
      setFormError('All fields are required and price must be a non-negative number.');
      return;
    }

    const serviceData = {
      name,
      description,
      price: Number(price), // Ensure price is a number
    };

    if (serviceToEdit) {
      onSave({ ...serviceToEdit, ...serviceData });
    } else {
      onSave(serviceData as Omit<Service, 'id'>);
    }
    onClose(); // Close modal after save
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={serviceToEdit ? 'Edit Service / Package' : 'Add New Service / Package'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="serviceName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            required
            aria-describedby={formError && name.trim() === '' ? "name-error" : undefined}
          />
           {formError && name.trim() === '' && <p id="name-error" className="text-xs text-red-500 mt-1">Name is required.</p>}
        </div>
        <div>
          <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="serviceDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            required
            aria-describedby={formError && description.trim() === '' ? "description-error" : undefined}
          />
          {formError && description.trim() === '' && <p id="description-error" className="text-xs text-red-500 mt-1">Description is required.</p>}
        </div>
        <div>
          <label htmlFor="servicePrice" className="block text-sm font-medium text-gray-700">Price ($)</label>
          <input
            type="number"
            id="servicePrice"
            value={price === '' ? '' : price.toString()} // Control input value for number
            onChange={handlePriceChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            required
            aria-describedby={formError && (price === '' || Number(price) < 0) ? "price-error" : undefined}
          />
           {formError && (price === '' || Number(price) < 0) && <p id="price-error" className="text-xs text-red-500 mt-1">Price must be a valid non-negative number.</p>}
        </div>

        {formError && !(name.trim() === '') && !(description.trim() === '') && !(price === '' || Number(price) < 0) && (
             <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{formError}</p>
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
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              {serviceToEdit ? 'Save Changes' : 'Add Service'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ServiceFormModal;