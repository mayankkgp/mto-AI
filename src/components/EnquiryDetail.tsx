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

  const [showDropModal, setShowDropModal] = useState(false);
  const [dropReason, setDropReason] = useState('');
  const [newAction, setNewAction] = useState({ text: '', date: '', remark: '', type: 'revenue' as 'revenue' | 'supply' });

  // Auto-calculation for Expected Value
  useEffect(() => {
    const value = (formData.orderValue || 0) * ((formData.conversionProbability || 0) / 100);
    setFormData(prev => ({ ...prev, expectedValue: value }));
  }, [formData.orderValue, formData.conversionProbability]);

  // Auto-fill logic for Customer
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
  };

  const toggleActionCompletion = (id: string, type: 'revenue' | 'supply') => {
    const listKey = type === 'revenue' ? 'revenueActions' : 'supplyActions';
    setFormData(prev => ({
      ...prev,
      [listKey]: prev[listKey]?.map(a => a.id === id ? { ...a, isCompleted: !a.isCompleted } : a)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="w-full max-w-4xl h-full bg-white shadow-2xl flex flex-col"
      >
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
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 no-scrollbar">
          {/* Section A: Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
              <FileText size={14} className="text-emerald-600" />
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Overview</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Customer Info */}
              <div className="col-span-1 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Customer Name *</label>
                  <div className="relative">
                    <input 
                      list="customers"
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      value={formData.customerName}
                      onChange={(e) => handleCustomerSelect(e.target.value)}
                    />
                    <datalist id="customers">
                      {MOCK_CUSTOMERS.map(c => <option key={c.id} value={c.name} />)}
                    </datalist>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">City *</label>
                    <input 
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs outline-none"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">POC *</label>
                    <input 
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs outline-none"
                      value={formData.poc}
                      onChange={(e) => setFormData({...formData, poc: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Contact *</label>
                  <input 
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs outline-none"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  />
                </div>
              </div>

              {/* Lead Info */}
              <div className="col-span-1 space-y-3 border-x border-gray-100 px-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Lead Overview *</label>
                  <input 
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs outline-none"
                    value={formData.leadOverview}
                    onChange={(e) => setFormData({...formData, leadOverview: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Lead Details</label>
                  <textarea 
                    rows={3}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs outline-none resize-none"
                    value={formData.leadDetails}
                    onChange={(e) => setFormData({...formData, leadDetails: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Type *</label>
                    <select 
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs outline-none"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as EnquiryType})}
                    >
                      <option value="MTO">MTO</option>
                      <option value="Ready">Ready</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Channel</label>
                    <select 
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs outline-none"
                      value={formData.leadChannel}
                      onChange={(e) => setFormData({...formData, leadChannel: e.target.value as LeadChannel})}
                    >
                      {['Direct', 'Website', 'WhatsApp', 'LinkedIn', 'Event', 'Others'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Commercials */}
              <div className="col-span-1 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Order Value (₹)</label>
                    <input 
                      type="number"
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs font-bold outline-none"
                      value={formData.orderValue}
                      onChange={(e) => setFormData({...formData, orderValue: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Prob (%)</label>
                    <select 
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs outline-none"
                      value={formData.conversionProbability}
                      onChange={(e) => setFormData({...formData, conversionProbability: Number(e.target.value)})}
                    >
                      {[10, 30, 50, 70, 90].map(p => <option key={p} value={p}>{p}%</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Expected Value</label>
                  <div className="w-full px-2 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded text-xs font-bold">
                    {formatIndianCurrency(formData.expectedValue || 0)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Lead Date</label>
                    <input 
                      type="date"
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-[10px] outline-none"
                      value={formData.leadDate}
                      onChange={(e) => setFormData({...formData, leadDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Lead Source</label>
                    <input 
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs outline-none"
                      value={formData.leadSource}
                      onChange={(e) => setFormData({...formData, leadSource: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Roles & Files */}
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Revenue Role *</label>
                    <div className="flex flex-wrap gap-1 p-1.5 bg-gray-50 border border-gray-200 rounded min-h-[32px]">
                      {formData.revenueRoles?.map(uid => (
                        <span key={uid} className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1">
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
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Supply Role</label>
                    <div className="flex flex-wrap gap-1 p-1.5 bg-gray-50 border border-gray-200 rounded min-h-[32px]">
                      {formData.supplyRoles?.map(uid => (
                        <span key={uid} className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1">
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
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Files & Attachments</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:border-emerald-300 transition-colors cursor-pointer bg-gray-50">
                  <Paperclip size={20} className="text-gray-400" />
                  <p className="text-[10px] text-gray-500 font-medium">Drag & Drop or Paste Image</p>
                  <button className="text-[9px] font-bold text-emerald-600 uppercase">Browse Files</button>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Action Items */}
          <div className="grid grid-cols-2 gap-6">
            {/* Revenue Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                <CheckCircle2 size={14} className="text-red-500" />
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Revenue Action Items</h3>
              </div>
              
              {/* Inline Add */}
              <div className="flex gap-1 bg-gray-50 p-2 rounded border border-gray-200">
                <input 
                  placeholder="Action..."
                  className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-[11px] outline-none"
                  value={newAction.type === 'revenue' ? newAction.text : ''}
                  onChange={(e) => setNewAction({...newAction, text: e.target.value, type: 'revenue'})}
                />
                <input 
                  type="date"
                  className="w-24 bg-white border border-gray-200 rounded px-1 py-1 text-[10px] outline-none"
                  value={newAction.type === 'revenue' ? newAction.date : ''}
                  onChange={(e) => setNewAction({...newAction, date: e.target.value, type: 'revenue'})}
                />
                <button 
                  onClick={() => addActionItem('revenue')}
                  className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
                {formData.revenueActions?.map(item => (
                  <div key={item.id} className={`flex items-start gap-2 p-2 rounded border ${item.isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <button onClick={() => toggleActionCompletion(item.id, 'revenue')} className="mt-0.5">
                      {item.isCompleted ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} className="text-gray-300 hover:text-emerald-400" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-[11px] font-bold truncate ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.action}</p>
                        <span className="text-[9px] font-bold text-red-500 shrink-0">{item.dueDate}</span>
                      </div>
                      {item.remark && <p className="text-[10px] text-gray-500 mt-0.5 italic">{item.remark}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Supply Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                <Truck size={14} className="text-blue-500" />
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Supply Action Items</h3>
              </div>
              
              {/* Inline Add */}
              <div className="flex gap-1 bg-gray-50 p-2 rounded border border-gray-200">
                <input 
                  placeholder="Action..."
                  className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-[11px] outline-none"
                  value={newAction.type === 'supply' ? newAction.text : ''}
                  onChange={(e) => setNewAction({...newAction, text: e.target.value, type: 'supply'})}
                />
                <input 
                  type="date"
                  className="w-24 bg-white border border-gray-200 rounded px-1 py-1 text-[10px] outline-none"
                  value={newAction.type === 'supply' ? newAction.date : ''}
                  onChange={(e) => setNewAction({...newAction, date: e.target.value, type: 'supply'})}
                />
                <button 
                  onClick={() => addActionItem('supply')}
                  className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
                {formData.supplyActions?.map(item => (
                  <div key={item.id} className={`flex items-start gap-2 p-2 rounded border ${item.isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <button onClick={() => toggleActionCompletion(item.id, 'supply')} className="mt-0.5">
                      {item.isCompleted ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} className="text-gray-300 hover:text-emerald-400" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-[11px] font-bold truncate ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.action}</p>
                        <span className="text-[9px] font-bold text-blue-500 shrink-0">{item.dueDate}</span>
                      </div>
                      {item.remark && <p className="text-[10px] text-gray-500 mt-0.5 italic">{item.remark}</p>}
                    </div>
                  </div>
                ))}
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
      </motion.div>
    </div>
  );
}
