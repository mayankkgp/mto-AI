import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  ShoppingCart, 
  Users, 
  Truck, 
  Factory, 
  UserCircle, 
  ChevronLeft, 
  ChevronRight,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'enquiry', label: 'Enquiry', icon: FileText },
  { id: 'order', label: 'Order', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'factories', label: 'Factories', icon: Factory },
  { id: 'users', label: 'Users', icon: UserCircle },
  { id: 'account', label: 'My Account', icon: UserCircle },
];

export default function Layout({ children, activeSection, onSectionChange }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? '64px' : '200px' }}
        className="bg-[#151619] text-white flex flex-col border-r border-white/10 shrink-0"
      >
        <div className="p-2 min-[height:801px]:p-4 flex items-center justify-between border-b border-white/5 h-10 min-[height:801px]:h-14">
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg tracking-tight text-emerald-400"
            >
              FABRITO
            </motion.span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-1 min-[height:801px]:py-2 overflow-y-auto no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center px-4 py-1.5 min-[height:801px]:py-2.5 gap-3 transition-colors relative group ${
                  isActive ? 'text-emerald-400 bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-400' : ''} />
                {!isCollapsed && (
                  <span className="text-xs font-medium tracking-wide uppercase">
                    {item.label}
                  </span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-full bg-emerald-400"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-2 min-[height:801px]:p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">
              M
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate">Mayank</p>
                <p className="text-[10px] text-gray-500 truncate">Admin</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
