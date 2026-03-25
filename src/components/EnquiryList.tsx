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

const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const FILTER_CATEGORIES = [
  { id: 'channel', label: 'Lead Channel', icon: Filter },
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
  activeEnquiryId?: string | null;
}

export default function EnquiryList({ 
  enquiries, 
  onEnquiryClick, 
  onCreateNew, 
  isCompact = false,
  activeEnquiryId = null
}: EnquiryListProps) {
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
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Pill-based Filter UI State
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showRevMenu, setShowRevMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const revMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
        setActiveCategory(null);
      }
      if (typeMenuRef.current && !typeMenuRef.current.contains(event.target as Node)) {
        setShowTypeMenu(false);
      }
      if (revMenuRef.current && !revMenuRef.current.contains(event.target as Node)) {
        setShowRevMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getActiveFilters = () => {
    const pills = [];
    if (typeFilter) {
      pills.push({ id: 'type', label: `Type: ${typeFilter}`, onClear: () => setTypeFilter('') });
    }
    if (revenueFilter.length > 0) {
      pills.push({ id: 'revenue', label: `Rev: ${revenueFilter.length}`, onClear: () => setRevenueFilter([]) });
    }
    if (channelFilter) {
      pills.push({ id: 'channel', label: `Channel: ${channelFilter}`, onClear: () => setChannelFilter('') });
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
    return pills;
  };

  const activeFilters = getActiveFilters();
  const hasActiveFilters = activeFilters.length > 0;

  const renderCategoryOptions = (categoryId: string) => {
    switch (categoryId) {
      case 'channel':
        return ['Direct', 'Website', 'WhatsApp', 'LinkedIn', 'Event', 'Others'].map(c => (
          <button
            key={c}
            onClick={() => setChannelFilter(channelFilter === c ? '' : c)}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded transition-colors ${channelFilter === c ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {c}
            {channelFilter === c && <Check size={12} />}
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
              <input type="date" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={leadDateStart} onChange={(e) => { setLeadDateStart(e.target.value); e.target.blur(); }} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">End Date</label>
              <input type="date" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={leadDateEnd} onChange={(e) => { setLeadDateEnd(e.target.value); e.target.blur(); }} />
            </div>
          </div>
        );
      case 'revDue':
        return (
          <div className="p-2 space-y-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Start Date</label>
              <input type="date" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={revDueStart} onChange={(e) => { setRevDueStart(e.target.value); e.target.blur(); }} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">End Date</label>
              <input type="date" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={revDueEnd} onChange={(e) => { setRevDueEnd(e.target.value); e.target.blur(); }} />
            </div>
          </div>
        );
      case 'supDue':
        return (
          <div className="p-2 space-y-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Start Date</label>
              <input type="date" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={supDueStart} onChange={(e) => { setSupDueStart(e.target.value); e.target.blur(); }} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">End Date</label>
              <input type="date" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" value={supDueEnd} onChange={(e) => { setSupDueEnd(e.target.value); e.target.blur(); }} />
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
            onClick={() => setCityFilter(cityFilter === city ? '' : city)}
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

  const getEarliestActionDateRaw = (actions: any[]) => {
    const incomplete = actions.filter(a => !a.isCompleted);
    if (incomplete.length === 0) return null;
    const dates = incomplete.map(a => new Date(a.dueDate).getTime());
    return Math.min(...dates);
  };

  const filteredEnquiries = useMemo(() => {
    const filtered = enquiries.filter(enq => {
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

    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case 'id':
            aValue = a.id;
            bValue = b.id;
            break;
          case 'customerName':
            aValue = a.customerName;
            bValue = b.customerName;
            break;
          case 'expectedValue':
            aValue = a.expectedValue || 0;
            bValue = b.expectedValue || 0;
            break;
          case 'revAction':
            aValue = getEarliestActionDateRaw(a.revenueActions) || Infinity;
            bValue = getEarliestActionDateRaw(b.revenueActions) || Infinity;
            break;
          case 'supAction':
            aValue = getEarliestActionDateRaw(a.supplyActions) || Infinity;
            bValue = getEarliestActionDateRaw(b.supplyActions) || Infinity;
            break;
          case 'createdOn':
            aValue = new Date(a.createdOn).getTime();
            bValue = new Date(b.createdOn).getTime();
            break;
          default:
            aValue = (a as any)[sortConfig.key];
            bValue = (b as any)[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        
        // Secondary fallback: expectedValue (Descending)
        return (b.expectedValue || 0) - (a.expectedValue || 0);
      });
    }

    return filtered;
  }, [enquiries, statusTab, searchQuery, revenueFilter, supplyFilter, typeFilter, channelFilter, 
      leadDateStart, leadDateEnd, revDueStart, revDueEnd, supDueStart, supDueEnd, minExpValue, maxExpValue, cityFilter, sourceFilter, sortConfig]);

  const getUrgencyInfo = (actions: any[]) => {
    const incomplete = actions.filter(a => !a.isCompleted);
    if (incomplete.length === 0) return { text: '-', color: 'text-gray-300' };
    
    const earliestTimestamp = Math.min(...incomplete.map(a => new Date(a.dueDate).getTime()));
    const now = new Date();
    
    // Reset time for day-based comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const actionDate = new Date(earliestTimestamp);
    const actionDay = new Date(actionDate.getFullYear(), actionDate.getMonth(), actionDate.getDate()).getTime();
    
    const diffTime = actionDay - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { 
        text: `Overdue by ${Math.abs(diffDays)}d`, 
        color: 'text-red-600 font-bold' 
      };
    } else if (diffDays === 0) {
      return { 
        text: 'Today', 
        color: 'text-orange-600 font-bold' 
      };
    } else if (diffDays === 1) {
      return { 
        text: 'Tomorrow', 
        color: 'text-emerald-600 font-medium' 
      };
    } else if (diffDays <= 7) {
      return { 
        text: `In ${diffDays} days`, 
        color: 'text-gray-600' 
      };
    } else {
      return { 
        text: formatDate(actionDate.toISOString()), 
        color: 'text-gray-400' 
      };
    }
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
    setSortConfig(null);
  };

  const SortHeader = ({ label, sortKey, className = "" }: { label: string, sortKey: string, className?: string }) => {
    const isActive = sortConfig?.key === sortKey;
    return (
      <th 
        className={`px-4 py-1 border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors group ${className}`}
        onClick={() => handleSort(sortKey)}
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          <div className={`transition-all ${isActive ? 'opacity-100 text-emerald-600' : 'opacity-0 group-hover:opacity-50'}`}>
            {isActive ? (
              sortConfig.direction === 'asc' ? <ChevronDown size={12} className="rotate-180" /> : <ChevronDown size={12} />
            ) : (
              <ArrowUpDown size={12} />
            )}
          </div>
        </div>
      </th>
    );
  };

  const uniqueCities = useMemo(() => {
    const cities = new Set(enquiries.map(e => e.city));
    return Array.from(cities).sort();
  }, [enquiries]);

  return (
    <div className="flex flex-col h-full">
      {/* Header & Tabs */}
      <div className="bg-white border-b border-gray-200 px-2 min-[height:801px]:px-4 py-1 min-[height:801px]:py-2 flex items-center justify-between shrink-0">
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
          className={`bg-emerald-600 hover:bg-emerald-700 text-white ${isCompact ? 'p-1.5' : 'px-3 py-1.5'} rounded-md text-xs font-bold flex items-center gap-2 transition-colors`}
          title={isCompact ? "CREATE NEW ENQUIRY" : ""}
        >
          <Plus size={16} />
          {!isCompact && "CREATE NEW ENQUIRY"}
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 px-2 min-[height:801px]:px-4 py-1 min-[height:801px]:py-1.5 flex items-center gap-3 shrink-0 h-9 min-[height:801px]:h-11">
        <div className={`relative ${isCompact ? 'w-48' : 'w-64'} shrink-0`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text"
            placeholder={isCompact ? "Search..." : "Search Enquiry ID, Customer, Overview..."}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Access: Lead Type */}
          {!isCompact && (
            <div className="relative" ref={typeMenuRef}>
              <button 
                onClick={() => setShowTypeMenu(!showTypeMenu)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap ${typeFilter ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                <span>{typeFilter ? `Type: ${typeFilter}` : 'Type: All'}</span>
                <ChevronDown size={12} className={`transition-transform ${showTypeMenu ? 'rotate-180' : ''}`} />
              </button>
              {showTypeMenu && (
                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                  <button
                    onClick={() => { setTypeFilter(''); setShowTypeMenu(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded transition-colors ${typeFilter === '' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    All Types
                    {typeFilter === '' && <Check size={12} />}
                  </button>
                  {['MTO', 'Ready'].map(t => (
                    <button
                      key={t}
                      onClick={() => { setTypeFilter(t); setShowTypeMenu(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded transition-colors ${typeFilter === t ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {t}
                      {typeFilter === t && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Access: Revenue Role */}
          <div className="relative" ref={revMenuRef}>
            <button 
              onClick={() => setShowRevMenu(!showRevMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap ${revenueFilter.length > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              title={isCompact ? (revenueFilter.length > 0 ? `Rev Role: ${revenueFilter.length} selected` : 'Rev Role: All') : ''}
            >
              {isCompact ? (
                <div className="flex items-center gap-1">
                  <UserIcon size={14} />
                  {revenueFilter.length > 0 && <span className="text-[10px]">{revenueFilter.length}</span>}
                </div>
              ) : (
                <span>{revenueFilter.length > 0 ? `Rev: ${revenueFilter.length}` : 'Rev Role: All'}</span>
              )}
              <ChevronDown size={12} className={`transition-transform ${showRevMenu ? 'rotate-180' : ''}`} />
            </button>
            {showRevMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                <button
                  onClick={() => { setRevenueFilter([]); setShowRevMenu(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded transition-colors ${revenueFilter.length === 0 ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  All Roles
                  {revenueFilter.length === 0 && <Check size={12} />}
                </button>
                {MOCK_USERS.filter(u => u.role === 'revenue' || u.role === 'admin').map(u => (
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
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={filterMenuRef}>
            <div className={`flex items-center rounded transition-colors ${activeFilters.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-l text-xs font-bold hover:bg-black/5 transition-colors shrink-0`}
                title={isCompact ? `Filter${activeFilters.length > 0 ? ` (${activeFilters.length})` : ''}` : "More Filters"}
              >
                <Filter size={14} />
                {!isCompact && <span>Filter{activeFilters.length > 0 ? ` (${activeFilters.length})` : ''}</span>}
                {isCompact && activeFilters.length > 0 && (
                  <span className="flex items-center justify-center bg-emerald-600 text-white text-[9px] w-3.5 h-3.5 rounded-full leading-none">
                    {activeFilters.length}
                  </span>
                )}
              </button>
              {activeFilters.length > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); clearFilters(); }}
                  className="px-1.5 py-1.5 hover:bg-emerald-200 rounded-r border-l border-emerald-200 transition-colors"
                  title="Clear All Filters"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {showFilterMenu && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                {activeFilters.length > 0 && (
                  <div className="px-2 py-2 border-b border-gray-100 bg-gray-50/50">
                    <div className="px-1 mb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Filters</div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeFilters.map(pill => (
                        <div key={pill.id} className="flex items-center gap-1 px-1.5 py-0.5 bg-white text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold">
                          <span className="max-w-[120px] truncate">{pill.label}</span>
                          <button onClick={pill.onClear} className="hover:text-emerald-900 transition-colors">
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="max-h-[400px] overflow-y-auto">
                  <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">Add Filter</div>
                  {FILTER_CATEGORIES.map(cat => (
                    <div key={cat.id} className="border-b border-gray-50 last:border-0">
                      <button
                        onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition-colors ${activeCategory === cat.id ? 'bg-emerald-50/50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-2">
                          <cat.icon size={14} className={activeCategory === cat.id ? 'text-emerald-500' : 'text-gray-400'} />
                          <span>{cat.label}</span>
                        </div>
                        <ChevronDown size={12} className={`text-gray-400 transition-transform ${activeCategory === cat.id ? 'rotate-180' : ''}`} />
                      </button>
                      {activeCategory === cat.id && (
                        <div className="bg-gray-50/50 py-1">
                          {renderCategoryOptions(cat.id)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-gray-50 z-30 border-b border-gray-200">
            <tr className="text-[10px] uppercase tracking-wider text-gray-500 font-bold whitespace-nowrap">
              <SortHeader label="Customer" sortKey="customerName" className="sticky left-0 z-40 bg-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[150px]" />
              <th className={`px-2 min-[height:801px]:px-4 py-0.5 min-[height:801px]:py-1 border-r border-gray-200 min-w-[200px] ${isCompact ? 'w-[200px]' : 'w-[25%]'}`}>Overview</th>
              <th className="px-2 min-[height:801px]:px-4 py-0.5 min-[height:801px]:py-1 border-r border-gray-200 min-w-[100px]">Rev Role</th>
              <SortHeader label="ID" sortKey="id" className="min-w-[100px]" />
              {statusTab === 'Converted' && <th className="px-2 min-[height:801px]:px-4 py-0.5 min-[height:801px]:py-1 border-r border-gray-200 min-w-[120px]">Order ID</th>}
              <th className="px-2 min-[height:801px]:px-4 py-0.5 min-[height:801px]:py-1 border-r border-gray-200 min-w-[80px]">Type</th>
              <th className="px-2 min-[height:801px]:px-4 py-0.5 min-[height:801px]:py-1 border-r border-gray-200 min-w-[120px]">Supply</th>
              <SortHeader label="Rev Action" sortKey="revAction" className="min-w-[120px]" />
              <SortHeader label="Sup Action" sortKey="supAction" className="min-w-[120px]" />
              <SortHeader label="Exp Value" sortKey="expectedValue" className="min-w-[110px]" />
              <SortHeader label="Created" sortKey="createdOn" className="min-w-[100px]" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredEnquiries.map((enq) => (
              <tr 
                key={enq.id}
                onClick={() => onEnquiryClick(enq)}
                className={`cursor-pointer transition-colors group relative align-top ${
                  activeEnquiryId === enq.id 
                    ? 'bg-emerald-50/60 hover:bg-emerald-100/40' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <td className={`px-2 min-[height:801px]:px-4 py-0.5 min-[height:801px]:py-1.5 border-r border-gray-100 text-[11px] font-semibold sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors ${
                  activeEnquiryId === enq.id ? 'bg-inherit border-l-[3px] border-emerald-600' : 'bg-inherit border-l-[3px] border-transparent'
                }`}>
                  {enq.customerName}
                </td>
                <td className={`px-2 min-[height:801px]:px-4 py-0.5 min-[height:801px]:py-1.5 border-r border-gray-100 text-[11px] text-gray-600 ${isCompact ? 'max-w-[200px] line-clamp-2' : 'w-[25%] max-w-0 truncate'}`}>
                  {enq.leadOverview}
                </td>
                <td className="px-2 min-[height:801px]:px-4 py-0.5 min-[height:801px]:py-1.5 border-r border-gray-100 text-[11px]">
                  <div className="flex flex-wrap gap-1">
                    {enq.revenueRoles.map(uid => {
                      const user = MOCK_USERS.find(u => u.id === uid);
                      return (
                        <div 
                          key={uid} 
                          className="px-1 py-0 bg-gray-100 text-gray-600 rounded text-[9px] font-bold border border-gray-200" 
                          title={user?.name}
                        >
                          {user ? getInitials(user.name) : '??'}
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td className="px-2 min-[height:801px]:px-4 py-0.5 min-[height:801px]:py-1.5 border-r border-gray-100 font-mono text-[11px] font-bold text-emerald-700 whitespace-nowrap">
                  {enq.id}
                </td>
                {statusTab === 'Converted' && (
                  <td className="px-2 min-[height:801px]:px-4 py-0.5 min-[height:801px]:py-1.5 border-r border-gray-100 font-mono text-[11px] font-bold text-blue-700 whitespace-nowrap">
                    {enq.orderId || '-'}
                  </td>
                )}
                <td className="px-2 min-[height:801px]:px-4 py-0.5 min-[height:801px]:py-1.5 border-r border-gray-100 whitespace-nowrap">
                  <span className={`px-2 py-0 rounded-full text-[9px] font-bold uppercase ${
                    enq.type === 'MTO' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {enq.type}
                  </span>
                </td>
                <td className="px-2 min-[height:801px]:px-4 py-0.5 min-[height:801px]:py-1.5 border-r border-gray-100 text-[11px]">
                  <div className="flex flex-nowrap gap-1">
                    {enq.supplyRoles.map(uid => {
                      const user = MOCK_USERS.find(u => u.id === uid);
                      return (
                        <div 
                          key={uid} 
                          className="px-1 py-0 bg-gray-100 text-gray-600 rounded text-[9px] font-bold border border-gray-200 whitespace-nowrap" 
                          title={user?.name}
                        >
                          {user ? getInitials(user.name) : '??'}
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td className="px-2 min-[height:801px]:px-4 py-0.5 min-[height:801px]:py-1.5 border-r border-gray-100 text-[10px] whitespace-nowrap">
                  {(() => {
                    const urgency = getUrgencyInfo(enq.revenueActions);
                    return <span className={urgency.color}>{urgency.text}</span>;
                  })()}
                </td>
                <td className="px-2 min-[height:801px]:px-4 py-0.5 min-[height:801px]:py-1.5 border-r border-gray-100 text-[10px] whitespace-nowrap">
                  {(() => {
                    const urgency = getUrgencyInfo(enq.supplyActions);
                    return <span className={urgency.color}>{urgency.text}</span>;
                  })()}
                </td>
                <td className="px-2 min-[height:801px]:px-4 py-0.5 min-[height:801px]:py-1.5 border-r border-gray-100 text-[11px] font-bold whitespace-nowrap">
                  {formatIndianCurrency(enq.expectedValue)}
                </td>
                <td className="px-2 min-[height:801px]:px-4 py-0.5 min-[height:801px]:py-1.5 text-[10px] text-gray-400 whitespace-nowrap">
                  {formatDate(enq.createdOn)}
                </td>
              </tr>
            ))}
            {filteredEnquiries.length === 0 && (
              <tr>
                <td colSpan={statusTab === 'Converted' ? 11 : 10} className="px-2 min-[height:801px]:px-4 py-4 min-[height:801px]:py-10 text-center text-gray-400 text-xs italic">
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
