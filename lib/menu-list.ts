import {
  BookUser,
  ChartNoAxesCombined,
  LayoutGrid,
  LucideIcon,
  Map,
  Signature,
  Store,
  TicketsPlane,
  User,
  Users
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string, role: string): Group[] {
  // Menu definition
  const menuList: Group[] = [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname.includes("/dashboard"),
          icon: LayoutGrid,
          submenus: []
        },
        {
          href: "/estadisticas",
          label: "Estadisticas",
          active: pathname.includes("/estadisticas"),
          icon: ChartNoAxesCombined,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Administración",
      menus: [
        {
          href: "/proveedores",
          label: "Proveedores",
          active: pathname.includes("/proveedores"),
          icon: Signature,
          submenus: []
        },
        {
          href: "/clientes",
          label: "Clientes",
          active: pathname.includes("/clientes"),
          icon: BookUser,
          submenus: []
        },
        {
          href: "/boletos",
          label: "Boletos",
          active: pathname.includes("/boletos"),
          icon: TicketsPlane,
          submenus: [
            {
              href: "/boletos/registro_boleto",
              label: "Registro Boletos",
              active: pathname === "/boletos/registro_boleto"
            },
            {
              href: "/boletos/pagados",
              label: "Pagados",
              active: pathname === "/boletos/pagados"
            },
            {
              href: "/boletos/pendientes",
              label: "Pendientes",
              active: pathname === "/boletos/pendientes"
            }
          ]
        },
        {
          href: "",
          label: "Rutas",
          active: pathname.includes("/rutas"),
          icon: Map,
          submenus: [
            {
              href: "/rutas/nacionales",
              label: "Nacionales",
              active: pathname === "/rutas/nacionales"
            },
            {
              href: "/rutas/internacionales",
              label: "Internacionales",
              active: pathname === "/rutas/internacionales"
            }
          ]
        }
      ]
    },
    {
      groupLabel: "Configuración",
      menus: [
        {
          href: "/configuracion/sucursales",
          label: "Sucursales",
          active: pathname.includes("/configuracion/sucursales"),
          icon: Store,
          submenus: []
        },
        {
          href: "/configuracion/usuarios",
          label: "Usuarios",
          active: pathname.includes("/configuracion/usuarios"),
          icon: User,
          submenus: []
        }
      ]
    }
  ];

  // Filter logic based on user role
  return menuList.map(group => ({
    ...group,
    menus: group.menus.filter(menu => {
      if (role === "SELLER") {
        // Hide "Dashboard" and "Sucursales" for SELLER role
        return menu.label !== "Dashboard" && menu.label !== "Sucursales" && menu.label !== "Sucursales" && menu.label !== "Usuarios";
      }
      return true; // No filtering for other roles
    }),
  }));
}
