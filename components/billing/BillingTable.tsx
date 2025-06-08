
import React from 'react';
import { BillingRecord, Role, User, PaymentStatus } from '../../types';
import { INITIAL_USERS } from '../../constants';

interface BillingTableProps {
  records: BillingRecord[];
  currentUser: User;
  onEdit?: (record: BillingRecord) => void;
  onDelete?: (recordId: string) => void;
  onRequestChange?: (record: BillingRecord) => void;
}

const BillingTable: React.FC<BillingTableProps> = ({ records, currentUser, onEdit, onDelete, onRequestChange }) => {
  
  const getStaffName = (staffId: string) => {
    const staff = INITIAL_USERS.find(u => u.id === staffId);
    return staff ? staff.name : 'Unknown';
  };

  const getPaymentStatusClass = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return 'bg-green-100 text-green-800';
      case PaymentStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case PaymentStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getChangeRequestStatusClass = (status?: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    if (!status) return '';
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800'; // Using blue for approved to distinguish from paid
      case 'REJECTED': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (records.length === 0) {
    return <p className="text-center text-gray-500 py-8">No billing records found.</p>;
  }
  
  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car Details</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change Request</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.customerName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.carDetails}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record.services.map(s => s.name).join(', ') || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">${record.totalAmount.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusClass(record.paymentStatus)}`}>
                  {record.paymentStatus}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getStaffName(record.staffId)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(record.timestamp).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record.changeRequest ? (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getChangeRequestStatusClass(record.changeRequest.status)}`}>
                    {record.changeRequest.status}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">None</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                {currentUser.role === Role.OWNER && onEdit && (
                  <button onClick={() => onEdit(record)} className="text-sky-600 hover:text-sky-800 transition-colors">Edit</button>
                )}
                {currentUser.role === Role.OWNER && onDelete && (
                  <button onClick={() => onDelete(record.id)} className="text-red-600 hover:text-red-800 transition-colors">Delete</button>
                )}
                {currentUser.role === Role.STAFF && onRequestChange && !record.changeRequest && ( // Staff can request change if no pending one
                  <button onClick={() => onRequestChange(record)} className="text-yellow-600 hover:text-yellow-800 transition-colors">Request Change</button>
                )}
                 {currentUser.role === Role.STAFF && record.changeRequest && record.changeRequest.status !== 'PENDING' && onRequestChange && ( // Staff can request again if previous was approved/rejected
                  <button onClick={() => onRequestChange(record)} className="text-yellow-600 hover:text-yellow-800 transition-colors">New Request</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BillingTable;
