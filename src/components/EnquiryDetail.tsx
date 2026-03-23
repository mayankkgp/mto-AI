import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Paperclip, 
  Download, 
  Eye, 
  ArrowRight,
  AlertCircle,
  ChevronDown,
  FileText,
  Truck
} from 'lucide-react';
import { Enquiry, ActionItem, Customer, User, EnquiryType, LeadChannel } from '../types';
import { MOCK_CUSTOMERS, MOCK_USERS } from '../mockData';
import { formatIndianCurrency } from '../utils/formatters';
import { motion, AnimatePresence } from 'motion/react';

interface EnquiryDetailProps {
  enquiry: Enquiry | null;
  onClose: () => void;
  onSave: (enquiry: Enquiry) => void;
  onConvert: (enquiry: Enquiry) => void;
  onDrop: (enquiry: Enquiry, reason: string) => void;
}

export default function EnquiryDetail({ enquiry, onClose, onSave, onConvert, onDrop }: EnquiryDetailProps) {
  const [formData, setFormData] = useState<Partial<Enquiry>>(
    enquiry || {
      id: `ENQ-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customerName: '',
      city: '',
      poc: '',
      contact: '',
      leadOverview: '',
      leadDetails: '',
      type: 'MTO',
      revenueRoles: ['u1'], // Default to current user (Mayank)
      supplyRoles: [],
      orderValue: 0,
      conversionProbability: 50,
      expectedValue: 0,
      leadDate: new Date().toISOString().split('T')[0],
      leadChannel: 'Direct',
      leadSource: '',
      status: 'Active',
      createdOn: new Date().toISOString().split('T')[0],
      revenueActions: [],
      supplyActions: [],
      files: []
    }
  );

  useEffect(() => {
    if (enquiry) {
      setFormData(enquiry);
    } else {
      setFormData({
        id: `ENQ-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        customerName: '',
        city: '',
        poc: '',
        contact: '',
        leadOverview: '',
        leadDetails: '',
        type: 'MTO',
        revenueRoles: ['u1'],
        supplyRoles: [],
        orderValue: 0,
        conversionProbability: 50,
        expectedValue: 0,
        leadDate: new Date().toISOString().split('T')[0],
        leadChannel: 'Direct',
        leadSource: '',
        status: 'Active',
        createdOn: new Date().toISOString().split('T')[0],
        revenueActions: [],
        supplyActions: [],
        files: []
      });
    }
  }, [enquiry]);

  const [showDropModal, setShowDropModal] = useState(false);
  const [dropReason, setDropReason] = useState('');
  const [newAction, setNewAction] = useState({ text: '', date: '', remark: '', type: 'revenue' as 'revenue' | 'supply' });
  const [editingAction, setEditingAction] = useState<{ id: string; field: 'action' | 'dueDate' | 'remark' } | null>(null);
  const revActionInputRef = useRef<HTMLInputElement>(null);
  const supActionInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clipboard Paste Support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              setFormData(prev => ({
                ...prev,
                files: [...(prev.files || []), dataUrl]
              }));
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Helper for Indian Currency Formatting in Input
  const formatInputCurrency = (val: number | string) => {
    if (val === undefined || val === null || val === '') return '';
    const num = val.toString().replace(/,/g, '');
    if (isNaN(Number(num))) return '';
    return new Intl.NumberFormat('en-IN').format(Number(num));
  };

  const parseInputCurrency = (val: string) => {
    return Number(val.replace(/,/g, '')) || 0;
  };

  // Auto-calculation for Expected Value
  useEffect(() => {
    const value = (formData.orderValue || 0) * ((formData.conversionProbability || 0) / 100);
    setFormData(prev => ({ ...prev, expectedValue: value }));
  }, [formData.orderValue, formData.conversionProbability]);

  // Auto-fill logic for Customer
  useEffect(() => {
    setFormData(enquiry || {
      customerName: '',
      city: '',
      poc: '',
      contact: '',
      leadOverview: '',
      leadDetails: '',
      type: 'MTO',
      leadChannel: 'Direct',
      orderValue: 0,
      conversionProbability: 50,
      expectedValue: 0,
      leadDate: new Date().toISOString().split('T')[0],
      leadSource: '',
      revenueRoles: [],
      supplyRoles: [],
      revenueActions: [],
      supplyActions: [],
      status: 'Active'
    });
  }, [enquiry]);

  const handleCustomerSelect = (name: string) => {
    const customer = MOCK_CUSTOMERS.find(c => c.name === name);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerName: customer.name,
        city: customer.city,
        poc: customer.poc,
        contact: customer.contact
      }));
    } else {
      setFormData(prev => ({ ...prev, customerName: name }));
    }
  };

  const addActionItem = (type: 'revenue' | 'supply') => {
    if (!newAction.text || !newAction.date) return;
    
    const item: ActionItem = {
      id: Math.random().toString(36).substr(2, 9),
      action: newAction.text,
      dueDate: newAction.date,
      remark: newAction.remark,
      isCompleted: false,
      type
    };

    if (type === 'revenue') {
      setFormData(prev => ({ ...prev, revenueActions: [...(prev.revenueActions || []), item] }));
    } else {
      setFormData(prev => ({ ...prev, supplyActions: [...(prev.supplyActions || []), item] }));
    }
    setNewAction({ text: '', date: '', remark: '', type });
    
    // Focus back to the correct input
    if (type === 'revenue') {
      revActionInputRef.current?.focus();
    } else {
      supActionInputRef.current?.focus();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      Array.from(selectedFiles).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          setFormData(prev => ({
            ...prev,
            files: [...(prev.files || []), dataUrl]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      Array.from(droppedFiles).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          setFormData(prev => ({
            ...prev,
            files: [...(prev.files || []), dataUrl]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (fileName: string) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files?.filter(f => f !== fileName)
    }));
  };

  const handleDownload = (file: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = file;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateActionItem = (id: string, type: 'revenue' | 'supply', field: keyof ActionItem, value: string) => {
    const listKey = type === 'revenue' ? 'revenueActions' : 'supplyActions';
    setFormData(prev => ({
      ...prev,
      [listKey]: prev[listKey]?.map(a => a.id === id ? { ...a, [field]: value } : a)
    }));
  };

  const toggleActionCompletion = (id: string, type: 'revenue' | 'supply') => {
    const listKey = type === 'revenue' ? 'revenueActions' : 'supplyActions';
    setFormData(prev => ({
      ...prev,
      [listKey]: prev[listKey]?.map(a => a.id === id ? { ...a, isCompleted: !a.isCompleted } : a)
    }));
  };

  return (
    <div className="h-full bg-white flex flex-col border-l border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
              {enquiry ? `Edit Enquiry: ${enquiry.id}` : 'Create New Enquiry'}
            </h2>
            {formData.status && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                formData.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                formData.status === 'Converted' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {formData.status}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {formData.status === 'Active' && (
              <>
                <button 
                  onClick={() => onConvert(formData as Enquiry)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded flex items-center gap-1.5 transition-colors"
                >
                  <ArrowRight size={14} /> CONVERT
                </button>
                <button 
                  onClick={() => setShowDropModal(true)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-[11px] font-bold rounded flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 size={14} /> DROP
                </button>
              </>
            )}
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button 
              onClick={() => onSave(formData as Enquiry)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded flex items-center gap-1.5 transition-colors"
            >
              <Save size={14} /> SAVE
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-hidden grid no-scrollbar transition-[grid-template-columns] duration-500 ease-in-out"
          style={{ gridTemplateColumns: !enquiry ? '70% 30%' : '35% 65%' }}
        >
          {/* Left: Overview (Scrollable) */}
          <div className="overflow-y-auto p-4 border-r border-gray-100 no-scrollbar">
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                <FileText size={14} className="text-emerald-600" />
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Overview</h3>
              </div>
              
              <div className="space-y-6">
                {/* Row 1: Customer Info */}
                <div className={`grid ${!enquiry ? 'grid-cols-4' : 'grid-cols-1'} gap-4 bg-gray-50/50 p-3 rounded-lg border border-gray-100 transition-all duration-500`}>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Customer Name *</label>
                    <div className="relative">
                      <input 
                        list="customers"
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-[11px] font-semibold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        value={formData.customerName}
                        onChange={(e) => handleCustomerSelect(e.target.value)}
                      />
                      <datalist id="customers">
                        {MOCK_CUSTOMERS.map(c => <option key={c.id} value={c.name} />)}
                      </datalist>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">City *</label>
                    <input 
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-[11px] outline-none"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">POC *</label>
                    <input 
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-[11px] outline-none"
                      value={formData.poc}
                      onChange={(e) => setFormData({...formData, poc: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Contact *</label>
                    <input 
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-[11px] outline-none"
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    />
                  </div>
                </div>

                {/* Row 2: Lead Info */}
                <div className={`grid ${!enquiry ? 'grid-cols-2' : 'grid-cols-1'} gap-4 bg-gray-50/50 p-3 rounded-lg border border-gray-100 transition-all duration-500`}>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Lead Overview *</label>
                    <textarea 
                      rows={2}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                      value={formData.leadOverview}
                      onChange={(e) => {
                        setFormData({...formData, leadOverview: e.target.value});
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      onFocus={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      placeholder="Brief overview of the lead..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Lead Details</label>
                    <textarea 
                      rows={2}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                      value={formData.leadDetails}
                      onChange={(e) => {
                        setFormData({...formData, leadDetails: e.target.value});
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      onFocus={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      placeholder="Detailed requirements, specifications, etc..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Type *</label>
                    <div className="flex bg-white border border-gray-200 rounded p-0.5">
                      {(['MTO', 'Ready'] as EnquiryType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData({...formData, type: t})}
                          className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${
                            formData.type === t 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Channel</label>
                    <select 
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-[11px] outline-none"
                      value={formData.leadChannel}
                      onChange={(e) => setFormData({...formData, leadChannel: e.target.value as LeadChannel})}
                    >
                      {['Direct', 'Website', 'WhatsApp', 'LinkedIn', 'Event', 'Others'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Commercials */}
                <div className={`grid ${!enquiry ? 'grid-cols-5' : 'grid-cols-2'} gap-4 bg-emerald-50/30 p-3 rounded-lg border border-emerald-100/50 transition-all duration-500`}>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-emerald-700 uppercase">Order Value (₹)</label>
                    <input 
                      type="text"
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-[11px] font-bold outline-none focus:border-emerald-500"
                      value={formatInputCurrency(formData.orderValue || 0)}
                      onChange={(e) => setFormData({...formData, orderValue: parseInputCurrency(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-emerald-700 uppercase">Prob (%)</label>
                    <select 
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-[11px] outline-none"
                      value={formData.conversionProbability}
                      onChange={(e) => setFormData({...formData, conversionProbability: Number(e.target.value)})}
                    >
                      {[10, 30, 50, 70, 90].map(p => <option key={p} value={p}>{p}%</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-emerald-700 uppercase">Expected Value</label>
                    <div className="w-full px-2 py-1.5 bg-emerald-100/50 border border-emerald-200 text-emerald-800 rounded text-[11px] font-bold">
                      {formatIndianCurrency(formData.expectedValue || 0)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-emerald-700 uppercase">Lead Date</label>
                    <input 
                      type="date"
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-[10px] outline-none"
                      value={formData.leadDate}
                      onChange={(e) => setFormData({...formData, leadDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-emerald-700 uppercase">Lead Source</label>
                    <input 
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-[11px] outline-none"
                      value={formData.leadSource}
                      onChange={(e) => setFormData({...formData, leadSource: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Roles & Files */}
              <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-3">
                <div className={`grid ${!enquiry ? 'grid-cols-2' : 'grid-cols-1'} gap-4 transition-all duration-500`}>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Revenue Role *</label>
                    <div className="flex flex-wrap gap-1 p-1 bg-gray-50 border border-gray-200 rounded min-h-[28px]">
                      {formData.revenueRoles?.map(uid => (
                        <span key={uid} className="bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded text-[9px] font-bold flex items-center gap-1">
                          {MOCK_USERS.find(u => u.id === uid)?.name}
                          <button onClick={() => setFormData({...formData, revenueRoles: formData.revenueRoles?.filter(id => id !== uid)})}><X size={10} /></button>
                        </span>
                      ))}
                      <select 
                        className="bg-transparent text-[9px] outline-none"
                        onChange={(e) => {
                          if (e.target.value && !formData.revenueRoles?.includes(e.target.value)) {
                            setFormData({...formData, revenueRoles: [...(formData.revenueRoles || []), e.target.value]});
                          }
                        }}
                      >
                        <option value="">+ Add</option>
                        {MOCK_USERS.filter(u => u.role === 'revenue' || u.role === 'admin').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Supply Role</label>
                    <div className="flex flex-wrap gap-1 p-1 bg-gray-50 border border-gray-200 rounded min-h-[28px]">
                      {formData.supplyRoles?.map(uid => (
                        <span key={uid} className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-[9px] font-bold flex items-center gap-1">
                          {MOCK_USERS.find(u => u.id === uid)?.name}
                          <button onClick={() => setFormData({...formData, supplyRoles: formData.supplyRoles?.filter(id => id !== uid)})}><X size={10} /></button>
                        </span>
                      ))}
                      <select 
                        className="bg-transparent text-[9px] outline-none"
                        onChange={(e) => {
                          if (e.target.value && !formData.supplyRoles?.includes(e.target.value)) {
                            setFormData({...formData, supplyRoles: [...(formData.supplyRoles || []), e.target.value]});
                          }
                        }}
                      >
                        <option value="">+ Add</option>
                        {MOCK_USERS.filter(u => u.role === 'supply' || u.role === 'admin').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Files & Attachments</label>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    onChange={handleFileChange} 
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border border-dashed border-gray-200 rounded p-3 flex flex-col items-center justify-center gap-1 hover:border-emerald-300 transition-colors cursor-pointer bg-gray-50"
                  >
                    <Paperclip size={16} className="text-gray-400" />
                    <p className="text-[9px] text-gray-500 font-medium text-center">Drag & Drop, Click to Upload, or Paste from Clipboard</p>
                    <button className="text-[9px] font-bold text-emerald-600 uppercase">Browse Files</button>
                  </div>
                  
                  {/* File List */}
                  {formData.files && formData.files.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {formData.files.map((file, idx) => {
                        const isImage = file.startsWith('data:image');
                        const fileName = isImage ? `Image ${idx + 1}` : file;
                        
                        return (
                          <div key={idx} className="relative group bg-gray-50 rounded border border-gray-100 overflow-hidden aspect-square flex flex-col">
                            {isImage ? (
                              <img 
                                src={file} 
                                alt={fileName} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="flex-1 flex items-center justify-center bg-gray-100">
                                <FileText size={24} className="text-gray-400" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(file, fileName);
                                }}
                                className="p-1.5 bg-white/20 hover:bg-white/40 rounded text-white backdrop-blur-sm"
                              >
                                <Download size={14} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(file);
                                }}
                                className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded text-white backdrop-blur-sm"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="p-1 bg-white/90 backdrop-blur-sm border-t border-gray-100">
                              <p className="text-[8px] font-bold text-gray-600 truncate">{fileName}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Action Items (Pinned/Sticky) */}
          <div className="flex flex-col bg-gray-50/50 overflow-hidden border-l border-gray-100">
            {/* Unified Task Creation */}
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Plus size={14} className="text-emerald-600" />
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Add New Action Item</h3>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Action Item *</label>
                    <textarea 
                      rows={1}
                      placeholder="What needs to be done?"
                      className={`w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-[11px] font-bold outline-none resize-none transition-colors ${
                        newAction.type === 'revenue' ? 'focus:border-red-400' : 'focus:border-blue-400'
                      }`}
                      value={newAction.text}
                      onChange={(e) => {
                        setNewAction({...newAction, text: e.target.value});
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Type *</label>
                    <div className="flex bg-gray-100 p-0.5 rounded border border-gray-200 h-[30px]">
                      <button 
                        onClick={() => setNewAction({...newAction, type: 'revenue'})}
                        className={`px-3 text-[9px] font-bold rounded transition-all ${
                          newAction.type === 'revenue' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        REVENUE
                      </button>
                      <button 
                        onClick={() => setNewAction({...newAction, type: 'supply'})}
                        className={`px-3 text-[9px] font-bold rounded transition-all ${
                          newAction.type === 'supply' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        SUPPLY
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Due Date *</label>
                    <input 
                      type="date"
                      className={`w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] outline-none transition-colors ${
                        newAction.type === 'revenue' ? 'focus:border-red-400' : 'focus:border-blue-400'
                      }`}
                      value={newAction.date}
                      onChange={(e) => setNewAction({...newAction, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Remark (Optional)</label>
                    <textarea 
                      rows={1}
                      placeholder="Additional notes..."
                      className={`w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] outline-none italic resize-none transition-colors ${
                        newAction.type === 'revenue' ? 'focus:border-red-400' : 'focus:border-blue-400'
                      }`}
                      value={newAction.remark}
                      onChange={(e) => {
                        setNewAction({...newAction, remark: e.target.value});
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => addActionItem(newAction.type)}
                      className={`w-full py-1.5 rounded text-white transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold shadow-sm ${
                        newAction.type === 'revenue' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      <Plus size={14} /> CREATE TASK
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Side-by-Side Lists */}
            <div className="flex-1 grid grid-cols-2 overflow-hidden">
              {/* Revenue Column */}
              <div className="flex flex-col border-r border-gray-200 overflow-hidden">
                <div className="px-4 py-2 bg-red-50/50 border-b border-red-100 flex items-center gap-2 shrink-0">
                  <CheckCircle2 size={12} className="text-red-500" />
                  <h3 className="text-[9px] font-bold text-red-700 uppercase tracking-wider">Revenue Actions</h3>
                  <span className="ml-auto text-[9px] font-bold text-red-400 bg-white px-1.5 py-0.5 rounded-full border border-red-100">
                    {formData.revenueActions?.filter(a => !a.isCompleted).length} Active
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
                  {[...(formData.revenueActions || [])]
                    .sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1))
                    .map(item => (
                      <div key={item.id} className={`flex items-start gap-2 p-2 rounded border transition-all ${item.isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200 shadow-sm hover:border-red-200'}`}>
                        <button onClick={() => toggleActionCompletion(item.id, 'revenue')} className="mt-0.5 shrink-0">
                          {item.isCompleted ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Circle size={14} className="text-gray-300 hover:text-emerald-400" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            {editingAction?.id === item.id && editingAction.field === 'action' && !item.isCompleted ? (
                              <textarea 
                                autoFocus
                                rows={1}
                                className="flex-1 bg-gray-50 border border-red-200 rounded px-1 py-0.5 text-[11px] font-bold outline-none resize-none"
                                value={item.action}
                                onChange={(e) => {
                                  updateActionItem(item.id, 'revenue', 'action', e.target.value);
                                  e.target.style.height = 'auto';
                                  e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                                onBlur={() => setEditingAction(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingAction(null)}
                              />
                            ) : (
                              <p 
                                onClick={() => !item.isCompleted && setEditingAction({ id: item.id, field: 'action' })}
                                className={`text-[11px] font-bold flex-1 break-words leading-tight ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-800 cursor-text hover:text-red-600'}`}
                              >
                                {item.action}
                              </p>
                            )}

                            {editingAction?.id === item.id && editingAction.field === 'dueDate' && !item.isCompleted ? (
                              <input 
                                type="date"
                                autoFocus
                                className="bg-gray-50 border border-red-200 rounded px-1 py-0.5 text-[9px] font-bold outline-none"
                                value={item.dueDate}
                                onChange={(e) => updateActionItem(item.id, 'revenue', 'dueDate', e.target.value)}
                                onBlur={() => setEditingAction(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingAction(null)}
                              />
                            ) : (
                              <span 
                                onClick={() => !item.isCompleted && setEditingAction({ id: item.id, field: 'dueDate' })}
                                className={`text-[9px] font-bold shrink-0 ml-2 ${item.isCompleted ? 'text-gray-400' : 'text-red-500 cursor-text hover:underline'}`}
                              >
                                {item.dueDate}
                              </span>
                            )}
                          </div>
                          
                          {editingAction?.id === item.id && editingAction.field === 'remark' && !item.isCompleted ? (
                            <textarea 
                              autoFocus
                              rows={1}
                              placeholder="Add remark..."
                              className="w-full mt-1 bg-gray-50 border border-red-200 rounded px-1 py-0.5 text-[10px] italic outline-none resize-none"
                              value={item.remark}
                              onChange={(e) => {
                                updateActionItem(item.id, 'revenue', 'remark', e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                              onBlur={() => setEditingAction(null)}
                              onKeyDown={(e) => e.key === 'Enter' && setEditingAction(null)}
                            />
                          ) : (
                            <p 
                              onClick={() => !item.isCompleted && setEditingAction({ id: item.id, field: 'remark' })}
                              className={`text-[10px] mt-0.5 italic leading-tight ${item.isCompleted ? 'text-gray-400' : 'text-gray-500 cursor-text hover:text-gray-700'}`}
                            >
                              {item.remark || (item.isCompleted ? '' : '+ Add remark')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Supply Column */}
              <div className="flex flex-col overflow-hidden">
                <div className="px-4 py-2 bg-blue-50/50 border-b border-blue-100 flex items-center gap-2 shrink-0">
                  <Truck size={12} className="text-blue-500" />
                  <h3 className="text-[9px] font-bold text-blue-700 uppercase tracking-wider">Supply Actions</h3>
                  <span className="ml-auto text-[9px] font-bold text-blue-400 bg-white px-1.5 py-0.5 rounded-full border border-blue-100">
                    {formData.supplyActions?.filter(a => !a.isCompleted).length} Active
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
                  {[...(formData.supplyActions || [])]
                    .sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1))
                    .map(item => (
                      <div key={item.id} className={`flex items-start gap-2 p-2 rounded border transition-all ${item.isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200 shadow-sm hover:border-blue-200'}`}>
                        <button onClick={() => toggleActionCompletion(item.id, 'supply')} className="mt-0.5 shrink-0">
                          {item.isCompleted ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Circle size={14} className="text-gray-300 hover:text-emerald-400" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            {editingAction?.id === item.id && editingAction.field === 'action' && !item.isCompleted ? (
                              <textarea 
                                autoFocus
                                rows={1}
                                className="flex-1 bg-gray-50 border border-blue-200 rounded px-1 py-0.5 text-[11px] font-bold outline-none resize-none"
                                value={item.action}
                                onChange={(e) => {
                                  updateActionItem(item.id, 'supply', 'action', e.target.value);
                                  e.target.style.height = 'auto';
                                  e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                                onBlur={() => setEditingAction(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingAction(null)}
                              />
                            ) : (
                              <p 
                                onClick={() => !item.isCompleted && setEditingAction({ id: item.id, field: 'action' })}
                                className={`text-[11px] font-bold flex-1 break-words leading-tight ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-800 cursor-text hover:text-blue-600'}`}
                              >
                                {item.action}
                              </p>
                            )}

                            {editingAction?.id === item.id && editingAction.field === 'dueDate' && !item.isCompleted ? (
                              <input 
                                type="date"
                                autoFocus
                                className="bg-gray-50 border border-blue-200 rounded px-1 py-0.5 text-[9px] font-bold outline-none"
                                value={item.dueDate}
                                onChange={(e) => updateActionItem(item.id, 'supply', 'dueDate', e.target.value)}
                                onBlur={() => setEditingAction(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingAction(null)}
                              />
                            ) : (
                              <span 
                                onClick={() => !item.isCompleted && setEditingAction({ id: item.id, field: 'dueDate' })}
                                className={`text-[9px] font-bold shrink-0 ml-2 ${item.isCompleted ? 'text-gray-400' : 'text-blue-500 cursor-text hover:underline'}`}
                              >
                                {item.dueDate}
                              </span>
                            )}
                          </div>
                          
                          {editingAction?.id === item.id && editingAction.field === 'remark' && !item.isCompleted ? (
                            <textarea 
                              autoFocus
                              rows={1}
                              placeholder="Add remark..."
                              className="w-full mt-1 bg-gray-50 border border-blue-200 rounded px-1 py-0.5 text-[10px] italic outline-none resize-none"
                              value={item.remark}
                              onChange={(e) => {
                                updateActionItem(item.id, 'supply', 'remark', e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                              onBlur={() => setEditingAction(null)}
                              onKeyDown={(e) => e.key === 'Enter' && setEditingAction(null)}
                            />
                          ) : (
                            <p 
                              onClick={() => !item.isCompleted && setEditingAction({ id: item.id, field: 'remark' })}
                              className={`text-[10px] mt-0.5 italic leading-tight ${item.isCompleted ? 'text-gray-400' : 'text-gray-500 cursor-text hover:text-gray-700'}`}
                            >
                              {item.remark || (item.isCompleted ? '' : '+ Add remark')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drop Modal */}
        <AnimatePresence>
          {showDropModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-red-50">
                  <AlertCircle className="text-red-600" size={20} />
                  <h3 className="font-bold text-red-900">Drop Enquiry</h3>
                </div>
                <div className="p-4 space-y-4">
                  <p className="text-xs text-gray-600 font-medium">Please provide a reason for dropping this enquiry. This action is permanent.</p>
                  <textarea 
                    autoFocus
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="E.g., Price mismatch, Customer unresponsive..."
                    rows={4}
                    value={dropReason}
                    onChange={(e) => setDropReason(e.target.value)}
                  />
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-2">
                  <button 
                    onClick={() => setShowDropModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    CANCEL
                  </button>
                  <button 
                    disabled={!dropReason.trim()}
                    onClick={() => onDrop(formData as Enquiry, dropReason)}
                    className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    CONFIRM DROP
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  );
}
