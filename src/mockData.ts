import { User, Customer, Enquiry } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Mayank', email: 'mayank@fabrito.in', role: 'admin' },
  { id: 'u2', name: 'Rahul', email: 'rahul@fabrito.in', role: 'revenue' },
  { id: 'u3', name: 'Priya', email: 'priya@fabrito.in', role: 'supply' },
  { id: 'u4', name: 'Amit', email: 'amit@fabrito.in', role: 'revenue' },
  { id: 'u5', name: 'Suresh', email: 'suresh@fabrito.in', role: 'supply' },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Global Apparel Co', city: 'Mumbai', poc: 'Mr. Sharma', contact: '+91 98765 43210' },
  { id: 'c2', name: 'Trendsetters India', city: 'Delhi', poc: 'Ms. Gupta', contact: '+91 87654 32109' },
  { id: 'c3', name: 'Ethnic Wear Ltd', city: 'Jaipur', poc: 'Mr. Jain', contact: '+91 76543 21098' },
];

export const MOCK_ENQUIRIES: Enquiry[] = [
  {
    id: 'ENQ-001',
    customerName: 'Global Apparel Co',
    city: 'Mumbai',
    poc: 'Mr. Sharma',
    contact: '+91 98765 43210',
    leadOverview: '1000m Cotton Twill for Summer Collection',
    leadDetails: 'Urgent requirement for high-quality cotton twill. Swatches needed by Friday.',
    type: 'MTO',
    revenueRoles: ['u1', 'u2'],
    supplyRoles: ['u3'],
    orderValue: 500000,
    conversionProbability: 70,
    expectedValue: 350000,
    leadDate: '2026-03-20',
    leadChannel: 'WhatsApp',
    leadSource: 'Referral',
    status: 'Active',
    createdOn: '2026-03-20',
    revenueActions: [
      { id: 'a1', action: 'Send Swatches', dueDate: '2026-03-25', remark: 'Check stock first', isCompleted: false, type: 'revenue' }
    ],
    supplyActions: [
      { id: 'a2', action: 'Check Mill Availability', dueDate: '2026-03-24', remark: 'Call Mill A', isCompleted: true, type: 'supply' }
    ],
    files: []
  },
  {
    id: 'ENQ-002',
    customerName: 'Trendsetters India',
    city: 'Delhi',
    poc: 'Ms. Gupta',
    contact: '+91 87654 32109',
    leadOverview: 'Ready Stock Silk Fabric',
    leadDetails: 'Looking for immediate delivery of 500m silk.',
    type: 'Ready',
    revenueRoles: ['u4'],
    supplyRoles: ['u5'],
    orderValue: 200000,
    conversionProbability: 90,
    expectedValue: 180000,
    leadDate: '2026-03-22',
    leadChannel: 'Direct',
    leadSource: 'Walk-in',
    status: 'Active',
    createdOn: '2026-03-22',
    revenueActions: [],
    supplyActions: [],
    files: []
  }
];
