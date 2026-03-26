import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Plus, 
  CornerDownLeft,
  Paperclip, 
  Download, 
  Eye, 
  ArrowRight,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Truck,
  FileSpreadsheet,
  File,
  UserPlus,
  Check
} from 'lucide-react';
import { Enquiry, ActionItem, Customer, User, EnquiryType, LeadChannel } from '../types';
import { MOCK_CUSTOMERS, MOCK_USERS } from '../mockData';
import { formatIndianCurrency } from '../utils/formatters';
import { motion, AnimatePresence } from 'motion/react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface EnquiryDetailProps {
  enquiry: Enquiry | null;
  nextEnquiryId: string;
  onClose: () => void;
  onSave: (enquiry: Enquiry) => Promise<void>;
  onConvert: (enquiry: Enquiry) => void;
  onDrop: (enquiry: Enquiry, reason: string) => void;
}

export default function EnquiryDetail({ enquiry, nextEnquiryId, onClose, onSave, onConvert, onDrop }: EnquiryDetailProps) {
  const getDefaultFormData = (id: string): Partial<Enquiry> => ({
    id,
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
  });

  const [internalEnquiry, setInternalEnquiry] = useState<Enquiry | null>(enquiry);
  const [pendingAction, setPendingAction] = useState<{ type: 'close' } | { type: 'switch', enquiry: Enquiry | null } | null>(null);
  const [showAutoSaveError, setShowAutoSaveError] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const isSavingRef = useRef(false);

  const [formData, setFormData] = useState<Partial<Enquiry>>(
    enquiry || getDefaultFormData(nextEnquiryId)
  );

  const defaultFormData = React.useMemo(() => ({
    id: nextEnquiryId,
    customerName: '',
    city: '',
    poc: '',
    contact: '',
    leadOverview: '',
    leadDetails: '',
    type: 'MTO' as const,
    revenueRoles: ['u1'],
    supplyRoles: [],
    orderValue: 0,
    conversionProbability: 50,
    expectedValue: 0,
    status: 'Active' as const,
    leadDate: new Date().toISOString().split('T')[0],
    revenueActions: [],
    supplyActions: [],
    files: []
  }), [nextEnquiryId]);

  const isDirty = React.useMemo(() => {
    if (!internalEnquiry) {
      return JSON.stringify(formData) !== JSON.stringify(defaultFormData);
    }
    return JSON.stringify(formData) !== JSON.stringify(internalEnquiry);
  }, [formData, internalEnquiry, defaultFormData]);

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.customerName?.trim()) errors.push('customerName');
    if (!formData.city?.trim()) errors.push('city');
    if (!formData.poc?.trim()) errors.push('poc');
    if (!formData.contact?.trim()) errors.push('contact');
    if (!formData.leadOverview?.trim()) errors.push('leadOverview');
    if (!formData.type) errors.push('type');
    if (!formData.revenueRoles || formData.revenueRoles.length === 0) errors.push('revenueRoles');
    
    setValidationErrors(errors);

    // Force expand customer details if there are errors inside it
    if (errors.some(e => ['city', 'poc', 'contact'].includes(e))) {
      setIsCustomerExpanded(true);
    }

    return errors;
  };

  useEffect(() => {
    if (enquiry?.id !== internalEnquiry?.id && !isSavingRef.current && !showAutoSaveError && !showValidationModal) {
      if (isDirty) {
        const action = { type: 'switch' as const, enquiry };
        
        const errors = validateForm();
        if (errors.length > 0) {
          setPendingAction(action);
          setShowValidationModal(true);
          return;
        }

        setPendingAction(action);
        
        const doSave = async () => {
          isSavingRef.current = true;
          try {
            await onSave(formData as Enquiry);
            setInternalEnquiry(enquiry);
            setFormData(enquiry || getDefaultFormData(nextEnquiryId));
            setPendingAction(null);
            setValidationErrors([]);
          } catch (error) {
            setShowAutoSaveError(true);
          } finally {
            isSavingRef.current = false;
          }
        };
        doSave();
      } else {
        setInternalEnquiry(enquiry);
        setFormData(enquiry || getDefaultFormData(nextEnquiryId));
        setValidationErrors([]);
      }
    }
  }, [enquiry, internalEnquiry, isDirty, showAutoSaveError, showValidationModal, nextEnquiryId, onSave, formData]);

  const handleCloseRequest = async () => {
    if (isDirty) {
      const errors = validateForm();
      if (errors.length > 0) {
        setPendingAction({ type: 'close' });
        setShowValidationModal(true);
        return;
      }

      setPendingAction({ type: 'close' });
      isSavingRef.current = true;
      try {
        await onSave(formData as Enquiry);
        onClose();
      } catch (error) {
        setShowAutoSaveError(true);
      } finally {
        isSavingRef.current = false;
      }
    } else {
      onClose();
    }
  };

  const handleManualSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setShowValidationModal(true);
      return;
    }

    isSavingRef.current = true;
    try {
      await onSave(formData as Enquiry);
      setInternalEnquiry(formData as Enquiry);
      setValidationErrors([]);
    } catch (error) {
      setShowAutoSaveError(true);
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleRetrySave = async () => {
    setShowAutoSaveError(false);
    isSavingRef.current = true;
    try {
      await onSave(formData as Enquiry);
      if (pendingAction?.type === 'close') {
        onClose();
      } else if (pendingAction?.type === 'switch') {
        setInternalEnquiry(pendingAction.enquiry);
        setFormData(pendingAction.enquiry || getDefaultFormData(nextEnquiryId));
      }
      setPendingAction(null);
    } catch (error) {
      setShowAutoSaveError(true);
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleDiscardChanges = () => {
    setShowAutoSaveError(false);
    setShowValidationModal(false);
    setValidationErrors([]);
    if (pendingAction?.type === 'close') {
      onClose();
    } else if (pendingAction?.type === 'switch') {
      setInternalEnquiry(pendingAction.enquiry);
      setFormData(pendingAction.enquiry || getDefaultFormData(nextEnquiryId));
    }
    setPendingAction(null);
  };

  const [showDropModal, setShowDropModal] = useState(false);
  const [dropReason, setDropReason] = useState('');
  const [newAction, setNewAction] = useState({ text: '', date: '', remark: '', type: 'revenue' as 'revenue' | 'supply' });
  const [actionValidationErrors, setActionValidationErrors] = useState<string[]>([]);
  const [editingAction, setEditingAction] = useState<{ id: string; field: 'action' | 'dueDate' | 'remark' } | null>(null);
  const [isCustomerExpanded, setIsCustomerExpanded] = useState(!enquiry);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset validation errors on interaction
  useEffect(() => {
    if (validationErrors.length > 0) {
      const remainingErrors = validationErrors.filter(field => {
        const value = formData[field as keyof Enquiry];
        if (field === 'revenueRoles') {
          return !value || (value as string[]).length === 0;
        }
        if (typeof value === 'string') {
          return !value.trim();
        }
        return !value;
      });
      
      if (remainingErrors.length !== validationErrors.length) {
        setValidationErrors(remainingErrors);
      }
    }
  }, [formData, validationErrors]);

  // Helper for initials
  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Custom User Selector Component
  const UserSelector = ({ 
    users, 
    selectedUsers, 
    onToggle,
    children
  }: { 
    users: User[], 
    selectedUsers: string[], 
    onToggle: (userId: string) => void,
    children: React.ReactNode
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [renderUpwards, setRenderUpwards] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        // Auto-focus search input when popover opens
        setTimeout(() => searchInputRef.current?.focus(), 0);
      } else {
        setSearchQuery(''); // Reset search when closed
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleToggle = () => {
      if (!isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setRenderUpwards(spaceBelow < 200);
      }
      setIsOpen(!isOpen);
    };

    const filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="relative" ref={containerRef}>
        <div
          onClick={handleToggle}
          className="cursor-pointer"
        >
          {children}
        </div>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: renderUpwards ? 5 : -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: renderUpwards ? 5 : -5 }}
              className={`absolute left-0 z-50 bg-white border border-gray-200 rounded shadow-xl min-w-[160px] py-1 overflow-hidden flex flex-col ${
                renderUpwards ? 'bottom-full mb-1 origin-bottom' : 'top-full mt-1 origin-top'
              }`}
            >
              <div className="px-2 py-1 border-b border-gray-50 mb-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search users..."
                  className="w-full px-1.5 py-1 text-[10px] bg-gray-50 border border-gray-100 rounded outline-none focus:border-emerald-400 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="max-h-[160px] overflow-y-auto no-scrollbar">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => {
                    const isSelected = selectedUsers.includes(user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          onToggle(user.id);
                        }}
                        className={`w-full text-left px-2 py-1.5 text-[10px] flex items-center justify-between transition-colors ${
                          isSelected 
                            ? 'bg-emerald-50 text-emerald-700 font-bold' 
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="truncate">{user.name}</span>
                        {isSelected && <Check size={10} className="text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-2 py-3 text-center text-[10px] text-gray-400 italic">
                    No users found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  
  // File Preview States
  const [hoveredFile, setHoveredFile] = useState<{ file: string; fileName: string; isImage: boolean; isPdf: boolean; isDoc: boolean; isWord: boolean; isExcel: boolean; mimeType: string; displaySize: string; x: number; y: number; yOffset: string; constrainedHeight: number } | null>(null);
  const [lightboxFile, setLightboxFile] = useState<{ file: string; fileName: string; isImage: boolean; isPdf: boolean; isDoc: boolean; isWord: boolean; isExcel: boolean; mimeType: string; displaySize: string } | null>(null);
  const [securePdfUrl, setSecurePdfUrl] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (lightboxFile?.isPdf) {
      try {
        const base64String = lightboxFile.file.split(',')[1];
        if (base64String) {
          const byteCharacters = atob(base64String);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          setSecurePdfUrl(url);
          
          return () => {
            URL.revokeObjectURL(url);
          };
        }
      } catch (error) {
        console.error('Failed to convert PDF base64 to Blob URL:', error);
        setSecurePdfUrl(lightboxFile.file);
      }
    } else {
      setSecurePdfUrl(null);
    }
  }, [lightboxFile]);

  const getFileTypeInfo = (dataUrl: string) => {
    const match = dataUrl.match(/^data:([^;]+);/);
    const mimeType = match ? match[1] : '';
    
    const isImage = mimeType.startsWith('image/');
    const isPdf = mimeType === 'application/pdf';
    const isWord = mimeType.includes('wordprocessingml') || mimeType.includes('msword');
    const isExcel = mimeType.includes('spreadsheetml') || mimeType.includes('ms-excel');
    const isDoc = isWord || isExcel || mimeType.includes('presentationml') || mimeType.includes('ms-powerpoint') || mimeType === 'text/plain' || mimeType === 'text/csv';

    // Estimate size from base64 length
    const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
    const sizeInBytes = Math.ceil((base64Length * 3) / 4);
    const sizeInKB = (sizeInBytes / 1024).toFixed(1);
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    const displaySize = sizeInBytes > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`;

    return { isImage, isPdf, isDoc, isWord, isExcel, mimeType, displaySize };
  };

  const actionTextRef = useRef<HTMLTextAreaElement>(null);
  const actionDateRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overviewRef = useRef<HTMLTextAreaElement>(null);
  const detailsRef = useRef<HTMLTextAreaElement>(null);

  const updateTextareaHeight = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
    if (ref.current && ref.current.clientWidth > 0) {
      ref.current.style.height = 'auto';
      const scrollHeight = ref.current.scrollHeight;
      ref.current.style.height = Math.min(scrollHeight + 2, 80) + 'px';
      ref.current.style.overflowY = scrollHeight > 80 ? 'auto' : 'hidden';
    }
  };

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        updateTextareaHeight(overviewRef);
        updateTextareaHeight(detailsRef);
      });
    });

    if (overviewRef.current) observer.observe(overviewRef.current);
    if (detailsRef.current) observer.observe(detailsRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    updateTextareaHeight(overviewRef);
    updateTextareaHeight(detailsRef);
  }, [formData.leadOverview, formData.leadDetails, enquiry]);

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

  // Lightbox Escape Key Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          setLightboxFile(null);
        }
      }
    };
    
    if (lightboxFile) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxFile, showDeleteConfirm]);

  // File Hover Handlers
  const handleFileMouseEnter = (e: React.MouseEvent, file: string, fileName: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let x = rect.left + rect.width / 2;
    const popoverWidth = 320;
    const halfWidth = popoverWidth / 2;
    const popoverHeight = 400; // Max desired height of the popover
    
    // Constrain x to keep popover within viewport horizontally
    if (x - halfWidth < 10) {
      x = halfWidth + 10;
    } else if (x + halfWidth > window.innerWidth - 10) {
      x = window.innerWidth - halfWidth - 10;
    }
    
    // Calculate available space
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    let yOffset = '-100%';
    let y = rect.top - 10; // Default position above
    let constrainedHeight = popoverHeight;

    // Choose the direction with more space if default doesn't fit
    if (spaceAbove < popoverHeight && spaceBelow > spaceAbove) {
      // Flip downwards
      yOffset = '10px';
      y = rect.bottom;
      constrainedHeight = Math.min(popoverHeight, spaceBelow - 10);
    } else {
      // Keep upwards, but constrain height if necessary
      constrainedHeight = Math.min(popoverHeight, spaceAbove - 10);
    }

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      const fileInfo = getFileTypeInfo(file);
      setHoveredFile({ file, fileName, ...fileInfo, x, y, yOffset, constrainedHeight });
    }, 300);
  };

  const handleFileMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredFile(null);
  };

  // Helper for Indian Currency Formatting in Input
  const formatInputCurrency = (val: number | string) => {
    if (val === undefined || val === null || val === '') return '';
    const num = val.toString().replace(/,/g, '');
    if (isNaN(Number(num))) return '';
    return new Intl.NumberFormat('en-IN').format(Number(num));
  };

  const parseInputCurrency = (val: string) => {
    const num = val.replace(/,/g, '');
    if (num === '') return undefined;
    return Number(num) || 0;
  };

  // Auto-calculation for Expected Value
  useEffect(() => {
    const value = (formData.orderValue || 0) * ((formData.conversionProbability || 0) / 100);
    setFormData(prev => ({ ...prev, expectedValue: value }));
  }, [formData.orderValue, formData.conversionProbability]);

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
    const errors: string[] = [];
    if (!newAction.text.trim()) errors.push('text');
    if (!newAction.date) errors.push('date');

    if (errors.length > 0) {
      // CRITICAL: Execute native DOM APIs (focus/showPicker) synchronously 
      // BEFORE React state updates to satisfy browser User Gesture requirements.
      if (errors.includes('text')) {
        actionTextRef.current?.focus();
      } else if (errors.includes('date')) {
        const dateInput = actionDateRef.current;
        if (dateInput) {
          dateInput.focus();
          // Modern browsers require showPicker() to be called in the same synchronous 
          // execution thread as the user gesture.
          if ('showPicker' in dateInput) {
            try {
              (dateInput as any).showPicker();
            } catch (e) {
              console.warn('Failed to open date picker programmatically:', e);
            }
          }
        }
      }

      // Update React state AFTER triggering the native picker
      setActionValidationErrors(errors);
      return;
    }
    
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
    setActionValidationErrors([]);
    
    // Focus back to the text input for the next item
    actionTextRef.current?.focus();
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

  const removeFile = (fileUrl: string) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files?.filter(f => f !== fileUrl)
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
      <div className="px-2 min-[height:801px]:px-4 py-1 min-[height:801px]:py-2 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
              {enquiry ? enquiry.id : `Create New Enquiry: ${formData.id}`}
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
            
            {/* Role Avatars */}
            {(formData.revenueRoles?.length > 0 || formData.supplyRoles?.length > 0) && (
              <div className="hidden sm:flex items-center gap-2 border-l border-gray-300 pl-3 shrink-0">
                {formData.revenueRoles?.length > 0 && (
                  <div className="flex gap-1" title="Revenue Roles">
                    {formData.revenueRoles.map(uid => {
                      const user = MOCK_USERS.find(u => u.id === uid);
                      return user ? (
                        <div 
                          key={uid}
                          className="w-5 h-5 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center justify-center text-[9px] font-bold z-10 relative"
                          title={user.name}
                        >
                          {getInitials(user.name)}
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
                {formData.supplyRoles?.length > 0 && (
                  <div className="flex gap-1" title="Supply Roles">
                    {formData.supplyRoles.map(uid => {
                      const user = MOCK_USERS.find(u => u.id === uid);
                      return user ? (
                        <div 
                          key={uid}
                          className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center text-[9px] font-bold z-10 relative"
                          title={user.name}
                        >
                          {getInitials(user.name)}
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
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
              onClick={handleManualSave}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded flex items-center gap-1.5 transition-colors"
            >
              <Save size={14} /> SAVE
            </button>
            <button 
              onClick={handleCloseRequest}
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
          <div className="@container overflow-y-auto p-1.5 min-[height:801px]:p-3 border-r border-gray-100 no-scrollbar bg-white">
            <div className="flex flex-col gap-1 min-[height:801px]:gap-2">
              
              {/* Customer Name + Toggle */}
              <div className="space-y-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Customer *</label>
                  {enquiry && (
                    <button 
                      onClick={() => setIsCustomerExpanded(!isCustomerExpanded)}
                      className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                      title={isCustomerExpanded ? "Collapse Details" : "Expand Details"}
                    >
                      {isCustomerExpanded ? <ChevronUp size={10} className="text-gray-500" /> : <ChevronDown size={10} className="text-gray-500" />}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input 
                    list="customers"
                    className={`w-full px-2 py-1 bg-white border ${validationErrors.includes('customerName') ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded text-[11px] font-semibold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none`}
                    value={formData.customerName}
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                  />
                  <datalist id="customers">
                    {MOCK_CUSTOMERS.map(c => <option key={c.id} value={c.name} />)}
                  </datalist>
                </div>
              </div>

              {/* Collapsible Customer Details */}
              <AnimatePresence initial={false}>
                {(!enquiry || isCustomerExpanded) && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className={`grid gap-1.5 pb-2 ${!enquiry ? 'grid-cols-2 @[500px]:grid-cols-3' : 'grid-cols-1 @[500px]:grid-cols-2'}`}>
                      {enquiry ? (
                        <>
                          <div className="space-y-0 col-span-2">
                            <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">POC *</label>
                            <input 
                              className={`w-full px-2 py-1 bg-white border ${validationErrors.includes('poc') ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded text-[11px] outline-none`}
                              value={formData.poc}
                              onChange={(e) => setFormData({...formData, poc: e.target.value})}
                            />
                          </div>
                          <div className="space-y-0">
                            <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">City *</label>
                            <input 
                              className={`w-full px-2 py-1 bg-white border ${validationErrors.includes('city') ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded text-[11px] outline-none`}
                              value={formData.city}
                              onChange={(e) => setFormData({...formData, city: e.target.value})}
                            />
                          </div>
                          <div className="space-y-0">
                            <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Contact *</label>
                            <input 
                              className={`w-full px-2 py-1 bg-white border ${validationErrors.includes('contact') ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded text-[11px] outline-none`}
                              value={formData.contact}
                              onChange={(e) => setFormData({...formData, contact: e.target.value})}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-0">
                            <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">City *</label>
                            <input 
                              className={`w-full px-2 py-1 bg-white border ${validationErrors.includes('city') ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded text-[11px] outline-none`}
                              value={formData.city}
                              onChange={(e) => setFormData({...formData, city: e.target.value})}
                            />
                          </div>
                          <div className="space-y-0">
                            <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">POC *</label>
                            <input 
                              className={`w-full px-2 py-1 bg-white border ${validationErrors.includes('poc') ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded text-[11px] outline-none`}
                              value={formData.poc}
                              onChange={(e) => setFormData({...formData, poc: e.target.value})}
                            />
                          </div>
                          <div className="space-y-0">
                            <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Contact *</label>
                            <input 
                              className={`w-full px-2 py-1 bg-white border ${validationErrors.includes('contact') ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded text-[11px] outline-none`}
                              value={formData.contact}
                              onChange={(e) => setFormData({...formData, contact: e.target.value})}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lead Overview */}
              <div className="space-y-0">
                <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Lead Overview *</label>
                <textarea 
                  ref={overviewRef}
                  rows={1}
                  className={`w-full px-2 py-1 bg-white border ${validationErrors.includes('leadOverview') ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 resize-none max-h-[80px]`}
                  value={formData.leadOverview}
                  onChange={(e) => setFormData({...formData, leadOverview: e.target.value})}
                  placeholder="Brief overview of the lead..."
                />
              </div>

              {/* Lead Details */}
              <div className="space-y-0">
                <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Lead Details</label>
                <textarea 
                  ref={detailsRef}
                  rows={1}
                  className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-[11px] outline-none focus:ring-1 focus:ring-emerald-500 resize-none max-h-[80px]"
                  value={formData.leadDetails}
                  onChange={(e) => setFormData({...formData, leadDetails: e.target.value})}
                  placeholder="Detailed requirements, specifications, etc..."
                />
              </div>

              {/* Type, Lead Date, Channel */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="space-y-0">
                  <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Type *</label>
                  <div className={`flex bg-white border ${validationErrors.includes('type') ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded p-0.5`}>
                    {(['MTO', 'Ready'] as EnquiryType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({...formData, type: t})}
                        className={`flex-1 py-1 px-1 tracking-tight text-[10px] font-bold rounded transition-all ${
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
                <div className="space-y-0">
                  <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Lead Date</label>
                  <input 
                    type="date"
                    className="w-full px-1 py-1 tracking-tight bg-white border border-gray-200 rounded text-[10px] outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                    value={formData.leadDate}
                    onChange={(e) => {
                      setFormData({...formData, leadDate: e.target.value});
                      e.target.blur();
                    }}
                  />
                </div>
                <div className="space-y-0">
                  <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Channel</label>
                  <select 
                    className="w-full px-1 py-1 tracking-tight bg-white border border-gray-200 rounded text-[11px] outline-none"
                    value={formData.leadChannel || ''}
                    onChange={(e) => setFormData({...formData, leadChannel: e.target.value as LeadChannel})}
                  >
                    <option value="">Select...</option>
                    {['Direct', 'Website', 'WhatsApp', 'LinkedIn', 'Event', 'Others'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Micro-Dropzone: Files & Attachments */}
              <div className="space-y-1 mt-1">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  onChange={handleFileChange} 
                />
                
                {/* Horizontal File Previews (Only visible if files exist) */}
                {formData.files && formData.files.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {formData.files.map((file, idx) => {
                      const fileInfo = getFileTypeInfo(file);
                      const fileName = fileInfo.isImage ? `Image ${idx + 1}` : (fileInfo.isPdf ? `Document ${idx + 1}.pdf` : `File ${idx + 1}`);
                      
                      return (
                        <div 
                          key={idx} 
                          className="relative group bg-gray-50 rounded border border-gray-100 overflow-hidden w-16 h-16 shrink-0 flex flex-col cursor-pointer"
                          onMouseEnter={(e) => handleFileMouseEnter(e, file, fileName)}
                          onMouseLeave={handleFileMouseLeave}
                          onClick={() => setLightboxFile({ file, fileName, ...fileInfo })}
                        >
                          {fileInfo.isImage ? (
                            <img 
                              src={file} 
                              alt={fileName} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex-1 flex items-center justify-center bg-gray-100">
                              <FileText size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-0.5 bg-white/90 backdrop-blur-sm border-t border-gray-100">
                            <p className="text-[6px] font-bold text-gray-600 truncate text-center">{fileName}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Compact CTA */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border border-dashed border-gray-300 rounded py-1.5 px-3 flex items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors cursor-pointer bg-gray-50/50"
                >
                  <Paperclip size={12} className="text-gray-500" />
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Attach Files</span>
                </div>
              </div>

              {/* Commercials */}
              <div className="grid grid-cols-3 gap-1.5 mt-1">
                <div className="space-y-0">
                  <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Order Value (₹)</label>
                  <input 
                    type="text"
                    className="w-full px-1 py-1 tracking-tight bg-white border border-gray-200 rounded text-[11px] font-bold outline-none focus:border-emerald-500"
                    value={formatInputCurrency(formData.orderValue)}
                    onChange={(e) => setFormData({...formData, orderValue: parseInputCurrency(e.target.value)})}
                  />
                </div>
                <div className="space-y-0">
                  <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Prob (%)</label>
                  <select 
                    className="w-full px-1 py-1 tracking-tight bg-white border border-gray-200 rounded text-[11px] outline-none"
                    value={formData.conversionProbability || ''}
                    onChange={(e) => setFormData({...formData, conversionProbability: e.target.value ? Number(e.target.value) : undefined})}
                  >
                    <option value="">Select...</option>
                    {[10, 30, 50, 70, 90].map(p => <option key={p} value={p}>{p}%</option>)}
                  </select>
                </div>
                <div className="space-y-0">
                  <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Expected Value</label>
                  <div className="w-full px-1 py-1 tracking-tight bg-gray-50 border border-gray-200 text-gray-800 rounded text-[11px] font-bold">
                    {formatIndianCurrency(formData.expectedValue || 0)}
                  </div>
                </div>
              </div>

              {/* Roles */}
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                <div className="space-y-0">
                  <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Revenue Role *</label>
                  <UserSelector 
                    users={MOCK_USERS.filter(u => u.role === 'revenue' || u.role === 'admin')}
                    selectedUsers={formData.revenueRoles || []}
                    onToggle={(userId) => {
                      const current = formData.revenueRoles || [];
                      if (current.includes(userId)) {
                        setFormData({...formData, revenueRoles: current.filter(id => id !== userId)});
                      } else {
                        setFormData({...formData, revenueRoles: [...current, userId]});
                      }
                    }}
                  >
                    <div className={`flex flex-wrap items-center gap-1 p-1 bg-white border ${validationErrors.includes('revenueRoles') ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded min-h-[28px] hover:border-emerald-400 transition-colors`}>
                      {formData.revenueRoles?.map(uid => {
                        const user = MOCK_USERS.find(u => u.id === uid);
                        return (
                          <div 
                            key={uid} 
                            className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-[9px] font-bold border border-gray-200"
                            title={user?.name}
                          >
                            {user ? getInitials(user.name) : '??'}
                          </div>
                        );
                      })}
                      <div className="p-0.5 text-gray-400 hover:text-emerald-600">
                        <UserPlus size={12} />
                      </div>
                    </div>
                  </UserSelector>
                </div>
                <div className="space-y-0">
                  <label className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Supply Role</label>
                  <UserSelector 
                    users={MOCK_USERS.filter(u => u.role === 'supply' || u.role === 'admin')}
                    selectedUsers={formData.supplyRoles || []}
                    onToggle={(userId) => {
                      const current = formData.supplyRoles || [];
                      if (current.includes(userId)) {
                        setFormData({...formData, supplyRoles: current.filter(id => id !== userId)});
                      } else {
                        setFormData({...formData, supplyRoles: [...current, userId]});
                      }
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-1 p-1 bg-white border border-gray-200 rounded min-h-[28px] hover:border-blue-400 transition-colors">
                      {formData.supplyRoles?.map(uid => {
                        const user = MOCK_USERS.find(u => u.id === uid);
                        return (
                          <div 
                            key={uid} 
                            className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-[9px] font-bold border border-gray-200"
                            title={user?.name}
                          >
                            {user ? getInitials(user.name) : '??'}
                          </div>
                        );
                      })}
                      <div className="p-0.5 text-gray-400 hover:text-blue-600">
                        <UserPlus size={12} />
                      </div>
                    </div>
                  </UserSelector>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Action Items (Pinned/Sticky) */}
          <div className="flex flex-col bg-gray-50/50 overflow-hidden border-l border-gray-100">
            {/* Unified Task Creation */}
            <div className="p-1.5 min-[height:801px]:p-3 border-b border-gray-200 bg-white shadow-sm">
              <div className="space-y-2">
                {/* Action Item Textarea - Always full width */}
                <div className="space-y-1">
                  <label className="text-[10px] min-[resolution:1.5dppx]:text-[8px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Action Item *</label>
                  <textarea 
                    ref={actionTextRef}
                    rows={1}
                    placeholder="What needs to be done?"
                    className={`w-full bg-gray-50 border rounded px-2 py-1.5 text-[11px] font-bold outline-none resize-none transition-colors max-h-[120px] overflow-y-auto ${
                      actionValidationErrors.includes('text') 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200'
                    } ${
                      newAction.type === 'revenue' ? 'focus:border-red-400' : 'focus:border-blue-400'
                    }`}
                    value={newAction.text}
                    onChange={(e) => {
                      setNewAction({...newAction, text: e.target.value});
                      if (actionValidationErrors.includes('text')) {
                        setActionValidationErrors(prev => prev.filter(err => err !== 'text'));
                      }
                      e.target.style.height = 'auto';
                      e.target.style.height = (e.target.scrollHeight + 2) + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        addActionItem(newAction.type);
                      }
                    }}
                  />
                </div>

                {/* Secondary Controls - Responsive Layout */}
                {!enquiry ? (
                  <div className="space-y-2">
                    {/* Row 2: Remark field */}
                    <div className="space-y-1">
                      <label className="text-[10px] min-[resolution:1.5dppx]:text-[8px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Remark (Optional)</label>
                      <textarea 
                        rows={1}
                        placeholder="Additional notes..."
                        className={`w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] outline-none italic resize-none transition-colors h-[28px] min-h-[28px] max-h-[80px] overflow-y-auto ${
                          newAction.type === 'revenue' ? 'focus:border-red-400' : 'focus:border-blue-400'
                        }`}
                        value={newAction.remark}
                        onChange={(e) => {
                          setNewAction({...newAction, remark: e.target.value});
                          e.target.style.height = 'auto';
                          e.target.style.height = (e.target.scrollHeight + 2) + 'px';
                        }}
                      />
                    </div>
                    {/* Row 3: Type, Due Date, Submit CTA */}
                    <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-end">
                      {/* Type Pill Toggle */}
                      <div className="space-y-1">
                        <label className="text-[10px] min-[resolution:1.5dppx]:text-[8px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Type *</label>
                        <div className="flex bg-gray-100 p-0.5 rounded border border-gray-200 h-[28px]">
                          <button 
                            onClick={() => setNewAction({...newAction, type: 'revenue'})}
                            className={`px-2 text-[9px] font-bold rounded transition-all ${
                              newAction.type === 'revenue' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            REV
                          </button>
                          <button 
                            onClick={() => setNewAction({...newAction, type: 'supply'})}
                            className={`px-2 text-[9px] font-bold rounded transition-all ${
                              newAction.type === 'supply' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            SUP
                          </button>
                        </div>
                      </div>

                      {/* Due Date */}
                      <div className="space-y-1">
                        <label className="text-[10px] min-[resolution:1.5dppx]:text-[8px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Due Date *</label>
                        <input 
                          ref={actionDateRef}
                          type="date"
                          className={`w-full bg-gray-50 border rounded px-2 py-1 text-[10px] outline-none transition-colors h-[28px] ${
                            actionValidationErrors.includes('date')
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200'
                          } ${
                            newAction.type === 'revenue' ? 'focus:border-red-400' : 'focus:border-blue-400'
                          }`}
                          value={newAction.date}
                          onChange={(e) => {
                            setNewAction({...newAction, date: e.target.value});
                            if (actionValidationErrors.includes('date')) {
                              setActionValidationErrors(prev => prev.filter(err => err !== 'date'));
                            }
                            e.target.blur();
                          }}
                        />
                      </div>

                      {/* Compact Icon-only Submit Button */}
                      <div className="space-y-1">
                        <label className="text-[10px] min-[resolution:1.5dppx]:text-[8px] font-bold text-transparent uppercase select-none">Action</label>
                        <button 
                          onClick={() => addActionItem(newAction.type)}
                          title="Create Task"
                          className={`w-full h-[28px] px-3 rounded text-white transition-colors flex items-center justify-center font-bold shadow-sm ${
                            newAction.type === 'revenue' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                        >
                          <CornerDownLeft size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`grid grid-cols-[auto_auto_1fr_auto] gap-2 items-start`}>
                    {/* Type Pill Toggle */}
                    <div className="space-y-1">
                      <label className="text-[10px] min-[resolution:1.5dppx]:text-[8px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Type *</label>
                      <div className="flex bg-gray-100 p-0.5 rounded border border-gray-200 h-[28px]">
                        <button 
                          onClick={() => setNewAction({...newAction, type: 'revenue'})}
                          className={`px-2 text-[9px] font-bold rounded transition-all ${
                            newAction.type === 'revenue' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          REV
                        </button>
                        <button 
                          onClick={() => setNewAction({...newAction, type: 'supply'})}
                          className={`px-2 text-[9px] font-bold rounded transition-all ${
                            newAction.type === 'supply' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          SUP
                        </button>
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-1">
                      <label className="text-[10px] min-[resolution:1.5dppx]:text-[8px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Due Date *</label>
                      <input 
                        ref={actionDateRef}
                        type="date"
                        className={`w-full bg-gray-50 border rounded px-2 py-1 text-[10px] outline-none transition-colors h-[28px] ${
                          actionValidationErrors.includes('date')
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200'
                        } ${
                          newAction.type === 'revenue' ? 'focus:border-red-400' : 'focus:border-blue-400'
                        }`}
                        value={newAction.date}
                        onChange={(e) => {
                          setNewAction({...newAction, date: e.target.value});
                          if (actionValidationErrors.includes('date')) {
                            setActionValidationErrors(prev => prev.filter(err => err !== 'date'));
                          }
                          e.target.blur();
                        }}
                      />
                    </div>

                    {/* Remark - Maximized in Wide View */}
                    <div className="space-y-1">
                      <label className="text-[10px] min-[resolution:1.5dppx]:text-[8px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase">Remark (Optional)</label>
                      <textarea 
                        rows={1}
                        placeholder="Additional notes..."
                        className={`w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] outline-none italic resize-none transition-colors h-[28px] min-h-[28px] max-h-[80px] overflow-y-auto ${
                          newAction.type === 'revenue' ? 'focus:border-red-400' : 'focus:border-blue-400'
                        }`}
                        value={newAction.remark}
                        onChange={(e) => {
                          setNewAction({...newAction, remark: e.target.value});
                          e.target.style.height = 'auto';
                          e.target.style.height = (e.target.scrollHeight + 2) + 'px';
                        }}
                      />
                    </div>

                    {/* Compact Icon-only Submit Button */}
                    <div className="space-y-1">
                      <label className="text-[10px] min-[resolution:1.5dppx]:text-[8px] font-bold text-transparent uppercase select-none">Action</label>
                      <button 
                        onClick={() => addActionItem(newAction.type)}
                        title="Create Task"
                        className={`w-full h-[28px] px-3 rounded text-white transition-colors flex items-center justify-center font-bold shadow-sm ${
                          newAction.type === 'revenue' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        <CornerDownLeft size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Side-by-Side Lists */}
            <div className={`flex-1 grid ${!enquiry ? 'grid-cols-1' : 'grid-cols-2'} overflow-hidden transition-all duration-500`}>
              {/* Revenue Column */}
              <div className={`flex flex-col ${enquiry ? 'border-r' : 'border-b'} border-gray-200 overflow-hidden`}>
                <div className="px-3 py-1.5 bg-red-50/50 border-b border-red-100 flex items-center gap-2 shrink-0">
                  <CheckCircle2 size={12} className="text-red-500" />
                  <h3 className="text-[9px] font-bold text-red-700 uppercase tracking-wider">Revenue Actions</h3>
                  <span className="ml-auto text-[9px] font-bold text-red-400 bg-white px-1.5 py-0.5 rounded-full border border-red-100">
                    {formData.revenueActions?.filter(a => !a.isCompleted).length} Active
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-1 min-[height:801px]:p-2 space-y-1 min-[height:801px]:space-y-1.5 no-scrollbar">
                  {[...(formData.revenueActions || [])]
                    .sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1))
                    .map(item => (
                      <div key={item.id} className={`flex items-start gap-1.5 p-1.5 rounded border transition-all ${item.isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200 shadow-sm hover:border-red-200'}`}>
                        <button onClick={() => toggleActionCompletion(item.id, 'revenue')} className="shrink-0 min-w-[24px] min-h-[24px] flex items-center justify-center rounded hover:bg-gray-100">
                          {item.isCompleted ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Circle size={14} className="text-gray-300 hover:text-emerald-400" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="relative">
                            {/* Floated Due Date */}
                            <input 
                              type="date"
                              className={`float-right ml-2 mb-1 bg-transparent border-none outline-none p-0 cursor-pointer text-[9px] font-bold [&::-webkit-calendar-picker-indicator]:hidden ${item.isCompleted ? 'text-gray-400 pointer-events-none' : 'text-red-500 hover:underline'}`}
                              value={item.dueDate}
                              disabled={item.isCompleted}
                              onClick={(e) => {
                                try {
                                  if ('showPicker' in e.currentTarget) {
                                    e.currentTarget.showPicker();
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                              onChange={(e) => {
                                updateActionItem(item.id, 'revenue', 'dueDate', e.target.value);
                              }}
                            />

                            {/* Action Text */}
                            {editingAction?.id === item.id && editingAction.field === 'action' && !item.isCompleted ? (
                              <textarea 
                                autoFocus
                                rows={1}
                                className="w-full bg-gray-50 border border-red-200 rounded px-1 py-0.5 text-[11px] font-bold outline-none resize-none"
                                value={item.action}
                                onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                                onChange={(e) => {
                                  updateActionItem(item.id, 'revenue', 'action', e.target.value);
                                  e.target.style.height = 'auto';
                                  e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                                onBlur={() => setEditingAction(null)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && setEditingAction(null)}
                              />
                            ) : (
                              <p 
                                onClick={() => !item.isCompleted && setEditingAction({ id: item.id, field: 'action' })}
                                className={`text-[11px] font-bold break-words leading-tight ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-800 cursor-text hover:text-red-600'}`}
                              >
                                {item.action}
                              </p>
                            )}
                            
                            {/* Clear float before remark */}
                            <div className="clear-both"></div>
                          </div>
                          
                          {/* Remark */}
                          {editingAction?.id === item.id && editingAction.field === 'remark' && !item.isCompleted ? (
                            <textarea 
                              autoFocus
                              rows={1}
                              placeholder="Add remark..."
                              className="w-full mt-1 bg-gray-50 border border-red-200 rounded px-1 py-0.5 text-[10px] italic outline-none resize-none block"
                              value={item.remark}
                              onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                              onChange={(e) => {
                                updateActionItem(item.id, 'revenue', 'remark', e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                              onBlur={() => setEditingAction(null)}
                              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && setEditingAction(null)}
                            />
                          ) : (
                            <p 
                              onClick={() => !item.isCompleted && setEditingAction({ id: item.id, field: 'remark' })}
                              className={`text-[10px] mt-0.5 italic leading-tight block ${item.isCompleted ? 'text-gray-400' : 'text-gray-500 cursor-text hover:text-gray-700'}`}
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
                <div className="px-3 py-1.5 bg-blue-50/50 border-b border-blue-100 flex items-center gap-2 shrink-0">
                  <Truck size={12} className="text-blue-500" />
                  <h3 className="text-[9px] font-bold text-blue-700 uppercase tracking-wider">Supply Actions</h3>
                  <span className="ml-auto text-[9px] font-bold text-blue-400 bg-white px-1.5 py-0.5 rounded-full border border-blue-100">
                    {formData.supplyActions?.filter(a => !a.isCompleted).length} Active
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-1 min-[height:801px]:p-2 space-y-1 min-[height:801px]:space-y-1.5 no-scrollbar">
                  {[...(formData.supplyActions || [])]
                    .sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1))
                    .map(item => (
                      <div key={item.id} className={`flex items-start gap-1.5 p-1.5 rounded border transition-all ${item.isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200 shadow-sm hover:border-blue-200'}`}>
                        <button onClick={() => toggleActionCompletion(item.id, 'supply')} className="shrink-0 min-w-[24px] min-h-[24px] flex items-center justify-center rounded hover:bg-gray-100">
                          {item.isCompleted ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Circle size={14} className="text-gray-300 hover:text-emerald-400" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="relative">
                            {/* Floated Due Date */}
                            <input 
                              type="date"
                              className={`float-right ml-2 mb-1 bg-transparent border-none outline-none p-0 cursor-pointer text-[9px] font-bold [&::-webkit-calendar-picker-indicator]:hidden ${item.isCompleted ? 'text-gray-400 pointer-events-none' : 'text-blue-500 hover:underline'}`}
                              value={item.dueDate}
                              disabled={item.isCompleted}
                              onClick={(e) => {
                                try {
                                  if ('showPicker' in e.currentTarget) {
                                    e.currentTarget.showPicker();
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                              onChange={(e) => {
                                updateActionItem(item.id, 'supply', 'dueDate', e.target.value);
                              }}
                            />

                            {/* Action Text */}
                            {editingAction?.id === item.id && editingAction.field === 'action' && !item.isCompleted ? (
                              <textarea 
                                autoFocus
                                rows={1}
                                className="w-full bg-gray-50 border border-blue-200 rounded px-1 py-0.5 text-[11px] font-bold outline-none resize-none"
                                value={item.action}
                                onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                                onChange={(e) => {
                                  updateActionItem(item.id, 'supply', 'action', e.target.value);
                                  e.target.style.height = 'auto';
                                  e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                                onBlur={() => setEditingAction(null)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && setEditingAction(null)}
                              />
                            ) : (
                              <p 
                                onClick={() => !item.isCompleted && setEditingAction({ id: item.id, field: 'action' })}
                                className={`text-[11px] font-bold break-words leading-tight ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-800 cursor-text hover:text-blue-600'}`}
                              >
                                {item.action}
                              </p>
                            )}
                            
                            {/* Clear float before remark */}
                            <div className="clear-both"></div>
                          </div>
                          
                          {/* Remark */}
                          {editingAction?.id === item.id && editingAction.field === 'remark' && !item.isCompleted ? (
                            <textarea 
                              autoFocus
                              rows={1}
                              placeholder="Add remark..."
                              className="w-full mt-1 bg-gray-50 border border-blue-200 rounded px-1 py-0.5 text-[10px] italic outline-none resize-none block"
                              value={item.remark}
                              onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                              onChange={(e) => {
                                updateActionItem(item.id, 'supply', 'remark', e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                              onBlur={() => setEditingAction(null)}
                              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && setEditingAction(null)}
                            />
                          ) : (
                            <p 
                              onClick={() => !item.isCompleted && setEditingAction({ id: item.id, field: 'remark' })}
                              className={`text-[10px] mt-0.5 italic leading-tight block ${item.isCompleted ? 'text-gray-400' : 'text-gray-500 cursor-text hover:text-gray-700'}`}
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

        {/* Hover Popover */}
        <AnimatePresence>
          {hoveredFile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: hoveredFile.yOffset }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: hoveredFile.yOffset }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: hoveredFile.yOffset }}
              transition={{ duration: 0.15 }}
              className="fixed z-[70] pointer-events-none bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
              style={{
                left: hoveredFile.x,
                top: hoveredFile.y,
                width: '320px',
                height: 'auto',
                maxHeight: hoveredFile.constrainedHeight
              }}
            >
              {hoveredFile.isImage ? (
                <img 
                  src={hoveredFile.file} 
                  alt={hoveredFile.fileName} 
                  className="w-full h-auto object-contain bg-gray-50"
                  style={{ maxHeight: Math.max(0, hoveredFile.constrainedHeight - 40) }}
                  referrerPolicy="no-referrer"
                />
              ) : hoveredFile.isPdf ? (
                <div className="w-full bg-white flex items-center justify-center overflow-hidden" style={{ height: hoveredFile.constrainedHeight }}>
                  <Document
                    file={hoveredFile.file}
                    loading={<div className="text-gray-400 text-sm font-medium">Loading PDF...</div>}
                    error={<div className="text-red-400 text-sm font-medium">Failed to load PDF</div>}
                  >
                    <Page pageNumber={1} width={320} renderTextLayer={false} renderAnnotationLayer={false} />
                  </Document>
                </div>
              ) : (
                <div className="w-full p-6 flex flex-col items-center justify-center bg-gray-50 gap-4" style={{ height: hoveredFile.constrainedHeight }}>
                  {hoveredFile.isWord ? <FileText size={64} className="text-blue-500" /> :
                   hoveredFile.isExcel ? <FileSpreadsheet size={64} className="text-emerald-500" /> :
                   <File size={64} className="text-gray-400" />}
                  <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-gray-800">{hoveredFile.fileName}</p>
                    <p className="text-xs text-gray-500">{hoveredFile.displaySize}</p>
                  </div>
                  <div className="mt-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wide shadow-sm">
                    Click to open viewer
                  </div>
                </div>
              )}
              {hoveredFile.isImage && (
                <div className="p-2 bg-white border-t border-gray-100">
                  <p className="text-sm font-bold text-gray-700 truncate text-center">{hoveredFile.fileName}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click Lightbox */}
        <AnimatePresence>
          {lightboxFile && (
            <div 
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8"
              onClick={() => setLightboxFile(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative max-w-5xl w-full max-h-full flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-2 right-2 z-50 min-[height:801px]:-top-12 min-[height:801px]:right-0 flex items-center gap-2">
                  <button 
                    onClick={() => {
                      handleDownload(lightboxFile.file, lightboxFile.fileName);
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
                    title="Download"
                  >
                    <Download size={20} />
                  </button>
                  <button 
                    onClick={() => {
                      setShowDeleteConfirm(true);
                    }}
                    className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full text-white backdrop-blur-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button 
                    onClick={() => setLightboxFile(null)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors ml-2"
                    title="Close"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="bg-black rounded-lg overflow-hidden shadow-2xl w-full flex items-center justify-center max-h-[calc(100vh-60px)] min-[height:801px]:max-h-[calc(100vh-200px)]">
                  {lightboxFile.isImage ? (
                    <img 
                      src={lightboxFile.file} 
                      alt={lightboxFile.fileName} 
                      className="max-w-full max-h-[calc(100vh-60px)] min-[height:801px]:max-h-[calc(100vh-200px)] object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : lightboxFile.isPdf ? (
                    <div className="w-full h-[calc(100vh-60px)] min-[height:801px]:h-[calc(100vh-200px)] bg-gray-100 overflow-auto flex justify-center p-4">
                      <Document
                        file={lightboxFile.file}
                        loading={
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mr-3"></div>
                            Loading PDF...
                          </div>
                        }
                        error={
                          <div className="flex flex-col items-center justify-center h-full text-red-500">
                            <FileText size={48} className="mb-2" />
                            <p>Failed to load PDF.</p>
                            <button 
                              onClick={() => handleDownload(lightboxFile.file, lightboxFile.fileName)}
                              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                              Download Instead
                            </button>
                          </div>
                        }
                      >
                        <Page 
                          pageNumber={1} 
                          renderTextLayer={false} 
                          renderAnnotationLayer={false}
                          className="shadow-xl"
                          width={Math.min(window.innerWidth * 0.8, 800)}
                        />
                      </Document>
                    </div>
                  ) : (
                    <div className="w-full h-[400px] flex flex-col items-center justify-center bg-gray-900 text-gray-400 gap-4">
                      {lightboxFile.isWord ? <FileText size={64} className="text-blue-500" /> :
                       lightboxFile.isExcel ? <FileSpreadsheet size={64} className="text-emerald-500" /> :
                       <File size={64} className="text-gray-600" />}
                      <p className="text-sm font-medium">Live preview unavailable for this format.</p>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = lightboxFile.file;
                          link.download = lightboxFile.fileName;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm font-bold transition-colors flex items-center gap-2 mt-2 shadow-lg"
                      >
                        <Download size={16} />
                        Download to View
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="absolute -bottom-8 left-0 right-0 text-center">
                  <p className="text-white font-medium text-sm drop-shadow-md">{lightboxFile.fileName}</p>
                </div>
              </motion.div>

              {/* Thumbnail Navigation Strip */}
              {formData.files && formData.files.length > 1 && (
                <div 
                  className="absolute bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none"
                >
                  <div className="flex gap-2 overflow-x-auto py-2 px-3 bg-black/60 backdrop-blur-md rounded-xl max-w-full no-scrollbar pointer-events-auto border border-white/10 shadow-2xl">
                    {formData.files.map((file, idx) => {
                      const fileInfo = getFileTypeInfo(file);
                      const fileName = fileInfo.isImage ? `Image ${idx + 1}` : (fileInfo.isPdf ? `Document ${idx + 1}.pdf` : `File ${idx + 1}`);
                      const isActive = lightboxFile.file === file;

                      return (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxFile({ file, fileName, ...fileInfo });
                          }}
                          className={`relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            isActive 
                              ? 'border-emerald-500 opacity-100 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                              : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'
                          }`}
                          title={fileName}
                        >
                          {fileInfo.isImage ? (
                            <img src={file} alt={fileName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                              {fileInfo.isPdf ? <FileText size={20} className="text-red-400" /> :
                               fileInfo.isWord ? <FileText size={20} className="text-blue-400" /> :
                               fileInfo.isExcel ? <FileSpreadsheet size={20} className="text-emerald-400" /> :
                               <File size={20} className="text-gray-400" />}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && lightboxFile && (
            <div 
              className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Delete File</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete <span className="font-semibold text-gray-700">{lightboxFile.fileName}</span>? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        removeFile(lightboxFile.file);
                        setShowDeleteConfirm(false);
                        setLightboxFile(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Validation Modal */}
        <AnimatePresence>
          {showValidationModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Missing Required Fields</h3>
                <div className="text-sm text-gray-500 mb-6">
                  <p className="mb-3">Please fill in all mandatory fields before saving or navigating:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {validationErrors.map(err => (
                      <span key={err} className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded border border-red-100 uppercase tracking-tight">
                        {err === 'revenueRoles' ? 'Revenue Role' : 
                         err === 'customerName' ? 'Customer Name' :
                         err === 'leadOverview' ? 'Lead Overview' :
                         err.charAt(0).toUpperCase() + err.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDiscardChanges}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={() => setShowValidationModal(false)}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    Fix Errors
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Auto-Save Error Modal */}
        <AnimatePresence>
          {showAutoSaveError && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Auto-save failed</h3>
                <p className="text-sm text-gray-500 mb-6">
                  You have unsaved changes. Would you like to try saving again or discard your changes?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDiscardChanges}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleRetrySave}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    Retry Save
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  );
}
