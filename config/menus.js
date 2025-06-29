import {
  Application,
  Chart,
  Components,
  DashBoard,
  Stacks2,
  Map,
  Grid,
  Files,
  Graph,
  ClipBoard,
  Cart,
  Envelope,
  Messages,
  Monitor,
  ListFill,
  Calendar,
  Flag,
  Book,
  Note,
  ClipBoard2,
  Note2,
  Note3,
  BarLeft,
  BarTop,
  ChartBar,
  PretentionChartLine,
  PretentionChartLine2,
  Google,
  Pointer,
  Map2,
  MenuBar,
  Icons,
  ChartArea,
  Building,
  Building2,
  Sheild,
  Error,
  Diamond,
  Heroicon,
  LucideIcon,
  CustomIcon,
  Mail,
  Bus,
  Users,
  Settings,
  Bell,
  MapPin,
  UserRound,
  UserRound2,
  UserRound3,
  UserRound4,
  UserRound5,
  School,
  Responsable,
  Route,
  Trip,
  Payment,
  Report,
  Role,
  Admin,
  Subscription,
} from "@/components/svg";

import { menuIcons } from "./menuIcons";  

export const menusConfig = {
  mainNav: [
    {
      title: "Dashboard",
      icon: "DashBoard",
      child: [
        {
          title: "Analytics",
          href: "/dashboard",
          icon: "Graph",
        },
        {
          title: "Ecommerce",
          href: "/ecommerce",
          icon: "Cart",
        },
        {
          title: "Project ",
          href: "/project",
          icon: "ClipBoard",
        },
      ],
    },
    {
      title: "Application",
      icon: "Application",
      child: [
        {
          title: "chat",
          icon: "Messages",
          href: "/chat",
        },
        {
          title: "email",
          icon: "Envelope",
          href: "/email",
        },
        {
          title: "kanban",
          icon: "Monitor",
          href: "/kanban",
        },
        {
          title: "task",
          icon: "ListFill",
          href: "/task",
        },
        {
          title: "calendar",
          icon: "Calendar",
          href: "/calendar",
        },
        {
          title: "project",
          icon: "ClipBoard",
          href: "/projects",
        },
      ],
    },
    {
      title: "Components",
      icon: "Components",
      child: [
        {
          title: "Base Ui",
          icon: "Flag",
          nested: [
            {
              title: "accordion",
              icon: "heroicons:information-circle",
              href: "/accordion",
            },
            {
              title: "alert",
              icon: "heroicons:information-circle",
              href: "/alert",
            },
            {
              title: "avatar",
              icon: "heroicons:information-circle",
              href: "/avatar",
            },
            {
              title: "badge",
              icon: "heroicons:cube",
              href: "/badge",
            },
            {
              title: "breadcrumb",
              icon: "heroicons:cube",
              href: "/breadcrumb",
            },
            {
              title: "Button",
              icon: "heroicons:cube",
              href: "/button",
            },
            {
              title: "Card",
              icon: "heroicons:cube",
              href: "/card",
            },
            {
              title: "carousel",
              icon: "heroicons:information-circle",
              href: "/carousel",
            },
            {
              title: "color",
              icon: "heroicons:information-circle",
              href: "/color",
            },
            {
              title: "combobox",
              icon: "heroicons:cube",
              href: "/combobox",
            },
            {
              title: "command",
              icon: "heroicons:cube",
              href: "/command",
            },
            {
              title: "Dropdown",
              icon: "heroicons:cube",
              href: "/dropdown",
            },
          ],
        },
        {
          title: "Advanced Ui",
          icon: "Book",
          nested: [
            {
              title: "affix",
              icon: "heroicons:cube",
              href: "/affix",
            },
            {
              title: "calendar",
              icon: "heroicons:cube",
              href: "/calendar-page",
            },
            {
              title: "steps",
              icon: "heroicons:information-circle",
              href: "/steps",
            },
            {
              title: "timeline",
              icon: "heroicons:cube",
              href: "/timeline",
            },
            {
              title: "tour",
              icon: "heroicons:cube",
              href: "/tour",
            },
            {
              title: "tree",
              icon: "heroicons:information-circle",
              href: "/tree",
            },
            {
              title: "watermark",
              icon: "heroicons:cube",
              href: "/watermark",
            },
          ],
        },
      ],
    },
    {
      title: "Forms",
      icon: "Stacks2",
      child: [
        {
          title: "Form Elements",
          icon: "Note",
          nested: [
            {
              title: "autocomplete",
              href: "/autocomplete",
            },
            {
              title: "checkbox",
              href: "/checkbox",
            },
            {
              title: "file uploader",
              href: "/file-uploader",
            },
            {
              title: "input",
              href: "/input",
            },
            {
              title: "input-group",
              href: "/input2",
            },
            {
              title: "input-mask",
              href: "/input-mask",
            },
            {
              title: "radio",
              href: "/radio",
            },
            {
              title: "Range Slider",
              href: "/slider",
            },
            {
              title: "rating",
              href: "/rating",
            },
            {
              title: "select",
              child: [
                {
                  title: "Select",
                  href: "/form-select",
                },
                {
                  title: "React Select",
                  href: "/react-select",
                },
              ],
            },
            {
              title: "switch",
              href: "/switch",
            },
            {
              title: "textarea",
              href: "/textarea",
            },
          ],
        },
        {
          title: "Form Layout",
          icon: "ClipBoard2",
          href: "/form-layout",
        },
      ],
    },
    {
      title: "Tables",
      icon: "Grid",
      child: [
        {
          title: "Simple Table",
          href: "/simple-table",
          icon: "BarLeft",
        },
        {
          title: "tailwindui table",
          href: "/tailwindui-table",
          icon: "BarLeft",
        },
        {
          title: "Data Table",
          href: "/data-table",
          icon: "BarTop",
        },
      ],
    },
    {
      title: "Diagram",
      icon: "Chart",
      child: [
        {
          title: "Overview",
          href: "/diagram-overview",
        },
        {
          title: "Organization Tree",
          href: "/organization-diagram",
        },
        {
          title: "Update Node",
          href: "/diagram-updating",
        },
        {
          title: "Add Node",
          href: "/diagram-add-node",
        },
        {
          title: "Horizontal Flow",
          href: "/horizontal-diagram",
        },
        {
          title: "Dagree Tree",
          href: "/diagram-dagree-tree",
        },
        {
          title: "Download Diagram",
          href: "/download-diagram",
        },
        {
          title: "With Minimap",
          href: "/diagram-with-minimap",
        },
        {
          title: "With Background",
          href: "/diagram-with-background",
        },
        {
          title: "Panel Position",
          href: "/diagram-panel-position",
        },
      ],
    },
    {
      title: "Chart",
      icon: "ChartArea",
      child: [
        {
          title: "Apex Chart",
          icon: "ChartBar",
          nested: [
            {
              title: "Line",
              href: "/charts-appex-line",
              icon: "heroicons:information-circle",
            },
            {
              title: "Area",
              href: "/charts-appex-area",
              icon: "heroicons:information-circle",
            },
            {
              title: "Column",
              href: "/charts-appex-column",
              icon: "heroicons:information-circle",
            },
            {
              title: "Bar",
              href: "/charts-appex-bar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Combo/Mixed",
              href: "/charts-appex-combo",
              icon: "heroicons:information-circle",
            },
            {
              title: "Range Area",
              href: "/charts-appex-range",
              icon: "heroicons:information-circle",
            },
            {
              title: "Timeline",
              href: "/charts-appex-timeline",
              icon: "heroicons:information-circle",
            },
            {
              title: "Funnel",
              href: "/charts-appex-funnel",
              icon: "heroicons:information-circle",
            },
            {
              title: "Candle Stick",
              href: "/charts-appex-candlestick",
              icon: "heroicons:information-circle",
            },
            {
              title: "Boxplot",
              href: "/charts-appex-boxplot",
              icon: "heroicons:information-circle",
            },
            {
              title: "Pie",
              href: "/charts-appex-pie",
              icon: "heroicons:information-circle",
            },
          ],
        },
        {
          title: "Re Chart",
          icon: "PretentionChartLine",
          nested: [
            {
              title: "Line",
              href: "/charts-rechart-line",
              icon: "heroicons:information-circle",
            },
            {
              title: "Area",
              href: "/charts-rechart-area",
              icon: "heroicons:information-circle",
            },
            {
              title: "Bar",
              href: "/charts-rechart-bar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scatter",
              href: "/charts-rechart-scatter",
              icon: "heroicons:information-circle",
            },
            {
              title: "Composed",
              href: "/charts-rechart-composed",
              icon: "heroicons:information-circle",
            },
            {
              title: "Pie",
              href: "/charts-rechart-pie",
              icon: "heroicons:information-circle",
            },
            {
              title: "Radar",
              href: "/charts-rechart-radar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Radial Bar",
              href: "/charts-rechart-radialbar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Tree Map",
              href: "/charts-rechart-treemap",
              icon: "heroicons:information-circle",
            },
          ],
        },
        {
          title: "chart js",
          icon: "PretentionChartLine2",
          nested: [
            {
              title: "Bar",
              href: "/charts-chartjs-bar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Line",
              href: "/charts-chartjs-line",
              icon: "heroicons:information-circle",
            },
            {
              title: "Area",
              href: "/charts-chartjs-area",
              icon: "heroicons:information-circle",
            },
            {
              title: "Other",
              href: "/charts-chartjs-other",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scales",
              href: "/charts-chartjs-scales",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scale Options",
              href: "/charts-chartjs-scaleoptions",
              icon: "heroicons:information-circle",
            },
            {
              title: "Legend",
              href: "/charts-chartjs-legend",
              icon: "heroicons:information-circle",
            },
            {
              title: "Title",
              href: "/charts-chartjs-title",
              icon: "heroicons:information-circle",
            },
            {
              title: "Tooltip",
              href: "/charts-chartjs-tooltip",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scriptable Options",
              href: "/charts-chartjs-scriptable",
              icon: "heroicons:information-circle",
            },
            {
              title: "Animations",
              href: "/charts-chartjs-animations",
              icon: "heroicons:information-circle",
            },
          ],
        },
        {
          title: "unovis",
          icon: "PretentionChartLine",
          nested: [
            {
              title: "Line",
              href: "/charts-unovis-line",
              icon: "heroicons:information-circle",
            },
            {
              title: "Bar",
              href: "/charts-unovis-bar",
              icon: "heroicons:information-circle",
            },
            {
              title: "Area",
              href: "/charts-unovis-area",
              icon: "heroicons:information-circle",
            },
            {
              title: "Scatter",
              href: "/charts-unovis-scatter",
              icon: "heroicons:information-circle",
            },
          ],
        },
      ],
    },
    {
      title: "Maps",
      icon: "Map",
      child: [
        {
          title: "Google",
          icon: "Google",
          href: "/maps-google",
        },
        {
          title: "Vector",
          icon: "Pointer",
          href: "/maps-vector",
        },
        {
          title: "React Leaflet",
          icon: "Map2",
          href: "/map-react-leaflet",
        },
        {
          title: "Unovis Map",
          icon: "Map",
          nested: [
            {
              title: "Leaflet Map",
              href: "/map-unovis-leaflet",
            },
            {
              title: "Leaflet Flow",
              href: "/map-unovis-flow",
            },
            {
              title: "Leaflet Advance",
              href: "/map-unovis-advance",
            },
          ],
        },
      ],
    },
    {
      title: "Icons",
      icon: "Icons",
      child: [
        {
          title: "Hero Icons",
          icon: "Heroicon",
          href: "/icons-iconify",
        },
        {
          title: "Lucide Icons",
          icon: "LucideIcon",
          href: "/icons-lucide",
        },
        {
          title: "Custom Icons",
          icon: "CustomIcon",
          href: "/icons-custom",
        },
      ],
    },
    {
      title: "Multi Level",
      icon: "MenuBar",
      child: [
        {
          title: "Level 1.1",
          icon: "Building",
          href: "#",
        },
        {
          title: "Level 2",
          icon: "Building2",
          nested: [
            {
              title: "Level-2.1",
              href: "#",
            },
            {
              title: "Level 2.2",
              href: "#",
            },
            {
              title: "Level 3",
              child: [
                {
                  title: "Level 3.1",
                  href: "#",
                },
                {
                  title: "Level 3.2",
                  href: "#",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  sidebarNav: {
    modern: [
      {
        title: "Dashboard",
        icon: "DashBoard",
        child: [
          {
            title: "Analytics",
            href: "/dashboard",
            icon: "Graph",
          },
          {
            title: "Ecommerce",
            href: "/ecommerce",
            icon: "Cart",
          },
          {
            title: "project ",
            href: "/project",
            icon: "ClipBoard",
          },
        ],
      },
      {
        title: "Application",
        icon: "Application",
        child: [
          {
            title: "chat",
            icon: "Messages",
            href: "/chat",
          },
          {
            title: "email",
            icon: "Envelope",
            href: "/email",
          },
          {
            title: "kanban",
            icon: "Monitor",
            href: "/kanban",
          },
          {
            title: "task",
            icon: "ListFill",
            href: "/task",
          },
          {
            title: "calendar",
            icon: "Calendar",
            href: "/calendar",
          },
          {
            title: "project",
            icon: "ClipBoard",
            nested: [
              {
                title: "project List",
                icon: "ClipBoard",
                href: "/projects",
              },
              {
                title: "project Details",
                icon: "ClipBoard",
                href: "/projects/1/overview",
              },
            ],
          },
        ],
      },
     
    ],
    classic: [
      {
        isHeader: true,
        title: "menu",
      },
      {
        title: "Dashboard",
        icon: "DashBoard",
        href: "/dashboard",
        isOpen: false,
        isHide: false,
        child: [
          {
            title: "Analytics",
            href: "/dashboard",
            icon: "Graph",
          },
          {
            title: "Ecommerce",
            href: "/ecommerce",
            icon: "Cart",
          },
          {
            title: "Project ",
            href: "/project",
            icon: "ClipBoard",
          },
        ],
      },
      {
        isHeader: true,
        title: "Application",
      },
      {
        title: "chat",
        icon: "Messages",
        href: "/chat",
      },
      {
        title: "email",
        icon: "Envelope",
        href: "/email",
      },
      {
        title: "kanban",
        icon: "Monitor",
        href: "/kanban",
      },
      {
        title: "task",
        icon: "ListFill",
        href: "/task",
      },
      {
        title: "calendar",
        icon: "Calendar",
        href: "/calendar",
      },
      {
        title: "project",
        icon: "ClipBoard",
        href: "/projects",
      },
    ],
  },
};

export const menuSuperAdminConfig = {
  mainNav: [
    {
      title: "Gestion École",
      icon: "School",
      child: [
        {
          title: "Écoles",
          icon: "School",
          href: "/super-admin/schools",
        },
        {
          title: "Établissements",
          icon: "Building",
          href: "/super-admin/etablissements",
        },
        {
          title: "Admins",
          icon: "Admin",
          href: "/super-admin/admins",
        },
        {
          title: "Responsables",
          icon: "Responsable",
          href: "/super-admin/responsables",
        },
      ],
    },
    {
      title: "Managment",
      icon: "Settings",
      child: [
        {
          title: "Bus",
          href: "/super-admin/buses",
          icon: "Bus2",
        },
        {
          title: "Étudiants",
          href: "/super-admin/students",
          icon: "User",
        },
        {
          title: "Parents",
          href: "/super-admin/parents",
          icon: "Users",
        },
        {
          title: "Chauffeurs",
          href: "/super-admin/drivers",
          icon: "SteeringWheel",
        },
      ],
    },
    {
      title: "Trajets",
      icon: "Route",
      child: [
        {
          title: "Routes",
          href: "/super-admin/routes",
          icon: "Map",
        },
        {
          title: "Trajets",
          href: "/super-admin/trips",
          icon: "Route",
        },
        {
          title: "Trajets Quotidiens",
          href: "/super-admin/daily-trips",
          icon: "Calendar",
        },
      ],
    },
    {
      title: "Paiements",
      href: "/super-admin/payments",
      icon: "CreditCard",
    },
    {
      title: "Profile",
      href: "/super-admin/profile",
      icon: "User",
    },
    {
      title: "Notifications",
      href: "/admin/notifications",
      icon: "Bell",
    },
    {
      title: "Rapports",
      href: "/super-admin/reports",
      icon: "BarChart",
    },
    {
      title: "Rôles & Permissions",
      icon: "ShieldCheck",
      child: [
        {
          title: "Rôles",
          href: "/super-admin/roles",
          icon: "UserCog",
        },
        {
          title: "Administrateurs",
          href: "/super-admin/admins",
          icon: "UserShield",
        },
        {
          title: "Abonnements",
          href: "/super-admin/subscriptions",
          icon: "Package",
        },
      ],
    },
  ],

  sidebarNav: {
    modern: [
      {
        title: "Dashboard",
        href: "/super-admin/",
        icon: "DashBoard",
      },
      {
        title: "École",
        icon: "School",
        child: [
          {
            title: "Écoles",
            href: "/super-admin/schools",
            icon: "School",
          },
          {
            title: "Établissements",
            href: "/super-admin/etablissements",
            icon: "Building",
          },
          {
            title: "Admins",
            href: "/super-admin/admins",
            icon: "UserShield",
          },
          {
            title: "Responsables",
            href: "/super-admin/responsables",
            icon: "Responsable",
          },
        ],
      },
      {
        title: "Managment",
        icon: "Managment",
        child: [
          {
            title: "Bus",
            href: "/super-admin/buses",
            icon: "Bus2",
          },
          {
            title: "Étudiants",
            href: "/super-admin/students",
            icon: "User",
          },
          {
            title: "Parents",
            href: "/super-admin/parents",
            icon: "Users",
          },
          {
            title: "Chauffeurs",
            href: "/super-admin/drivers",
            icon: "SteeringWheel",
          },
        ],
      },
      {
        title: "Trajets",
        icon: "MapPin",
        child: [
          {
            title: "Routes",
            href: "/super-admin/routes",
            icon: "Map",
          },
          {
            title: "Trajets",
            href: "/super-admin/trips",
            icon: "Route",
          },
          {
            title: "Trajets Quotidiens",
            href: "/super-admin/daily-trips",
            icon: "Calendar",
          },
        ],
      },
      {
        title: "Paiements",
        href: "/super-admin/payments",
        icon: "Payment",
      },
      {
        title: "Notifications",
        href: "/admin/notifications",
        icon: "Bell",
      },
      {
        title: "Rapports",
        href: "/super-admin/reports",
        icon: "PretentionChartLine",
      },
      {
        title: "Rôles & Permissions",
        icon: "ShieldCheck",
        child: [
          {
            title: "Rôles",
            href: "/super-admin/roles",
            icon: "UserCog",
          },
          {
            title: "Administrateurs",
            href: "/super-admin/admins",
            icon: "UserShield",
          },
          {
            title: "Abonnements",
            href: "/super-admin/subscriptions",
            icon: "Package",
          },
        ],
      },
      {
        title: "Profile",
        href: "/super-admin/profile",
        icon: "User",
      },
    ],
    classic: [
      {
        isHeader: true,
        title: "Menu",
      },
      {
        title: "Dashboard",
        icon: "DashBoard",
        href: "/super-admin/",
      },
      {
        isHeader: true,
        title: "École",
      },
      {
        title: "Écoles",
        icon: "School",
        href: "/super-admin/schools",
      },
      {
        title: "Établissements",
        icon: "Building",
        href: "/super-admin/etablissements",
      },
      {
        title: "Admins",
        icon: "UserShield",
        href: "/super-admin/admins",
      },
      {
        title: "Responsables",
        icon: "UserTie",
        href: "/super-admin/responsables",
      },
      {
        isHeader: true,
        title: "Managment",
      },
      {
        title: "Bus",
        icon: "Bus2",
        href: "/super-admin/buses",
      },
      {
        title: "Étudiants",
        icon: "User",
        href: "/super-admin/students",
      },
      {
        title: "Parents",
        icon: "Users",
        href: "/super-admin/parents",
      },
      {
        title: "Chauffeurs",
        icon: "SteeringWheel",
        href: "/super-admin/drivers",
      },
      {
        isHeader: true,
        title: "Trajets",
      },
      {
        title: "Routes",
        icon: "Map",
        href: "/super-admin/routes",
      },
      {
        title: "Trajets",
        icon: "Route",
        href: "/super-admin/trips",
      },
      {
        title: "Trajets Quotidiens",
        icon: "Calendar",
        href: "/super-admin/daily-trips",
      },
      {
        isHeader: true,
        title: "Autres",
      },
      {
        title: "Paiements",
        icon: "CreditCard",
        href: "/super-admin/payments",
      },
      {
        title: "Notifications",
        icon: "Bell",
        href: "/super-admin/notifications",
      },
      {
        title: "Rapports",
        icon: "BarChart",
        href: "/super-admin/reports",
      },
      {
        title: "Abonnements",
        icon: "Package",
        href: "/super-admin/subscriptions",
      },
      {
        title: "Rôles",
        icon: "UserCog",
        href: "/super-admin/roles",
      },
      {
        title: "Profile",
        href: "/super-admin/profile",
        icon: "User",
      },
    ]  
  },
};
export const menuAdminConfig = {
  mainNav: [
    {
      title: "Gestion École",
      icon: "School",
      child: [
        {
          title: "Écoles",
          icon: "School",
          href: "/admin/schools",
        },
        {
          title: "Établissements",
          icon: "Building",
          href: "/admin/etablissements",
        },
        {
          title: "Responsables",
          icon: "Responsable",
          href: "/admin/responsables",
        },
      ],
    },
    {
      title: "Managment",
      icon: "Settings",
      child: [
        {
          title: "Bus",
          href: "/admin/buses",
          icon: "Bus2",
        },
        {
          title: "Étudiants",
          href: "/admin/students",
          icon: "User",
        },
        {
          title: "Parents",
          href: "/admin/parents",
          icon: "Users",
        },
        {
          title: "Chauffeurs",
          href: "/admin/drivers",
          icon: "SteeringWheel",
        },
      ],
    },
    {
      title: "Trajets",
      icon: "Route",
      child: [
        {
          title: "Routes",
          href: "/admin/routes",
          icon: "Map",
        },
        {
          title: "Trajets",
          href: "/admin/trips",
          icon: "Route",
        },
        {
          title: "Trajets Quotidiens",
          href: "/admin/daily-trips",
          icon: "Calendar",
        },
      ],
    },
    {
      title: "Rapports",
      href: "/admin/reports",
      icon: "BarChart",
    },
    {
      title: "Notifications",
      icon: "Bell",
      href: "/admin/notifications",
    },
    {
      title: "Profile",
      icon: "Bell",
      href: "/admin/profile",
    },
    
  ],

  sidebarNav: {
    modern: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: "DashBoard",
      },
      {
        title: "École",
        icon: "School",
        child: [
          {
            title: "Établissements",
            href: "/admin/etablissements",
            icon: "Building",
          },
          {
            title: "Responsables",
            href: "/admin/responsables",
            icon: "Responsable",
          },
        ],
      },
      {
        title: "Managment",
        icon: "Managment",
        child: [
          {
            title: "Bus",
            href: "/admin/buses",
            icon: "Bus2",
          },
          {
            title: "Étudiants",
            href: "/admin/students",
            icon: "User",
          },
          {
            title: "Parents",
            href: "/admin/parents",
            icon: "Users",
          },
          {
            title: "Chauffeurs",
            href: "/admin/drivers",
            icon: "SteeringWheel",
          },
        ],
      },
      {
        title: "Trajets",
        icon: "MapPin",
        child: [
          {
            title: "Routes",
            href: "/admin/routes",
            icon: "Map",
          },
          {
            title: "Trajets",
            href: "/admin/trips",
            icon: "Route",
          },
          {
            title: "Trajets Quotidiens",
            href: "/admin/daily-trips",
            icon: "Calendar",
          },
        ],
      },
      {
        title: "Rapports",
        href: "/admin/reports",
        icon: "PretentionChartLine",
      },
      {
        title: "Notifications",
        icon: "Bell",
        href: "/admin/notifications",
      },
      {
        title: "Profile",
        icon: "Bell",
        href: "/admin/profile",
      },
      
    ],
    classic: [
      {
        isHeader: true,
        title: "Menu",
      },
      {
        title: "Dashboard",
        icon: "DashBoard",
        href: "/admin/dashboard",
      },
      {
        isHeader: true,
        title: "École",
      },
      {
        title: "Écoles",
        icon: "School",
        href: "/admin/schools",
      },
      {
        title: "Établissements",
        icon: "Building",
        href: "/admin/etablissements",
      },

      {
        title: "Responsables",
        icon: "UserTie",
        href: "/admin/responsables",
      },
      {
        isHeader: true,
        title: "Managment",
      },
      {
        title: "Bus",
        icon: "Bus2",
        href: "/admin/buses",
      },
      {
        title: "Étudiants",
        icon: "User",
        href: "/admin/students",
      },
      {
        title: "Parents",
        icon: "Users",
        href: "/admin/parents",
      },
      {
        title: "Chauffeurs",
        icon: "SteeringWheel",
        href: "/admin/drivers",
      },
      {
        isHeader: true,
        title: "Trajets",
      },
      {
        title: "Routes",
        icon: "Map",
        href: "/admin/routes",
      },
      {
        title: "Trajets",
        icon: "Route",
        href: "/admin/trips",
      },
      {
        title: "Trajets Quotidiens",
        icon: "Calendar",
        href: "/admin/daily-trips",
      },
      {
        isHeader: true,
        title: "Autres",
      },
      {
        title: "Rapports",
        icon: "BarChart",
        href: "/admin/reports",
      },
      {
        title: "Profile",
        icon: "Bell",
        href: "/admin/profile",
      },
    ]  
  },
};

export const menuParentConfig = {
  mainNav: [
    {
      title: "Tableau de Bord",
      icon: "DashBoard",  
      href: "/parent/",
    },
    {
      title: "Mes Enfants",  
      icon: "Users",
      child: [
        {
          title: "Vue d'ensemble",
          href: "/parent/children-overview",  
          icon: "User",
        },
        {
          title: "Suivi du Bus",  
          href: "/parent/bus-tracking",  
          icon: "MapPin",
        },
        {
          title: "Historique Présence",
          href: "/parent/attendance-history",  
          icon: "Calendar",
        },
      ],
    },
    {
      title: "Notifications",
      icon: "Bell", 
      href: "/parent/notifications",  
    },
    {
      title: "Signaler une Préoccupation",
      icon: "ChatBubbleLeftRight",  
      href: "/parent/report-concern", 
    },
    {
      title: "Mon Profil",
      icon: "User",  
      href: "/parent/profile", 
    },
    {
      title: "Aide & Support",
      icon: "Monitor",  
      href: "/parent/help", 
    },
  ],

  // Vous pouvez définir une section sidebarNav 'modern' ou 'classic' comme pour le SuperAdmin
  sidebarNav: {
    modern: [
      {
        title: "Tableau de Bord",
        href: "/parent/",
        icon: "DashBoard",
      },
      {
        title: "Mes Enfants", // This category now contains overview and tracking
        icon: "Users",
        child: [
          {
            title: "Vue d'ensemble",
            href: "/parent/children-overview",  
            icon: "User",
          },
          {
            title: "Suivi du Bus",  
            href: "/parent/bus-tracking",  
            icon: "MapPin",
          },
          {
            title: "Historique Présence",
            href: "/parent/attendance-history",  
            icon: "Calendar",
          },
        ],
      },
      {
        title: "Notifications",
        href: "/parent/notifications",
        icon: "Bell",
      },
      {
        title: "Mon Profil",
        href: "/parent/profile",
        icon: "User",
      },
      {
        title: "Aide",
        href: "/parent/help",
        icon: "Monitor",
      },
      {
        title: "Signaler",
        href: "/parent/report-concern",
        icon: "ChatBubbleLeftRight",
      },
    ],
    // Vous pouvez également définir une version 'classic' si nécessaire, comme ceci:
    classic: [
      {
        isHeader: true,
        title: "MENU PRINCIPAL",
      },
      {
        title: "Tableau de Bord",
        icon: "DashBoard",
        href: "/parent/",
      },
      {
        isHeader: true,
        title: "MES ENFANTS",
      },
      {
        title: "Vue d'ensemble Enfants",
        icon: "Users",
        href: "/parent/children-overview",
      },
      {
        title: "Historique de Présence",
        icon: "Calendar",
        href: "/parent/attendance-history",
      },
      {
        title: "Suivi du Bus",
        icon: "MapPin",
        href: "/parent/bus-tracking", 
      },
      {
        isHeader: true,
        title: "SERVICES",
      },
     
      {
        title: "Notifications",
        icon: "Bell",
        href: "/parent/notifications",
      },
      {
        isHeader: true,
        title: "MON COMPTE",
      },
      {
        title: "Mon Profil",
        icon: "User",
        href: "/parent/profile",
      },
      {
        title: "Signaler une Préoccupation",
        icon: "ChatBubbleLeftRight",
        href: "/parent/report-concern",
      },
      {
        title: "Aide & Support",
        icon: "Monitor",
        href: "/parent/help",
      },
    ],
  },
};
export const menuDriverConfig = {
  mainNav: [
    {
      title: "Tableau de Bord",
      icon: "DashBoard",
      href: "/driver/",
    },
    {
      title: "Mes Trajets", // Grouping driver-specific trip management
      icon: "Bus2", // Using a more relevant icon for bus trips
      child: [
        {
          title: "Trajet du Jour",
          href: "/driver/daily-trips",
          icon: "Calendar",
        },
        {
          title: "Historique des Trajets",
          href: "/driver/trip-history",
          icon: "Application",
        },
      ],
    },
    {
      title: "Notifications",
      icon: "Bell",
      href: "/driver/notifications", // Ensure this points to driver's notifications
    },
    {
      title: "Mon Profil",
      icon: "UserCircle",
      href: "/driver/profile", // Ensure this points to driver's profile
    },
    {
      title: "Aide & Support",
      icon: "Monitor",
      href: "/driver/help",  
    },
  ],

  sidebarNav: {
    modern: [
      {
        title: "Tableau de Bord",
        href: "/driver/",
        icon: "DashBoard",
      },
      {
        title: "Mes Trajets",
        icon: "Bus2",
        child: [
          {
            title: "Trajet du Jour",
            href: "/driver/daily-trips",
            icon: "Calendar",
          },
          {
            title: "Historique des Trajets",
            href: "/driver/trip-history",
            icon: "Application",
          },
        ],
      },
      {
        title: "Notifications",
        href: "/driver/notifications",
        icon: "Bell",
      },
      {
        title: "Mon Profil",
        href: "/driver/profile",
        icon: "User",
      },
      {
        title: "Aide", // Shorter title for modern sidebar if preferred
        href: "/driver/help",
        icon: "Monitor",
      },
    ],
    classic: [
      {
        isHeader: true,
        title: "MENU PRINCIPAL",
      },
      {
        title: "Tableau de Bord",
        icon: "DashBoard",
        href: "/driver/",
      },
      {
        isHeader: true,
        title: "MES TRAJETS", 
      },
      {
        title: "Trajet du Jour",
        icon: "Calendar",
        href: "/driver/daily-trips",
      },
      {
        title: "Historique des Trajets",
        icon: "Application",
        href: "/driver/trip-history",
      },
      {
        isHeader: true,
        title: "SERVICES",
      },
      {
        title: "Notifications",
        icon: "Bell",
        href: "/driver/notifications",
      },
      {
        isHeader: true,
        title: "MON COMPTE",
      },
      {
        title: "Mon Profil",
        icon: "User",
        href: "/driver/profile",
      },
      {
        title: "Aide & Support", // Full title for classic sidebar
        icon: "Monitor",
        href: "/driver/help",
      },
    ],
  },
};
export const menuManagerConfig = {
  mainNav: [
    {
      title: "Tableau de Bord",
      icon: "DashBoard",
      href: "/manager/",
    },
    {
      title: "Profil",
      icon: "User",
      href: "/manager/profile",
    },
    {
      title: "Gestion Utilisateurs",
      icon: "Users",
      child: [
        {
          title: "Chauffeurs",
          href: "/manager/drivers",
          icon: "SteeringWheel",
        },
        {
          title: "Étudiants",
          href: "/manager/students",
          icon: "User",
        },
        {
          title: "Parents",
          href: "/manager/parents",
          icon: "Users",
        },
      ],
    },
    {
      title: "Gestion Bus & Trajets",
      icon: "Bus2",
      child: [
        {
          title: "Bus",
          href: "/manager/buses",
          icon: "Bus2",
        },
        {
          title: "Trajets (Plans)",
          href: "/manager/trips",
          icon: "Route",
        },
        {
          title: "Trajets Quotidiens",
          href: "/manager/daily-trips",
          icon: "Calendar",
        },
        {
          title: "Routes",
          icon: "Map",
          href: "/manager/routes",
        },
        {
          title: "Arrêts",
          href: "/manager/stops",
          icon: "Flag",
        },
      ],
    },
    {
      title: "Suivi & Rapports",
      icon: "PretentionChartLine",
      child: [
        {
          title: "Présence Élèves",
          href: "/manager/attendance",
          icon: "ListFill",
        },
        {
          title: "Suivi des Bus",
          href: "/manager/bus-tracking",
          icon: "Pointer",
        },
        {
          title: "Incidents & Alertes",
          href: "/manager/incidents-notifications",
          icon: "Error",
        },
        {
          title: "Notifications",
          href: "/manager/notifications",
          icon: "Bell",
        },
        {
          title: "Statistiques",
          href: "/manager/reports-statistics",
          icon: "Graph",
        },
      ],
    },
  ],

  sidebarNav: {
    modern: [
      {
        title: "Tableau de Bord",
        href: "/manager/",
        icon: "DashBoard",
      },
      {
        title: "Gestion Utilisateurs",
        icon: "Users",
        child: [
          {
            title: "Chauffeurs",
            href: "/manager/drivers",
            icon: "SteeringWheel",
          },
          {
            title: "Étudiants",
            href: "/manager/students",
            icon: "User",
          },
          {
            title: "Parents",
            href: "/manager/parents",
            icon: "Users",
          },
        ],
      },
      {
        title: "Bus & Trajets",
        icon: "Bus2",
        child: [
          {
            title: "Bus",
            href: "/manager/buses",
            icon: "Bus2",
          },
          {
            title: "Trajets (Plans)",
            href: "/manager/trips",
            icon: "Route",
          },
          {
            title: "Trajets Quotidiens",
            href: "/manager/daily-trips",
            icon: "Calendar",
          },
          {
            title: "Routes",
            icon: "Map",
            href: "/manager/routes",
          },
          {
            title: "Arrêts",
            href: "/manager/stops",
            icon: "Flag",
          },
        ],
      },
      {
        title: "Suivi & Rapports",
        icon: "PretentionChartLine",
        child: [
          {
            title: "Présence Élèves",
            href: "/manager/attendance",
            icon: "ListFill",
          },
          {
            title: "Suivi des Bus",
            href: "/manager/bus-tracking",
            icon: "Pointer",
          },
          {
            title: "Incidents & Alertes",
            href: "/manager/incidents-notifications",
            icon: "Error",
          },
          {
            title: "Notifications",
            href: "/manager/notifications",
            icon: "Bell",
          },
          {
            title: "Statistiques",
            href: "/manager/reports-statistics",
            icon: "Graph",
          },
        ],
      },
      {
        title: "Profil",
        href: "/manager/profile",
        icon: "User",
      },
    ],

    classic: [
      {
        isHeader: true,
        title: "MENU PRINCIPAL",
      },
      {
        title: "Tableau de Bord",
        icon: "DashBoard",
        href: "/manager/",
      },
      {
        title: "Profil",
        icon: "User",
        href: "/profile",
      },
      {
        isHeader: true,
        title: "GESTION UTILISATEURS",
      },
      {
        title: "Chauffeurs",
        icon: "SteeringWheel",
        href: "/manager/drivers",
      },
      {
        title: "Étudiants",
        icon: "User",
        href: "/manager/students",
      },
      {
        title: "Parents",
        icon: "Users",
        href: "/manager/parents",
      },
      {
        isHeader: true,
        title: "BUS & TRAJETS",
      },
      {
        title: "Bus",
        icon: "Bus2",
        href: "/manager/buses",
      },
      {
        title: "Trajets (Plans)",
        icon: "Route",
        href: "/manager/trips",
      },
      {
        title: "Trajets Quotidiens",
        icon: "Calendar",
        href: "/manager/daily-trips",
      },
      {
        title: "Routes",
        icon: "Map",
        href: "/manger/routes",
      },
      {
        title: "Arrêts",
        icon: "Flag",
        href: "/manager/stops",
      },
      {
        isHeader: true,
        title: "SUIVI & RAPPORTS",
      },
      {
        title: "Présence Élèves",
        icon: "ListFill",
        href: "/manager/attendance",
      },
      {
        title: "Suivi des Bus",
        icon: "Pointer",
        href: "/manager/bus-tracking",
      },
      {
        title: "Incidents & Alertes",
        icon: "Error",
        href: "/manager/incidents-notifications",
      },
      {
        title: "Notifications",
        icon: "Bell",
        href: "/manager/notifications",
      },
      {
        title: "Statistiques",
        icon: "BarChart",
        href: "/manager/reports-statistics",
      },
    ],
  },
};


/* export const menuAdminConfig = {
  mainNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: menuIcons.DashBoard
    }
  ],
  sidebarNav: {
    modern: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: menuIcons.DashBoard
      },
      {
        title: "Managment",
        icon: menuIcons.Settings,
        child: [
          {
            title: "Bus",
            href: "/admin/buses",
            icon: menuIcons.Bus
          },
          {
            title: "Etudiants",
            href: "/admin/student",
            icon: menuIcons.Student
          },
          {
            title: "Parents",
            href: "/admin/parents",
            icon: menuIcons.Parent
          },
          {
            title: "Chauffeurs",
            href: "/admin/driver",
            icon: menuIcons.Driver
          }
        ]
      },
      {
        title: "Trajets",
        icon: menuIcons.Route,
        child: [
          {
            title: "Routes",
            href: "/admin/routes",
            icon: menuIcons.Route
          },
          {
            title: "Trajets",
            href: "/admin/trips",
            icon: menuIcons.Trip
          },
          {
            title: "Trajets quotidiens",
            href: "/admin/DailyTrip",
            icon: menuIcons.Trip
          }
        ]
      },
      {
        title: "Paiements",
        href: "/admin/payments",
        icon: menuIcons.Payment
      },
      {
        title: "Rapports",
        href: "/admin/reports",
        icon: menuIcons.Report
      }
    ],
    classic: []
  }
}; */


