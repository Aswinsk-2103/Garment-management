import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import {
  BarChart3, Boxes, ClipboardList, Factory, FileOutput, LayoutDashboard, LogOut,
  PackageCheck, PanelLeft, ReceiptText, ShieldCheck, ShoppingCart, Users,
} from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
import { useLocation } from "wouter";

type BusinessRole = "admin" | "store_inventory" | "production" | "accounts";
type BusinessModule = "catalog" | "inventory" | "purchase_orders" | "sales_orders" | "production" | "delivery_challans" | "reports" | "team";

export type NavItem = { label: string; path: string; module?: BusinessModule; icon: typeof LayoutDashboard };

const navigation: NavItem[] = [
  { label: "Control room", path: "/", icon: LayoutDashboard },
  { label: "Garment catalog", path: "/catalog", module: "catalog", icon: PackageCheck },
  { label: "Inventory", path: "/inventory", module: "inventory", icon: Boxes },
  { label: "Purchase orders", path: "/purchase-orders", module: "purchase_orders", icon: ShoppingCart },
  { label: "Sales orders", path: "/sales-orders", module: "sales_orders", icon: ClipboardList },
  { label: "Production", path: "/production", module: "production", icon: Factory },
  { label: "Delivery challans", path: "/delivery-challans", module: "delivery_challans", icon: FileOutput },
  { label: "Reports", path: "/reports", module: "reports", icon: BarChart3 },
  { label: "Team access", path: "/team", module: "team", icon: Users },
];

const permissions: Record<BusinessModule, BusinessRole[]> = {
  catalog: ["admin", "store_inventory", "production"],
  inventory: ["admin", "store_inventory"],
  purchase_orders: ["admin", "store_inventory"],
  sales_orders: ["admin", "accounts"],
  production: ["admin", "production"],
  delivery_challans: ["admin", "store_inventory", "accounts"],
  reports: ["admin", "accounts"],
  team: ["admin"],
};

export function canAccess(role: BusinessRole | undefined, module?: BusinessModule) {
  return !module || (!!role && permissions[module].includes(role));
}

export function roleLabel(role?: string) {
  return ({ admin: "Administrator", store_inventory: "Store & Inventory", production: "Production", accounts: "Accounts" } as Record<string, string>)[role || ""] || "Restricted";
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const role = user?.role as BusinessRole | undefined;
  const visibleNavigation = useMemo(() => navigation.filter((item) => canAccess(role, item.module)), [role]);
  const activeItem = visibleNavigation.find((item) => item.path === location) || visibleNavigation[0];

  if (loading) return <div className="blueprint-loading"><span className="scan-line" />Loading secure workspace…</div>;
  if (!user) {
    return <div className="blueprint-loading"><ShieldCheck size={24} /> Secure sign-in required <Button onClick={startLogin}>Sign in</Button></div>;
  }

  return (
    <div className={`app-shell ${collapsed ? "is-collapsed" : ""}`}>
      <aside className="technical-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">KLG</div>
          {!collapsed && <div><strong>KLG GARMENTS</strong><span>OPERATIONS SYSTEM</span></div>}
          <button className="line-icon collapse-control" onClick={() => setCollapsed((value) => !value)} aria-label="Toggle navigation"><PanelLeft size={18} /></button>
        </div>
        <div className="system-stamp">SYSTEM / 01<br />ROLE / {roleLabel(role).toUpperCase()}</div>
        <nav className="technical-nav" aria-label="Business modules">
          {visibleNavigation.map((item, index) => {
            const Icon = item.icon;
            const active = item.path === location;
            return <button key={item.path} onClick={() => setLocation(item.path)} className={active ? "active" : ""} title={item.label}>
              <span className="nav-index">{String(index + 1).padStart(2, "0")}</span><Icon size={18} /><span className="nav-label">{item.label}</span><span className="nav-chevron">›</span>
            </button>;
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="identity-line"><Avatar><AvatarFallback>{(user.name || "K").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>{!collapsed && <div><strong>{user.name || "KLG user"}</strong><span>{roleLabel(role)}</span></div>}</div>
          <button className="signout-line" onClick={logout}><LogOut size={16} /><span className="nav-label">Sign out</span></button>
        </div>
      </aside>
      <section className="workspace">
        <header className="workspace-header"><div className="header-code">KLG / {activeItem?.label?.toUpperCase() || "WORKSPACE"}</div><div className="header-status"><span className="signal-dot" />SECURE SESSION <span className="divider-dot">/</span> {roleLabel(role).toUpperCase()}</div></header>
        <main>{children}</main>
      </section>
    </div>
  );
}
