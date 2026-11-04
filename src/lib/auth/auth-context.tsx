"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Profile, UserRole } from "../db/schema";
import { SEED_PROFILES } from "../db/seed-data";

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isLoggedIn: boolean;
  loginAsCustomer: () => void;
  loginAsKitchenStaff: (outletId?: string) => void;
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(SEED_PROFILES[0]); // Default to Customer Demo

  useEffect(() => {
    const saved = localStorage.getItem("dumhouse_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        // default remains
      }
    }
  }, []);

  const saveUser = (u: Profile | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem("dumhouse_user", JSON.stringify(u));
    } else {
      localStorage.removeItem("dumhouse_user");
    }
  };

  const loginAsCustomer = () => {
    saveUser(SEED_PROFILES[0]);
  };

  const loginAsKitchenStaff = (outletId: string = "outlet-kondapur") => {
    const staff = { ...SEED_PROFILES[1], outlet_id: outletId };
    saveUser(staff);
  };

  const login = (email: string, role: UserRole = "CUSTOMER") => {
    const found = SEED_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (found) {
      saveUser(found);
      return true;
    }
    // Generic demo session
    const customUser: Profile = {
      id: `usr-${Date.now()}`,
      email,
      full_name: email.split("@")[0],
      role,
      outlet_id: role === "KITCHEN_STAFF" ? "outlet-kondapur" : undefined,
      created_at: new Date().toISOString(),
    };
    saveUser(customUser);
    return true;
  };

  const logout = () => {
    saveUser(null);
  };

  const role: UserRole = user?.role || "CUSTOMER";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoggedIn: Boolean(user),
        loginAsCustomer,
        loginAsKitchenStaff,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
