import React from 'react';
import { Service } from '../../types';

interface ServiceManagementTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
}

const ServiceManagementTable: React.FC<ServiceManagementTableProps> = ({ services, onEdit, onDelete }) => {
  if (services.length === 0) {
    return <p className="text-center text-gray-500 py-8">No services or packages defined yet. Click "Add New Service / Package" to get started.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {services.map((service) => (
            <tr key={service.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
              <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-md">{service.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">${service.price.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                <button 
                  onClick={() => onEdit(service)} 
                  className="text-sky-600 hover:text-sky-800 transition-colors"
                  aria-label={`Edit ${service.name}`}
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(service.id)} 
                  className="text-red-600 hover:text-red-800 transition-colors"
                  aria-label={`Delete ${service.name}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceManagementTable;