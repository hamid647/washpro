
import React, { useState, useEffect, createContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginScreen from './components/auth/LoginScreen';
import DashboardPage from './components/dashboard/DashboardPage';
import { User, Role, BillingRecord, AppNotification, AppContextType, Service, PaymentStatus, NotificationType } from './types';
import { INITIAL_USERS, INITIAL_SERVICE_OPTIONS } from './constants'; // Import INITIAL_SERVICE_OPTIONS

export const AppContext = createContext<AppContextType | null>(null);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICE_OPTIONS); // Initialize services state
  const navigate = useNavigate();

  // Load initial data / check auth from localStorage (simulation)
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user: User = JSON.parse(storedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    // Simulate loading some initial billing records
    // Ensure services in initial records match those in INITIAL_SERVICE_OPTIONS for consistency
    const basicWashService = INITIAL_SERVICE_OPTIONS.find(s => s.id === 'S001');
    const premiumWashService = INITIAL_SERVICE_OPTIONS.find(s => s.id === 'S002');
    const tireShineService = INITIAL_SERVICE_OPTIONS.find(s => s.id === 'S006');

    const initialRecords: BillingRecord[] = [];
    if (basicWashService) {
        initialRecords.push({
            id: 'br_init_001',
            customerName: 'Alice Wonderland',
            carDetails: 'Honda Civic - Blue',
            services: [basicWashService], // Use the service object
            totalAmount: basicWashService.price,
            paymentStatus: PaymentStatus.PAID,
            timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            staffId: 'staff01',
            notes: 'Paid cash.'
        });
    }
     if (premiumWashService && tireShineService) {
        initialRecords.push({
            id: 'br_init_002',
            customerName: 'Bob The Builder',
            carDetails: 'Ford F-150 - Red',
            services: [premiumWashService, tireShineService], // Use service objects
            totalAmount: premiumWashService.price + tireShineService.price,
            paymentStatus: PaymentStatus.PENDING,
            timestamp: new Date().toISOString(),
            staffId: 'staff02',
            notes: 'Customer will pay by card later.'
        });
    }
    setBillingRecords(initialRecords);

  }, []);

  const login = (username: string, passwordAttempt: string): boolean => {
    const user = INITIAL_USERS.find(u => u.username === username && u.password === passwordAttempt);
    if (user) {
      const { password, ...userToStore } = user; // Don't store password
      setCurrentUser(userToStore);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      navigate('/dashboard');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const addBillingRecord = (data: Omit<BillingRecord, 'id' | 'timestamp' | 'staffId' | 'totalAmount' | 'services'>, selectedServices: Service[], staff: User) => {
    const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const newRecord: BillingRecord = {
      ...data,
      id: `br_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      staffId: staff.id,
      services: selectedServices, // These are snapshots of services at the time of billing
      totalAmount,
    };
    setBillingRecords(prev => [newRecord, ...prev].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  const updateBillingRecord = (id: string, updates: Partial<BillingRecord>) => {
    setBillingRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates, timestamp: new Date().toISOString() } : r)
    .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };
  
  const deleteBillingRecord = (id: string) => {
    setBillingRecords(prev => prev.filter(r => r.id !== id));
  };

  const addNotification = (notificationData: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: AppNotification = {
      ...notificationData,
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };
  
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const requestBillingChange = (billingRecordId: string, changes: Partial<BillingRecord>, reason: string, staff: User) => {
    const record = billingRecords.find(br => br.id === billingRecordId);
    if (!record) return;

    const changeRequestPayload = {
        requestedBy: staff.id,
        reason,
        requestedChanges: changes,
        status: 'PENDING' as 'PENDING',
        timestamp: new Date().toISOString(),
    };
    
    updateBillingRecord(billingRecordId, { changeRequest: changeRequestPayload });
    addNotification({
        message: `Billing change requested by ${staff.name} for record ${billingRecordId.substring(0,8)} (Customer: ${record.customerName}).`,
        type: NotificationType.BILLING_CHANGE_REQUEST,
        billingRecordId: billingRecordId,
    });
  };

  const approveBillingChange = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification || !notification.billingRecordId) return;
    
    const record = billingRecords.find(br => br.id === notification.billingRecordId);
    if (!record || !record.changeRequest) return;

    let appliedChanges: Partial<BillingRecord> = { ...record.changeRequest.requestedChanges };
    if (record.changeRequest.requestedChanges.notes && typeof record.changeRequest.requestedChanges.notes === 'string') {
        const updatedNotes = record.notes ? `${record.notes}\nApproved Change: ${record.changeRequest.requestedChanges.notes}` : `Approved Change: ${record.changeRequest.requestedChanges.notes}`;
        appliedChanges.notes = updatedNotes;
    }
    
    updateBillingRecord(notification.billingRecordId, { 
        ...appliedChanges, 
        changeRequest: { ...record.changeRequest, status: 'APPROVED' } 
    });
    markNotificationAsRead(notificationId);
    
    addNotification({
        message: `Billing change request for record ${notification.billingRecordId.substring(0,8)} approved.`,
        type: NotificationType.GENERAL_INFO, 
        billingRecordId: notification.billingRecordId,
    });
  };

  const rejectBillingChange = (notificationId: string) => {
     const notification = notifications.find(n => n.id === notificationId);
    if (!notification || !notification.billingRecordId) return;

    const record = billingRecords.find(br => br.id === notification.billingRecordId);
    if (!record || !record.changeRequest) return;
    
    updateBillingRecord(notification.billingRecordId, { 
        changeRequest: { ...record.changeRequest, status: 'REJECTED' } 
    });
    markNotificationAsRead(notificationId);
    addNotification({
        message: `Billing change request for record ${notification.billingRecordId.substring(0,8)} rejected.`,
        type: NotificationType.GENERAL_INFO,
        billingRecordId: notification.billingRecordId,
    });
  };

  // Service Management Functions
  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: `serv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    setServices(prev => [...prev, newService]);
  };

  const updateService = (serviceId: string, updates: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, ...updates } : s));
  };

  const deleteService = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
    // Optional: Could also update billing records if they reference a deleted service,
    // but typically historical records should retain the service info as it was.
    // For simplicity, we won't cascade delete/update to billing records here.
  };


  const contextValue: AppContextType = {
    currentUser,
    isAuthenticated,
    login,
    logout,
    billingRecords,
    addBillingRecord,
    updateBillingRecord,
    deleteBillingRecord,
    notifications,
    addNotification,
    markNotificationAsRead,
    requestBillingChange,
    approveBillingChange,
    rejectBillingChange,
    services, // Provide services state
    addService,
    updateService,
    deleteService,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginScreen /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </AppContext.Provider>
  );
};

export default App;