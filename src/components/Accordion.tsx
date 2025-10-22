'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-2 border-gray-400 rounded-lg mb-3 overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 transition-colors"
      >
        <h3 className="font-bold text-lg text-white">{title}</h3>
        <ChevronDown
          size={20}
          className={`text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="border-t-2 border-gray-300 p-4 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}
