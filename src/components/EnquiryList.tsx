import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Truck,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronRight,
  Check
} from 'lucide-react';
import { Enquiry, EnquiryStatus, User } from '../types';
import { formatIndianCurrency, formatDate } from '../utils/formatters';
import { MOCK_USERS } from '../mockData';

const FILTER_CATEGORIES = [
  { id: 'type', label: 'Lead Type', icon: Tag },
  { id: 'channel', label: 'Lead Channel', icon: Filter },
  { id: 'revenue', label: 'Revenue Role', icon: UserIcon },
  { id: 'supply', label: 'Supply Role', icon: Truck },
  { id: 'leadDate', label: 'Lead Date', icon: Calendar },
  { id: 'revDue', label: 'Revenue Due', icon: CheckCircle2 },
  { id: 'supDue', label: 'Supply Due', icon: Truck },
  { id: 'value', label: 'Expected Value', icon: IndianRupee },
  { id: 'city', label: 'City', icon: Filter },
  { id: 'source', label: 'Source', icon: Search },
];

interface EnquiryListProps {
  enquiries: Enquiry[];
  onEnquiryClick: (enquiry: Enquiry) => void;
  onCreateNew: () => void;
  isCompact?: boolean;
}

export default function EnquiryList({ enquiries, onEnquiryClick, onCreateNew, isCompact = false }: EnquiryListProps) {
  const [statusTab, setStatusTab] = useState<EnquiryStatus>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [revenueFilter, setRevenueFilter] = useState<string[]>([]);
  const [supplyFilter, setSupplyFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('');
  
  // New Filters
  const [leadDateStart, setLeadDateStart] = useState<string>('');
  const [leadDateEnd, setLeadDateEnd] = useState<string>('');
  const [revDueStart, setRevDueStart] = useState<string>('');
  const [revDueEnd, setRevDueEnd] = useState<string>('');
  const [supDueStart, setSupDueStart] = useState<string>('');
  const [supDueEnd, setSupDueEnd] = useState<string>('');
  const [minExpValue, setMinExpValue] = useState<string>('');
  const [maxExpValue, setMaxExpValue] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');

  // Pill-based Filter UI State
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
        setActiveCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return typeFilter !== '' || 
           channelFilter !== '' || 
           revenueFilter.length > 0 || 
           supplyFilter.length > 0 || 
           leadDateStart !== '' || 
           leadDateEnd !== '' || 
           revDueStart !== '' || 
           revDueEnd !== '' || 
           supDueStart !== '' || 
           supDueEnd !== '' || 
           minExpValue !== '' || 
           maxExpValue !== '' || 
           cityFilter !== '' || 
           sourceFilter !== '';
  }, [typeFilter, channelFilter, revenueFilter, supplyFilter, leadDateStart, leadDateEnd, revDueStart, revDueEnd, supDueStart, supDueEnd, minExpValue, maxExpValue, cityFilter, sourceFilter]);

  const renderFilterOptions = () => {
    switch (activeCategory) {
      case 'type':
        return ['MTO', 'Ready'].map(t => (
          <button
            key={t}
            onClick={() => { setTypeFilter(t); setShowFilterMenu(false); setActiveCategory(null); }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded transition-colors ${typeFilter === t ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {t}
            {typeFilter === t && <Check size={12} />}
          </button>
        ));
      case 'channel':
        return ['Direct', 'Website', 'WhatsApp', 'LinkedIn', 'Event', 'Others'].map(c => (
          <button
            key={c}
            onClick={() => { setChannelFilter(c); setShowFilterMenu(false); setActiveCategory(null); }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded transition-colors ${channelFilter === c ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {c}
            {channelFilter === c && <Check size={12} />}
          </button>
        ));
      case 'revenue':
        return MOCK_USERS.filter(u => u.role === 'revenue' || u.role === 'admin').map(u => (
          <button
            key={u.id}
            onClick={() => {
              const newFilter = revenueFilter.includes(u.id) 
                ? revenueFilter.filter(id => id !== u.id)
                : [...revenueFilter, u.id];
              setRevenueFilter(newFilter);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded transition-colors ${revenueFilter.includes(u.id) ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {u.name}
            {revenueFilter.includes(u.id) && <Check size={12} />}
          </button>
        ));
      case 'supply':
        return MOCK_USERS.filter(u => u.role === 'supply' || u.role === 'admin').map(u => (
          <button
            key={u.id}
            onClick={() => {
              const newFilter = supplyFilter.includes(u.id) 
                ? supplyFilter.filter(id => id !== u.id)
                : [...supplyFilter, u.id];
              setSupplyFilter(newFilter);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded transition-colors ${supplyFilter.includes(u.id) ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {u.name}
            {supplyFilter.includes(u.id) && <Check size={12} />}
          </button>
        ));
      case 'leadDate':
        return (
          <div className="p-2 space-y-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Start Date</label>
              <input type="date" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={leadDateStart} onChange={(e) => setLeadDateStart(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">End Date</label>
              <input type="date" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={leadDateEnd} onChange={(e) => setLeadDateEnd(e.target.value)} />
            </div>
          </div>
        );
      case 'revDue':
        return (
          <div className="p-2 space-y-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Start Date</label>
              <input type="date" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={revDueStart} onChange={(e) => setRevDueStart(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">End Date</label>
              <input type="date" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={revDueEnd} onChange={(e) => setRevDueEnd(e.target.value)} />
            </div>
          </div>
        );
      case 'supDue':
        return (
          <div className="p-2 space-y-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Start Date</label>
              <input type="date" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={supDueStart} onChange={(e) => setSupDueStart(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">End Date</label>
              <input type="date" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={supDueEnd} onChange={(e) => setSupDueEnd(e.target.value)} />
            </div>
          </div>
        );
      case 'value':
        return (
          <div className="p-2 space-y-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Min Value</label>
              <input type="number" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={minExpValue} onChange={(e) => setMinExpValue(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Max Value</label>
              <input type="number" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={maxExpValue} onChange={(e) => setMaxExpValue(e.target.value)} />
            </div>
          </div>
        );
      case 'city':
        return uniqueCities.map(city => (
          <button
            key={city}
            onClick={() => { setCityFilter(city); setShowFilterMenu(false); setActiveCategory(null); }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded transition-colors ${cityFilter === city ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {city}
            {cityFilter === city && <Check size={12} />}
          </button>
        ));
      case 'source':
        return (
          <div className="p-2">
            <input 
              type="text" 
              placeholder="Type source..." 
              className="w-full px-2 py-1 border border-gray-200 rounded text-xs" 
              value={sourceFilter} 
              onChange={(e) => setSourceFilter(e.target.value)} 
              autoFocus
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderActivePills = () => {
    const pills = [];

    if (typeFilter) {
      pills.push({ id: 'type', label: `Type: ${typeFilter}`, onClear: () => setTypeFilter('') });
    }
    if (channelFilter) {
      pills.push({ id: 'channel', label: `Channel: ${channelFilter}`, onClear: () => setChannelFilter('') });
    }
    if (revenueFilter.length > 0) {
      const names = revenueFilter.map(id => MOCK_USERS.find(u => u.id === id)?.name).join(', ');
      pills.push({ id: 'revenue', label: `Revenue: ${names}`, onClear: () => setRevenueFilter([]) });
    }
    if (supplyFilter.length > 0) {
      const names = supplyFilter.map(id => MOCK_USERS.find(u => u.id === id)?.name).join(', ');
      pills.push({ id: 'supply', label: `Supply: ${names}`, onClear: () => setSupplyFilter([]) });
    }
    if (leadDateStart || leadDateEnd) {
      pills.push({ id: 'leadDate', label: `Lead: ${leadDateStart || '...'} to ${leadDateEnd || '...'}`, onClear: () => { setLeadDateStart(''); setLeadDateEnd(''); } });
    }
    if (revDueStart || revDueEnd) {
      pills.push({ id: 'revDue', label: `Rev Due: ${revDueStart || '...'} to ${revDueEnd || '...'}`, onClear: () => { setRevDueStart(''); setRevDueEnd(''); } });
    }
    if (supDueStart || supDueEnd) {
      pills.push({ id: 'supDue', label: `Sup Due: ${supDueStart || '...'} to ${supDueEnd || '...'}`, onClear: () => { setSupDueStart(''); setSupDueEnd(''); } });
    }
    if (minExpValue || maxExpValue) {
      pills.push({ id: 'value', label: `Value: ${minExpValue || '0'} - ${maxExpValue || '∞'}`, onClear: () => { setMinExpValue(''); setMaxExpValue(''); } });
    }
    if (cityFilter) {
      pills.push({ id: 'city', label: `City: ${cityFilter}`, onClear: () => setCityFilter('') });
    }
    if (sourceFilter) {
      pills.push({ id: 'source', label: `Source: ${sourceFilter}`, onClear: () => setSourceFilter('') });
    }

    return pills.map(pill => (
      <div key={pill.id} className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold">
        <span>{pill.label}</span>
        <button onClick={pill.onClear} className="hover:text-emerald-900 transition-colors">
          <X size={12} />
        </button>
      </div>
    ));
  };

  const getEarliestActionDateRaw = (actions: any[]) => {
    const incomplete = actions.filter(a => !a.isCompleted);
    if (incomplete.length === 0) return null;
    const dates = incomplete.map(a => new Date(a.dueDate).getTime());
    return Math.min(...dates);
  };

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

      // Lead Date Filter
      const enqDate = new Date(enq.leadDate).getTime();
      const matchesLeadDate = (!leadDateStart || enqDate >= new Date(leadDateStart).getTime()) &&
                             (!leadDateEnd || enqDate <= new Date(leadDateEnd).getTime());

      // Revenue Action Due Filter
      const earliestRevAction = getEarliestActionDateRaw(enq.revenueActions);
      const matchesRevDue = (!revDueStart || (earliestRevAction && earliestRevAction >= new Date(revDueStart).getTime())) &&
                           (!revDueEnd || (earliestRevAction && earliestRevAction <= new Date(revDueEnd).getTime()));

      // Supply Action Due Filter
      const earliestSupAction = getEarliestActionDateRaw(enq.supplyActions);
      const matchesSupDue = (!supDueStart || (earliestSupAction && earliestSupAction >= new Date(supDueStart).getTime())) &&
                           (!supDueEnd || (earliestSupAction && earliestSupAction <= new Date(supDueEnd).getTime()));

      // Expected Value Filter
      const matchesExpValue = (!minExpValue || enq.expectedValue >= Number(minExpValue)) &&
                             (!maxExpValue || enq.expectedValue <= Number(maxExpValue));

      const matchesCity = !cityFilter || enq.city.toLowerCase() === cityFilter.toLowerCase();
      const matchesSource = !sourceFilter || enq.leadSource.toLowerCase().includes(sourceFilter.toLowerCase());

      return matchesStatus && matchesSearch && matchesRevenue && matchesSupply && matchesType && matchesChannel && 
             matchesLeadDate && matchesRevDue && matchesSupDue && matchesExpValue && matchesCity && matchesSource;
    });
  }, [enquiries, statusTab, searchQuery, revenueFilter, supplyFilter, typeFilter, channelFilter, 
      leadDateStart, leadDateEnd, revDueStart, revDueEnd, supDueStart, supDueEnd, minExpValue, maxExpValue, cityFilter, sourceFilter]);

  const getEarliestActionDate = (actions: any[]) => {
    const incomplete = actions.filter(a => !a.isCompleted);
    if (incomplete.length === 0) return '-';
    const dates = incomplete.map(a => new Date(a.dueDate).getTime());
    return formatDate(new Date(Math.min(...dates)).toISOString());
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRevenueFilter([]);
    setSupplyFilter([]);
    setTypeFilter('');
    setChannelFilter('');
    setLeadDateStart('');
    setLeadDateEnd('');
    setRevDueStart('');
    setRevDueEnd('');
    setSupDueStart('');
    setSupDueEnd('');
    setMinExpValue('');
    setMaxExpValue('');
    setCityFilter('');
    setSourceFilter('');
  };

  const uniqueCities = useMemo(() => {
    const cities = new Set(enquiries.map(e => e.city));
    return Array.from(cities).sort();
  }, [enquiries]);

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
      <div className="bg-white border-b border-gray-200 p-3 flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`relative flex-1 ${isCompact ? 'min-w-[150px]' : 'min-w-[200px]'}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text"
              placeholder={isCompact ? "Search..." : "Search Enquiry ID, Customer, Overview..."}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative" ref={filterMenuRef}>
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-bold transition-colors"
            >
              <Plus size={14} />
              Filter
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                {!activeCategory ? (
                  <>
                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Add Filter</div>
                    {FILTER_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <cat.icon size={14} className="text-gray-400" />
                          <span>{cat.label}</span>
                        </div>
                        <ChevronRight size={12} className="text-gray-300" />
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col">
                    <button 
                      onClick={() => setActiveCategory(null)}
                      className="px-3 py-2 flex items-center gap-2 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 border-b border-gray-100"
                    >
                      <ChevronDown size={12} className="-rotate-90" />
                      BACK TO FILTERS
                    </button>
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {renderFilterOptions()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Active Filter Pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {renderActivePills()}
          </div>
        )}
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
              {!isCompact && (
                <>
                  <th className="px-4 py-2 border-r border-gray-200">Type</th>
                  <th className="px-4 py-2 border-r border-gray-200">Revenue</th>
                  <th className="px-4 py-2 border-r border-gray-200">Supply</th>
                  <th className="px-4 py-2 border-r border-gray-200">Rev Action</th>
                  <th className="px-4 py-2 border-r border-gray-200">Sup Action</th>
                </>
              )}
              <th className="px-4 py-2 border-r border-gray-200 text-right">Exp Value</th>
              {!isCompact && <th className="px-4 py-2 text-right">Created</th>}
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
                <td className={`px-4 py-2.5 border-r border-gray-100 text-[11px] text-gray-600 truncate ${isCompact ? 'max-w-[100px]' : 'max-w-xs'}`}>
                  {enq.leadOverview}
                </td>
                {!isCompact && (
                  <>
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
                  </>
                )}
                <td className="px-4 py-2.5 border-r border-gray-100 text-[11px] font-bold text-right">
                  {formatIndianCurrency(enq.expectedValue)}
                </td>
                {!isCompact && (
                  <td className="px-4 py-2.5 text-[10px] text-gray-400 text-right">
                    {formatDate(enq.createdOn)}
                  </td>
                )}
              </tr>
            ))}
            {filteredEnquiries.length === 0 && (
              <tr>
                <td colSpan={isCompact ? (statusTab === 'Converted' ? 5 : 4) : (statusTab === 'Converted' ? 11 : 10)} className="px-4 py-10 text-center text-gray-400 text-xs italic">
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
