/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Layout from './components/Layout';
import EnquiryList from './components/EnquiryList';
import EnquiryDetail from './components/EnquiryDetail';
import { Enquiry } from './types';
import { MOCK_ENQUIRIES } from './mockData';

export default function App() {
  const [activeSection, setActiveSection] = useState('enquiry');
  const [enquiries, setEnquiries] = useState<Enquiry[]>(MOCK_ENQUIRIES);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const getNextEnquiryId = () => {
    const ids = enquiries.map(e => {
      const match = e.id.match(/ENQ-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxId = Math.max(0, ...ids);
    return `ENQ-${(maxId + 1).toString().padStart(3, '0')}`;
  };

  const handleCreateNew = () => {
    setSelectedEnquiry(null);
    setIsDetailOpen(true);
  };

  const handleEnquiryClick = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsDetailOpen(true);
  };

  const handleSave = async (enq: Enquiry) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setEnquiries(prev => {
          const exists = prev.find(e => e.id === enq.id);
          if (exists) {
            return prev.map(e => e.id === enq.id ? enq : e);
          } else {
            return [enq, ...prev];
          }
        });
        setSelectedEnquiry(prev => prev?.id === enq.id ? enq : prev);
        resolve();
      }, 300);
    });
  };

  const handleConvert = (enq: Enquiry) => {
    // In a real app, this would also create an order
    const updatedEnq: Enquiry = {
      ...enq,
      status: 'Converted',
      orderId: `ORD-${enq.id.split('-')[1]}`
    };
    setEnquiries(enquiries.map(e => e.id === enq.id ? updatedEnq : e));
    setSelectedEnquiry(updatedEnq);
    // alert(`Enquiry ${enq.id} converted to Order ${updatedEnq.orderId}`);
  };

  const handleDrop = (enq: Enquiry, reason: string) => {
    const updatedEnq: Enquiry = {
      ...enq,
      status: 'Dropped',
      dropReason: reason
    };
    setEnquiries(enquiries.map(e => e.id === enq.id ? updatedEnq : e));
    setSelectedEnquiry(updatedEnq);
  };

  return (
    <Layout activeSection={activeSection} onSectionChange={setActiveSection}>
      {activeSection === 'enquiry' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Master View (List) */}
          <motion.div 
            layout
            initial={false}
            animate={{ width: isDetailOpen ? '35%' : '100%' }}
            className="h-full overflow-hidden flex flex-col"
          >
            <EnquiryList 
              enquiries={enquiries} 
              onEnquiryClick={handleEnquiryClick}
              onCreateNew={handleCreateNew}
              isCompact={isDetailOpen}
              activeEnquiryId={isDetailOpen ? selectedEnquiry?.id : null}
            />
          </motion.div>

          {/* Detail View (Pane) */}
          <AnimatePresence>
            {isDetailOpen && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '65%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="h-full overflow-hidden"
              >
                <EnquiryDetail 
                  enquiry={selectedEnquiry}
                  nextEnquiryId={getNextEnquiryId()}
                  onClose={() => setIsDetailOpen(false)}
                  onSave={handleSave}
                  onConvert={handleConvert}
                  onDrop={handleDrop}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 italic text-sm">
          {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} module is under development.
        </div>
      )}
    </Layout>
  );
}
