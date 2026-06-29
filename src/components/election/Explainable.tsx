'use client';

import React, { ReactNode } from 'react';
import { useExplanation } from '@/context/ExplanationModalContext';
import { HelpCircle } from 'lucide-react';

interface ExplainableProps {
  termKey: string;
  children: ReactNode;
  className?: string;
  showIcon?: boolean;
  asSpan?: boolean;
  plain?: boolean;
}

export default function Explainable({
  termKey,
  children,
  className = '',
  showIcon = false,
  asSpan = true,
  plain = false,
}: ExplainableProps) {
  const { showExplanation } = useExplanation();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    showExplanation(termKey);
  };

  const Tag = asSpan ? 'span' : 'div';

  if (plain) {
    return (
      <Tag
        onClick={handleClick}
        className={`cursor-pointer transition-all duration-200 ${className}`}
        title="انقر للتفاصيل والمعادلة"
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      onClick={handleClick}
      className={`inline-flex items-center gap-1 cursor-pointer border-b border-dotted border-muted-foreground/50 hover:border-primary hover:text-primary dark:hover:text-blue-400 transition-all duration-200 ${className}`}
      title="انقر للتفاصيل والمعادلة"
    >
      {children}
      {showIcon && (
        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/75 shrink-0" />
      )}
    </Tag>
  );
}
