export enum Role {
  OWNER = 'OWNER',
  STAFF = 'STAFF',
}

export interface User {
  id: string;
  username: string;
  password?: string; // Only for mock auth
  role: Role;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export interface BillingChangeRequest {
  requestedBy: string; // staffId
  reason: string;
  requestedChanges: Partial<BillingRecord>; // What fields staff wants to change
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
}

export interface BillingRecord {
  id: string;
  customerName: string;
  carDetails: string; // e.g., "Toyota Camry - Red"
  services: Service[]; // Stores a snapshot of services with their prices at the time of billing
  totalAmount: number;
  paymentStatus: PaymentStatus;
  timestamp: string;
  staffId: string; // User ID of staff who created it
  notes?: string; // For "communicate with car owners"
  changeRequest?: BillingChangeRequest;
}

export enum NotificationType {
  BILLING_CHANGE_REQUEST = 'BILLING_CHANGE_REQUEST',
  GENERAL_INFO = 'GENERAL_INFO',
}

export interface AppNotification {
  id: string;
  message: string;
  type: NotificationType;
  billingRecordId?: string;
  isRead: boolean;
  timestamp: string;
}

export interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, passwordAttempt: string) => boolean;
  logout: () => void;
  
  billingRecords: BillingRecord[];
  addBillingRecord: (record: Omit<BillingRecord, 'id' | 'timestamp' | 'staffId' | 'totalAmount' | 'services'>, selectedServices: Service[], staff: User) => void;
  updateBillingRecord: (id: string, updates: Partial<BillingRecord>) => void;
  deleteBillingRecord: (id: string) => void;
  
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  requestBillingChange: (billingRecordId: string, changes: Partial<BillingRecord>, reason: string, staff: User) => void;
  approveBillingChange: (notificationId: string) => void;
  rejectBillingChange: (notificationId: string) => void;

  services: Service[]; // Dynamic list of all available services
  addService: (serviceData: Omit<Service, 'id'>) => void;
  updateService: (serviceId: string, updates: Partial<Service>) => void;
  deleteService: (serviceId: string) => void;
}

// Reporting Types
export enum ReportPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export interface ChartData {
  categories: string[];
  series: { name: string; data: number[] }[];
}

export interface ServiceUsageData {
  name: string;
  count: number;
  revenue: number;
}

export interface RevenueDataPoint {
  date: string; // or Date
  revenue: number;
}

export interface StaffPerformanceData {
  staffId: string;
  staffName: string;
  washesCount: number;
  totalRevenue: number;
}

export interface ReportData {
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  filteredRecords: BillingRecord[];
  totalRevenue: number;
  totalWashes: number;
  serviceUsage: ServiceUsageData[];
  revenueOverTime: RevenueDataPoint[]; // For line/bar chart (e.g. daily revenue in a week)
  staffPerformance: StaffPerformanceData[];
}