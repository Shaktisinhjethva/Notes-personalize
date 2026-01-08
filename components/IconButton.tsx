
import React from 'react';

interface IconButtonProps {
  icon: React.ReactNode;
  // Fix: Changed onClick type to accept MouseEvent for event control like stopPropagation
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  title?: string;
  className?: string;
  active?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, onClick, title, className = '', active }) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center
        ${active 
          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
          : 'hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400'} 
        ${className}`}
    >
      {icon}
    </button>
  );
};
