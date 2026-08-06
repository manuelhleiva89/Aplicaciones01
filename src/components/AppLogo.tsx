import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'text-[#005bbf]',
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7 rounded-xl', text: 'text-lg', icon: 'w-7 h-7' },
    md: { box: 'w-9 h-9 rounded-2xl', text: 'text-2xl', icon: 'w-9 h-9' },
    lg: { box: 'w-12 h-12 rounded-2xl', text: 'text-3xl', icon: 'w-12 h-12' },
    xl: { box: 'w-16 h-16 rounded-3xl', text: 'text-4xl', icon: 'w-16 h-16' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`relative flex items-center justify-center shrink-0 shadow-md ${currentSize.box}`}>
        <img
          src="/icon.svg"
          alt="Gestión Financiera Icon"
          className="w-full h-full object-contain rounded-inherit"
        />
      </div>
      {showText && (
        <span className={`font-extrabold tracking-tight ${currentSize.text} ${textColor}`}>
          Gestión Financiera
        </span>
      )}
    </div>
  );
};
