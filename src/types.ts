export interface User {
  id: string;
  name: string;
  email: string;
  role: 'revenue' | 'supply' | 'admin';
}

export interface Customer {
  id: string;
  name: string;
  city: string;
  poc: string;
  contact: string;
}

export interface ActionItem {
  id: string;
  action: string;
  dueDate: string;
  remark: string;
  isCompleted: boolean;
  type: 'revenue' | 'supply';
}

export type EnquiryStatus = 'Active' | 'Converted' | 'Dropped';
export type EnquiryType = 'MTO' | 'Ready';
export type LeadChannel = 'Direct' | 'Website' | 'WhatsApp' | 'LinkedIn' | 'Event' | 'Others';

export interface Enquiry {
  id: string;
  orderId?: string;
  customerName: string;
  city: string;
  poc: string;
  contact: string;
  leadOverview: string;
  leadDetails: string;
  type: EnquiryType;
  revenueRoles: string[]; // User IDs
  supplyRoles: string[]; // User IDs
  orderValue: number;
  conversionProbability: number;
  expectedValue: number;
  leadDate: string;
  leadChannel: LeadChannel;
  leadSource: string;
  status: EnquiryStatus;
  dropReason?: string;
  createdOn: string;
  revenueActions: ActionItem[];
  supplyActions: ActionItem[];
  files: string[]; // Mock file URLs
}
