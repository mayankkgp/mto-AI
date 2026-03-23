/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Layout from './components/Layout';
import EnquiryList from './components/EnquiryList';
import EnquiryDetail from './components/EnquiryDetail';
import { Enquiry } from './types';
import { MOCK_ENQUIRIES } from './mockData';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [activeSection, setActiveSection] = useState('enquiry');
  const [enquiries, setEnquiries] = useState<Enquiry[]>(MOCK_ENQUIRIES);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleCreateNew = () => {
    setSelectedEnquiry(null);
    setIsDetailOpen(true);
  };

  const handleEnquiryClick = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsDetailOpen(true);
  };

  const handleSave = (enq: Enquiry) => {
    const exists = enquiries.find(e => e.id === enq.id);
    if (exists) {
      setEnquiries(enquiries.map(e => e.id === enq.id ? enq : e));
    } else {
      setEnquiries([enq, ...enquiries]);
    }
    setIsDetailOpen(false);
  };

  const handleConvert = (enq: Enquiry) => {
    // In a real app, this would also create an order
    const updatedEnq: Enquiry = {
      ...enq,
      status: 'Converted',
      orderId: `ORD-${enq.id.split('-')[1]}`
    };
    setEnquiries(enquiries.map(e => e.id === enq.id ? updatedEnq : e));
    setIsDetailOpen(false);
    alert(`Enquiry ${enq.id} converted to Order ${updatedEnq.orderId}`);
  };

  const handleDrop = (enq: Enquiry, reason: string) => {
    const updatedEnq: Enquiry = {
      ...enq,
      status: 'Dropped',
      dropReason: reason
    };
    setEnquiries(enquiries.map(e => e.id === enq.id ? updatedEnq : e));
    setIsDetailOpen(false);
  };

  return (
    <Layout activeSection={activeSection} onSectionChange={setActiveSection}>
      {activeSection === 'enquiry' ? (
        <EnquiryList 
          enquiries={enquiries} 
          onEnquiryClick={handleEnquiryClick}
          onCreateNew={handleCreateNew}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 italic text-sm">
          {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} module is under development.
        </div>
      )}

      <AnimatePresence>
        {isDetailOpen && (
          <EnquiryDetail 
            enquiry={selectedEnquiry}
            onClose={() => setIsDetailOpen(false)}
            onSave={handleSave}
            onConvert={handleConvert}
            onDrop={handleDrop}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
