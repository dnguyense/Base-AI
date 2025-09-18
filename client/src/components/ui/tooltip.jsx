import React, { useState } from 'react';

const TooltipProvider = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

const Tooltip = ({ children }) => {
  return <div className="relative inline-block">{children}</div>;
};

const TooltipTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={`inline-flex items-center justify-center ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
});

const TooltipContent = React.forwardRef(({ className, sideOffset = 4, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`z-50 overflow-hidden rounded-md border bg-gray-900 px-3 py-1.5 text-xs text-gray-50 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 ${className || ''}`}
      style={{ 
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: `${sideOffset}px`
      }}
      {...props}
    >
      {children}
    </div>
  );
});

TooltipProvider.displayName = 'TooltipProvider';
Tooltip.displayName = 'Tooltip';
TooltipTrigger.displayName = 'TooltipTrigger';
TooltipContent.displayName = 'TooltipContent';

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };