import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BuildingOffice2Icon,
  BusIcon,
  UserGroupIcon,
  UserIcon,
  MapIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Tableau de bord', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Établissements', href: '/admin/establishments', icon: BuildingOffice2Icon },
  { name: 'Bus', href: '/admin/buses', icon: BusIcon },
  { name: 'Chauffeurs', href: '/admin/drivers', icon: UserIcon },
  { name: 'Élèves', href: '/admin/students', icon: UserGroupIcon },
  { name: 'Trajets', href: '/admin/routes', icon: MapIcon },
  { name: 'Présence', href: '/admin/attendance', icon: ClipboardDocumentCheckIcon },
  { name: 'Incidents', href: '/admin/incidents', icon: ExclamationTriangleIcon },
  { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
  { name: 'Statistiques', href: '/admin/statistics', icon: ChartBarIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Wasslni Admin</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-6 w-6 flex-shrink-0 ${
                  isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-500'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 