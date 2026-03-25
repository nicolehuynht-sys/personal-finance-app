"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { PageShell } from "@/components/layout/PageShell";
import { CategoryTree } from "@/components/categories/CategoryTree";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { Category } from "@/lib/types";
import { DEV_USER_ID } from "@/lib/utils";

// Seed categories for now (will be fetched from Supabase later)
const SEED_CATEGORIES: Category[] = [
  { id: "10000000-0000-0000-0000-000000000001", user_id: DEV_USER_ID, parent_id: null, name: "Housing", icon: "home", is_system: true, exclude_from_totals: false, sort_order: 1, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000002", user_id: DEV_USER_ID, parent_id: null, name: "Food & Beverage", icon: "restaurant", is_system: true, exclude_from_totals: false, sort_order: 2, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000003", user_id: DEV_USER_ID, parent_id: null, name: "Transport", icon: "directions_car", is_system: true, exclude_from_totals: false, sort_order: 3, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000004", user_id: DEV_USER_ID, parent_id: null, name: "Entertainment", icon: "movie", is_system: true, exclude_from_totals: false, sort_order: 4, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000005", user_id: DEV_USER_ID, parent_id: null, name: "Shopping", icon: "shopping_bag", is_system: true, exclude_from_totals: false, sort_order: 5, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000006", user_id: DEV_USER_ID, parent_id: null, name: "Healthcare", icon: "local_hospital", is_system: true, exclude_from_totals: false, sort_order: 6, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000007", user_id: DEV_USER_ID, parent_id: null, name: "Utilities", icon: "bolt", is_system: true, exclude_from_totals: false, sort_order: 7, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000008", user_id: DEV_USER_ID, parent_id: null, name: "Insurance", icon: "shield", is_system: true, exclude_from_totals: false, sort_order: 8, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000009", user_id: DEV_USER_ID, parent_id: null, name: "Education", icon: "school", is_system: true, exclude_from_totals: false, sort_order: 9, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000010", user_id: DEV_USER_ID, parent_id: null, name: "Travel", icon: "flight", is_system: true, exclude_from_totals: false, sort_order: 10, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000011", user_id: DEV_USER_ID, parent_id: null, name: "Personal Care", icon: "spa", is_system: true, exclude_from_totals: false, sort_order: 11, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000012", user_id: DEV_USER_ID, parent_id: null, name: "Gifts", icon: "redeem", is_system: true, exclude_from_totals: false, sort_order: 12, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000013", user_id: DEV_USER_ID, parent_id: null, name: "Income", icon: "payments", is_system: true, exclude_from_totals: false, sort_order: 13, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000014", user_id: DEV_USER_ID, parent_id: null, name: "Investment", icon: "trending_up", is_system: true, exclude_from_totals: false, sort_order: 14, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000015", user_id: DEV_USER_ID, parent_id: null, name: "Other", icon: "more_horiz", is_system: true, exclude_from_totals: false, sort_order: 15, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000016", user_id: DEV_USER_ID, parent_id: null, name: "Account Transfer", icon: "swap_horiz", is_system: true, exclude_from_totals: false, sort_order: 16, created_at: "" },
  { id: "10000000-0000-0000-0000-000000000017", user_id: DEV_USER_ID, parent_id: null, name: "Card Payment", icon: "credit_card", is_system: true, exclude_from_totals: false, sort_order: 17, created_at: "" },
  // Sub-categories
  { id: "20000000-0000-0000-0000-000000000001", user_id: DEV_USER_ID, parent_id: "10000000-0000-0000-0000-000000000002", name: "Groceries", icon: "shopping_cart", is_system: true, exclude_from_totals: false, sort_order: 1, created_at: "" },
  { id: "20000000-0000-0000-0000-000000000002", user_id: DEV_USER_ID, parent_id: "10000000-0000-0000-0000-000000000002", name: "Dining Out", icon: "restaurant_menu", is_system: true, exclude_from_totals: false, sort_order: 2, created_at: "" },
  { id: "20000000-0000-0000-0000-000000000003", user_id: DEV_USER_ID, parent_id: "10000000-0000-0000-0000-000000000002", name: "Coffee Shops", icon: "coffee", is_system: true, exclude_from_totals: false, sort_order: 3, created_at: "" },
  { id: "20000000-0000-0000-0000-000000000004", user_id: DEV_USER_ID, parent_id: "10000000-0000-0000-0000-000000000003", name: "Public Transit", icon: "train", is_system: true, exclude_from_totals: false, sort_order: 1, created_at: "" },
  { id: "20000000-0000-0000-0000-000000000005", user_id: DEV_USER_ID, parent_id: "10000000-0000-0000-0000-000000000003", name: "Fuel", icon: "local_gas_station", is_system: true, exclude_from_totals: false, sort_order: 2, created_at: "" },
  { id: "20000000-0000-0000-0000-000000000006", user_id: DEV_USER_ID, parent_id: "10000000-0000-0000-0000-000000000003", name: "Ride Share", icon: "hail", is_system: true, exclude_from_totals: false, sort_order: 3, created_at: "" },
  { id: "20000000-0000-0000-0000-000000000007", user_id: DEV_USER_ID, parent_id: "10000000-0000-0000-0000-000000000004", name: "Subscriptions", icon: "subscriptions", is_system: true, exclude_from_totals: false, sort_order: 1, created_at: "" },
  { id: "20000000-0000-0000-0000-000000000008", user_id: DEV_USER_ID, parent_id: "10000000-0000-0000-0000-000000000004", name: "Events", icon: "event", is_system: true, exclude_from_totals: false, sort_order: 2, created_at: "" },
  { id: "20000000-0000-0000-0000-000000000009", user_id: DEV_USER_ID, parent_id: "10000000-0000-0000-0000-000000000013", name: "Salary", icon: "account_balance", is_system: true, exclude_from_totals: false, sort_order: 1, created_at: "" },
  { id: "20000000-0000-0000-0000-000000000010", user_id: DEV_USER_ID, parent_id: "10000000-0000-0000-0000-000000000013", name: "Freelance", icon: "work", is_system: true, exclude_from_totals: false, sort_order: 2, created_at: "" },
  { id: "20000000-0000-0000-0000-000000000011", user_id: DEV_USER_ID, parent_id: "10000000-0000-0000-0000-000000000014", name: "Dividends", icon: "savings", is_system: true, exclude_from_totals: false, sort_order: 1, created_at: "" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [editModal, setEditModal] = useState<{ open: boolean; category?: Category }>({ open: false });
  const [newCatModal, setNewCatModal] = useState<{ open: boolean; parentId?: string }>({ open: false });
  const [newName, setNewName] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = searchQuery
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  return (
    <>
      <Header
        title="Manage Categories"
        showBack
        rightAction={
          <button
            onClick={() => {
              setSearchOpen(!searchOpen);
              if (searchOpen) setSearchQuery("");
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-silver-light/50"
          >
            <span className="material-symbols-outlined text-[22px] text-slate-600">
              {searchOpen ? "close" : "search"}
            </span>
          </button>
        }
      />

      <div className="px-6 pb-32 lg:pb-8 max-w-3xl mx-auto">
        {/* Search bar (toggled) */}
        {searchOpen && (
          <div className="mt-4 mb-2">
            <div className="relative flex items-center">
              <div className="absolute left-4 text-silver-metallic">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full h-11 bg-white border border-silver-light rounded-2xl pl-11 pr-4 text-sm font-medium placeholder:text-silver-metallic focus:ring-1 focus:ring-deep-green focus:border-deep-green transition-all"
                placeholder="Search categories..."
              />
            </div>
          </div>
        )}

        <div className="mb-8 mt-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-silver-metallic">
            Hierarchy
          </h2>
        </div>

        <CategoryTree
          categories={filteredCategories}
          onEdit={(cat) => setEditModal({ open: true, category: cat })}
          onDelete={(cat) => {
            if (confirm(`Delete "${cat.name}"?`)) {
              // TODO: delete from Supabase
            }
          }}
          onAddSub={(parentId) => {
            setNewCatModal({ open: true, parentId });
            setNewName("");
          }}
          onToggleExclude={(cat) => {
            setCategories((prev) =>
              prev.map((c) =>
                c.id === cat.id
                  ? { ...c, exclude_from_totals: !c.exclude_from_totals }
                  : c
              )
            );
            // TODO: persist to Supabase
          }}
        />

        <button
          onClick={() => {
            setNewCatModal({ open: true });
            setNewName("");
          }}
          className="w-full mt-10 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-silver-light rounded-2xl text-silver-metallic hover:text-deep-green hover:border-deep-green transition-all bg-slate-50/50"
        >
          <span className="material-symbols-outlined">add_box</span>
          <span className="text-[14px] font-semibold">Create New Category</span>
        </button>
      </div>

      {/* Edit Modal */}
      <Modal
        open={editModal.open}
        onClose={() => setEditModal({ open: false })}
        title={`Edit ${editModal.category?.name || "Category"}`}
      >
        <input
          type="text"
          defaultValue={editModal.category?.name}
          className="w-full h-12 border border-silver-light rounded-xl px-4 text-sm font-medium focus:ring-1 focus:ring-deep-green focus:border-deep-green"
          placeholder="Category name"
        />
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={() => setEditModal({ open: false })}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={() => setEditModal({ open: false })}>
            Save
          </Button>
        </div>
      </Modal>

      {/* New Category Modal */}
      <Modal
        open={newCatModal.open}
        onClose={() => setNewCatModal({ open: false })}
        title={newCatModal.parentId ? "Add Sub-category" : "New Category"}
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full h-12 border border-silver-light rounded-xl px-4 text-sm font-medium focus:ring-1 focus:ring-deep-green focus:border-deep-green"
          placeholder="Category name"
        />
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={() => setNewCatModal({ open: false })}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={() => setNewCatModal({ open: false })}>
            Create
          </Button>
        </div>
      </Modal>
    </>
  );
}
