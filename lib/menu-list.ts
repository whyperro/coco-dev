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
  UserCheck2
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
          href: "/pasajeros",
          label: "Pasajeros",
          active: pathname.includes("/pasajeros"),
          icon: UserCheck2,
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
    menus: group.menus
      .filter(menu => {
        // General filtering for SELLER role
        if (role === "SELLER") {
          // Exclude specific menus for SELLER
          if (menu.label === "Dashboard" || menu.label === "Sucursales" || menu.label === "Usuarios") {
            return false;
          }
        }
        return true;
      })
      .map(menu => {
        // Filter "Pagados" and "Pendientes" from "Boletos" for SELLER role
        if (role === "SELLER" && menu.label === "Boletos") {
          return {
            ...menu,
            submenus: menu.submenus.filter(
              submenu => submenu.label !== "Pagados" && submenu.label !== "Pendientes"
            )
          };
        }
        return menu;
      })
  }));
}
