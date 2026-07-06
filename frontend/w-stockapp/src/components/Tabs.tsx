import React, { useEffect, useRef, useState } from "react";

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (key: string) => void;
  extraContent?: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  extraContent,
}) => {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const activeElement = tabRefs.current[activeTab];
    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
        opacity: 1
      });
    }
  }, [activeTab, tabs]);

  return (
    <div className="flex flex-col h-full w-full bg-white relative">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 pt-2 bg-slate-50/50">
        <div
          role="tablist"
          aria-label="Pestañas de navegación"
          className="flex space-x-6 relative"
        >
          {/* Animated Indicator */}
          <div
            className="absolute bottom-0 h-0.5 bg-empresa-primario rounded-t-full shadow-[0_-2px_10px_rgba(var(--color-primario-rgb),0.4)] transition-all duration-300 ease-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity,
              backgroundColor: 'var(--color-primario)'
            }}
            aria-hidden="true"
          />

          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                type="button"
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.key}`}
                id={`tab-${tab.key}`}
                ref={(el) => {
                  tabRefs.current[tab.key] = el;
                }}
                onClick={() => onChange(tab.key)}
                className={`
                  group relative flex items-center gap-2 py-4 text-sm font-semibold transition-all duration-300 outline-none
                  focus-visible:ring-2 focus-visible:ring-empresa-primario focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50
                  ${isActive
                    ? "text-empresa-primario"
                    : "text-slate-500 hover:text-slate-800"}
                `}
                style={{ color: isActive ? 'var(--color-primario)' : '' }}
              >
                {tab.icon && (
                  <span 
                    className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100 text-slate-400 group-hover:text-slate-600 group-hover:scale-110'}`}
                    style={{ color: isActive ? 'var(--color-primario)' : '' }}
                  >
                    {tab.icon}
                  </span>
                )}
                <span className="tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {extraContent && (
          <div className="pb-2">
            {extraContent}
          </div>
        )}
      </div>

      {tabs.some((tab) => tab.content) && (
        <div className="flex-1 overflow-visible flex flex-col h-full bg-white relative">
          {tabs.map((tab) => (
            <div
              key={tab.key}
              role="tabpanel"
              id={`panel-${tab.key}`}
              aria-labelledby={`tab-${tab.key}`}
              tabIndex={0}
              className={`flex-1 flex flex-col h-full outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 tab-content ${
                activeTab === tab.key ? "block" : "hidden"
              }`}
            >
              {tab.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tabs;
