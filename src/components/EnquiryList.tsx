import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  ArrowUpDown,
  Calendar,
  User as UserIcon,
  Tag,
  IndianRupee,
  Truck
} from 'lucide-react';
import { Enquiry, EnquiryStatus, User } from '../types';
import { formatIndianCurrency, formatDate } from '../utils/formatters';
import { MOCK_USERS } from '../mockData';

interface EnquiryListProps {
  enquiries: Enquiry[];
  onEnquiryClick: (enquiry: Enquiry) => void;
  onCreateNew: () => void;
}

export default function EnquiryList({ enquiries, onEnquiryClick, onCreateNew }: EnquiryListProps) {
  const [statusTab, setStatusTab] = useState<EnquiryStatus>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [revenueFilter, setRevenueFilter] = useState<string[]>([]);
  const [supplyFilter, setSupplyFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('');

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(enq => {
      const matchesStatus = enq.status === statusTab;
      const matchesSearch = searchQuery === '' || 
        enq.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enq.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enq.leadOverview.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRevenue = revenueFilter.length === 0 || enq.revenueRoles.some(r => revenueFilter.includes(r));
      const matchesSupply = supplyFilter.length === 0 || enq.supplyRoles.some(s => supplyFilter.includes(s));
      const matchesType = typeFilter === '' || enq.type === typeFilter;
      const matchesChannel = channelFilter === '' || enq.leadChannel === channelFilter;

      return matchesStatus && matchesSearch && matchesRevenue && matchesSupply && matchesType && matchesChannel;
    });
  }, [enquiries, statusTab, searchQuery, revenueFilter, supplyFilter, typeFilter, channelFilter]);

  const getEarliestActionDate = (actions: any[]) => {
    const incomplete = actions.filter(a => !a.isCompleted);
    if (incomplete.length === 0) return '-';
    const dates = incomplete.map(a => new Date(a.dueDate).getTime());
    return formatDate(new Date(Math.min(...dates)).toISOString());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header & Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(['Active', 'Converted', 'Dropped'] as EnquiryStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusTab(status)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                statusTab === status 
                ? 'bg-white text-emerald-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {status} ({enquiries.filter(e => e.status === status).length})
            </button>
          ))}
        </div>
        <button 
          onClick={onCreateNew}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          CREATE NEW ENQUIRY
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 p-3 flex flex-wrap gap-3 items-center shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text"
            placeholder="Search Enquiry ID, Customer, Overview..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <select 
            className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-[11px] font-medium focus:outline-none"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Lead Type: All</option>
            <option value="MTO">MTO</option>
            <option value="Ready">Ready</option>
          </select>

          <select 
            className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-[11px] font-medium focus:outline-none"
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
          >
            <option value="">Channel: All</option>
            {['Direct', 'Website', 'WhatsApp', 'LinkedIn', 'Event', 'Others'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1.5">
            <UserIcon size={12} className="text-gray-400" />
            <span className="text-[11px] font-medium text-gray-600">Revenue:</span>
            <select 
              className="bg-transparent text-[11px] font-bold focus:outline-none"
              onChange={(e) => {
                if (e.target.value) setRevenueFilter([e.target.value]);
                else setRevenueFilter([]);
              }}
            >
              <option value="">All</option>
              {MOCK_USERS.filter(u => u.role === 'revenue' || u.role === 'admin').map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1.5">
            <Truck size={12} className="text-gray-400" />
            <span className="text-[11px] font-medium text-gray-600">Supply:</span>
            <select 
              className="bg-transparent text-[11px] font-bold focus:outline-none"
              onChange={(e) => {
                if (e.target.value) setSupplyFilter([e.target.value]);
                else setSupplyFilter([]);
              }}
            >
              <option value="">All</option>
              {MOCK_USERS.filter(u => u.role === 'supply' || u.role === 'admin').map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
            <tr className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
              <th className="px-4 py-2 border-r border-gray-200">ID</th>
              {statusTab === 'Converted' && <th className="px-4 py-2 border-r border-gray-200">Order ID</th>}
              <th className="px-4 py-2 border-r border-gray-200">Customer</th>
              <th className="px-4 py-2 border-r border-gray-200">Overview</th>
              <th className="px-4 py-2 border-r border-gray-200">Type</th>
              <th className="px-4 py-2 border-r border-gray-200">Revenue</th>
              <th className="px-4 py-2 border-r border-gray-200">Supply</th>
              <th className="px-4 py-2 border-r border-gray-200">Rev Action</th>
              <th className="px-4 py-2 border-r border-gray-200">Sup Action</th>
              <th className="px-4 py-2 border-r border-gray-200 text-right">Exp Value</th>
              <th className="px-4 py-2 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredEnquiries.map((enq) => (
              <tr 
                key={enq.id}
                onClick={() => onEnquiryClick(enq)}
                className="hover:bg-emerald-50 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-2.5 border-r border-gray-100 font-mono text-[11px] font-bold text-emerald-700">
                  {enq.id}
                </td>
                {statusTab === 'Converted' && (
                  <td className="px-4 py-2.5 border-r border-gray-100 font-mono text-[11px] font-bold text-blue-700">
                    {enq.orderId || '-'}
                  </td>
                )}
                <td className="px-4 py-2.5 border-r border-gray-100 text-[11px] font-semibold">
                  {enq.customerName}
                </td>
                <td className="px-4 py-2.5 border-r border-gray-100 text-[11px] text-gray-600 max-w-xs truncate">
                  {enq.leadOverview}
                </td>
                <td className="px-4 py-2.5 border-r border-gray-100">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    enq.type === 'MTO' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {enq.type}
                  </span>
                </td>
                <td className="px-4 py-2.5 border-r border-gray-100 text-[11px]">
                  <div className="flex -space-x-2 overflow-hidden">
                    {enq.revenueRoles.map(uid => (
                      <div key={uid} className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-[8px] font-bold" title={MOCK_USERS.find(u => u.id === uid)?.name}>
                        {MOCK_USERS.find(u => u.id === uid)?.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2.5 border-r border-gray-100 text-[11px]">
                  <div className="flex -space-x-2 overflow-hidden">
                    {enq.supplyRoles.map(uid => (
                      <div key={uid} className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-[8px] font-bold" title={MOCK_USERS.find(u => u.id === uid)?.name}>
                        {MOCK_USERS.find(u => u.id === uid)?.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2.5 border-r border-gray-100 text-[10px] font-medium text-red-600">
                  {getEarliestActionDate(enq.revenueActions)}
                </td>
                <td className="px-4 py-2.5 border-r border-gray-100 text-[10px] font-medium text-blue-600">
                  {getEarliestActionDate(enq.supplyActions)}
                </td>
                <td className="px-4 py-2.5 border-r border-gray-100 text-[11px] font-bold text-right">
                  {formatIndianCurrency(enq.expectedValue)}
                </td>
                <td className="px-4 py-2.5 text-[10px] text-gray-400 text-right">
                  {formatDate(enq.createdOn)}
                </td>
              </tr>
            ))}
            {filteredEnquiries.length === 0 && (
              <tr>
                <td colSpan={statusTab === 'Converted' ? 11 : 10} className="px-4 py-10 text-center text-gray-400 text-xs italic">
                  No enquiries found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
