import React, { useState } from 'react';

interface NavItemProps {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface NavBarProps {
  items: NavItemProps[];
  defaultItem?: string;
}

const NavBar: React.FC<NavBarProps> = ({ items, defaultItem }) => {
  const defaultNavId = defaultItem || (items.length > 0 ? items[0].id : '');
  const [activeItem, setActiveItem] = useState<string>(defaultNavId);

  return (
    <div>
      <nav className="bg-white shadow-md">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-800">RSA 工具</span>
            </div>
            <div className="md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {items.map((item) => (
                  <button
                    key={item.id}
                    className={`px-5 py-2 rounded-md text-sm font-medium ${
                      activeItem === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setActiveItem(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="pt-6">
        {items.map((item) => (
          <div
            key={item.id}
            className={`${activeItem === item.id ? 'block' : 'hidden'}`}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavBar; 