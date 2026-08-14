import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { COOKIE_NAME } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Boxes, Factory, FileOutput, Key, Receipt, ShieldCheck, UserCheck, Warehouse } from "lucide-react";
import { useState } from "react";
import KLGApp from "./KLGApp";

export default function Home() {
  const { user, loading, refresh } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"admin" | "store_inventory" | "production" | "accounts">("admin");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      if (data?.token) {
        try {
          sessionStorage.setItem("manus-cookie", `${COOKIE_NAME}=${data.token}`);
        } catch {}
      }
      await refresh();
    },
  });

  const handleLogin = (role?: "admin" | "store_inventory" | "production" | "accounts") => {
    const roleToUse = role || selectedRole;
    loginMutation.mutate({ role: roleToUse });
  };

  if (loading) return <div className="blueprint-loading"><span className="scan-line" />Initializing KLG secure system…</div>;
  if (user) return <KLGApp />;

  return (
    <div className="login-page">
      <div className="login-grid" />
      <header className="login-header">
        <div className="login-wordmark">
          <span>KLG</span>
          <div>
            <strong>KLG GARMENTS</strong>
            <small>APPAREL OPERATIONS SYSTEM</small>
          </div>
        </div>
        <div className="technical-version">SYSTEM 1.0 / SECURE ACCESS</div>
      </header>

      <main className="login-main">
        <section className="login-copy">
          <span className="eyebrow">OPERATIONS CONTROL / 2026</span>
          <h1>Precision<br /><em>in every</em><br />thread.</h1>
          <p>One controlled workspace for garment inventory, production batches, customer orders, and delivery documents.</p>
          <div className="module-strip">
            <div><Boxes size={18} /><span>Inventory</span></div>
            <div><Factory size={18} /><span>Production</span></div>
            <div><FileOutput size={18} /><span>Dispatch</span></div>
          </div>
        </section>

        <section className="login-card">
          <div className="card-corner top-left" />
          <div className="card-corner top-right" />
          <div className="card-corner bottom-left" />
          <div className="card-corner bottom-right" />

          <ShieldCheck size={30} />
          <span className="eyebrow">AUTHENTICATED ENTRY</span>
          <h2>Enter the control room.</h2>
          <p className="mb-3 text-sm text-slate-300">Select your business role for assigned module access:</p>

          <div className="role-selector flex flex-col gap-2 my-3 w-full">
            {[
              { id: "admin", label: "Administrator", desc: "Full Access (All Modules)", icon: Key },
              { id: "store_inventory", label: "Store & Inventory", desc: "Catalog, Inventory & POs", icon: Warehouse },
              { id: "production", label: "Production Supervisor", desc: "Batch Operations & Logging", icon: Factory },
              { id: "accounts", label: "Accounts Officer", desc: "Sales Orders & Delivery Challans", icon: Receipt },
            ].map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id as any)}
                  className={`flex items-center gap-3 p-2.5 rounded border transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-500 bg-blue-950/60 text-white shadow-sm"
                      : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <Icon size={18} className={isSelected ? "text-blue-400" : "text-slate-400"} />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-semibold text-sm leading-tight">{role.label}</div>
                    <div className="text-xs text-slate-400">{role.desc}</div>
                  </div>
                  {isSelected && <UserCheck size={16} className="text-blue-400" />}
                </button>
              );
            })}
          </div>

          <Button
            onClick={() => handleLogin()}
            disabled={loginMutation.isPending}
            className="login-button w-full justify-center py-5 text-base mt-2"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in securely"} <ArrowRight size={17} />
          </Button>
        </section>
      </main>

      <footer className="login-footer">
        <span>© KLG GARMENTS</span>
        <span>INVENTORY · PRODUCTION · SALES · DELIVERY</span>
      </footer>
    </div>
  );
}
