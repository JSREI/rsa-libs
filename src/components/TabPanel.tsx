import React, { useState } from 'react';

interface TabProps {
  label: string;
  id: string;
  children: React.ReactNode;
  active?: boolean;
}

const Tab: React.FC<TabProps> = ({ label, id, children, active }) => {
  return (
    <div
      id={id}
      role="tabpanel"
      className={`${
        active ? 'block' : 'hidden'
      } p-4 bg-white rounded-lg border-t-0 border-gray-200`}
      aria-labelledby={`${id}-tab`}
    >
      {children}
    </div>
  );
};

interface TabButtonProps {
  label: string;
  id: string;
  active: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, id, active, onClick }) => {
  return (
    <button
      id={`${id}-tab`}
      className={`inline-block p-4 rounded-t-lg border-b-2 ${
        active
          ? 'text-blue-600 border-blue-600'
          : 'border-transparent hover:text-gray-600 hover:border-gray-300'
      }`}
      role="tab"
      aria-controls={id}
      aria-selected={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

interface TabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  defaultTab?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab }) => {
  const defaultTabId = defaultTab || (tabs.length > 0 ? tabs[0].id : '');
  const [activeTab, setActiveTab] = useState<string>(defaultTabId);

  return (
    <div>
      <div className="border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px" role="tablist">
          {tabs.map((tab) => (
            <li className="mr-2" key={tab.id} role="presentation">
              <TabButton
                id={tab.id}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.id}
            label={tab.label}
            active={activeTab === tab.id}
          >
            {tab.content}
          </Tab>
        ))}
      </div>
    </div>
  );
};

export default Tabs; 