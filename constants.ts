import { User, Role, Service, PaymentStatus, ReportPeriod } from './types';

export const APP_NAME = "WashPro Admin";

export const INITIAL_USERS: User[] = [
  { id: 'owner01', username: 'owner', password: 'password', role: Role.OWNER, name: 'Main Owner' },
  { id: 'staff01', username: 'staff1', password: 'password', role: Role.STAFF, name: 'John Doe' },
  { id: 'staff02', username: 'staff2', password: 'password', role: Role.STAFF, name: 'Jane Smith' },
];

// Renamed to INITIAL_SERVICE_OPTIONS to indicate it's seed data
export const INITIAL_SERVICE_OPTIONS: Service[] = [
  { id: 'S001', name: 'Basic Wash', price: 20, description: 'Exterior wash and dry.' },
  { id: 'S002', name: 'Premium Wash', price: 40, description: 'Basic wash + interior vacuum and underbody cleaning.' },
  { id: 'S003', name: 'Detailing - Wax & Polish', price: 75, description: 'Full exterior wax and polish.' },
  { id: 'S004', name: 'Detailing - Engine Clean', price: 50, description: 'Engine bay cleaning.' },
  { id: 'S005', name: 'Ceramic Coating Prep', price: 150, description: 'Surface preparation for ceramic coating.' },
  { id: 'S006', name: 'Tire Shine', price: 10, description: 'Application of tire shine product.' },
  { id: 'P001', name: 'Gold Package', price: 100, description: 'Premium Wash + Wax & Polish + Tire Shine.' },
];

export const PAYMENT_STATUS_OPTIONS = Object.values(PaymentStatus);

export const REPORT_PERIOD_OPTIONS = [
  { label: 'Daily (Today)', value: ReportPeriod.DAILY },
  { label: 'Weekly (Last 7 Days)', value: ReportPeriod.WEEKLY },
  { label: 'Monthly (Last 30 Days)', value: ReportPeriod.MONTHLY },
];