'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/',         icon: '🏠', label: 'Inicio' },
  { href: '/vehiculos', icon: '🚗', label: 'Vehículos' },
];

export function BottomNav() {
  const path = usePathname();

  return (
    <nav
      className="bg-white border-t border-gray-100 px-4 pt-2 pb-3 flex-shrink-0"
      style={{ boxShadow: '0 -1px 0 rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-around">
        {ITEMS.map((item) => {
          const active = item.href === '/' ? path === '/' : path.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div
                className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all duration-150 ${
                  active ? 'bg-blue-50' : ''
                }`}
              >
                <span className={`text-2xl transition-transform duration-150 ${active ? 'scale-110' : 'scale-100'}`}>
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] font-semibold transition-colors duration-150 ${
                    active ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
                {active && <span className="w-1 h-1 bg-blue-600 rounded-full" />}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
