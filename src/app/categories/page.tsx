"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { CategoryTree } from "@/components/categories/CategoryTree";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const { userId } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editModal, setEditModal] = useState<{ open: boolean; category?: Category }>({ open: false });
  const [editName, setEditName] = useState("");
  const [newCatModal, setNewCatModal] = useState<{ open: boolean; parentId?: string }>({ open: false });
  const [newName, setNewName] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const supabase = createClient();

  const fetchCategories = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order");
    if (data) setCategories(data);
  }, [userId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
          onEdit={(cat) => {
            setEditModal({ open: true, category: cat });
            setEditName(cat.name);
          }}
          onDelete={async (cat) => {
            if (confirm(`Delete "${cat.name}"?`)) {
              const { error } = await supabase
                .from("categories")
                .delete()
                .eq("id", cat.id);
              if (error) {
                toast.error("Failed to delete category");
              } else {
                toast.success(`Deleted "${cat.name}"`);
                fetchCategories();
              }
            }
          }}
          onAddSub={(parentId) => {
            setNewCatModal({ open: true, parentId });
            setNewName("");
          }}
          onToggleExclude={async (cat) => {
            const newValue = !cat.exclude_from_totals;
            // Optimistic update
            setCategories((prev) =>
              prev.map((c) =>
                c.id === cat.id ? { ...c, exclude_from_totals: newValue } : c
              )
            );
            const { error } = await supabase
              .from("categories")
              .update({ exclude_from_totals: newValue })
              .eq("id", cat.id);
            if (error) {
              toast.error("Failed to update");
              fetchCategories(); // Revert on error
            }
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
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="w-full h-12 border border-silver-light rounded-xl px-4 text-sm font-medium focus:ring-1 focus:ring-deep-green focus:border-deep-green"
          placeholder="Category name"
        />
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={() => setEditModal({ open: false })}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={async () => {
              if (!editModal.category || !editName.trim()) return;
              const { error } = await supabase
                .from("categories")
                .update({ name: editName.trim() })
                .eq("id", editModal.category.id);
              if (error) {
                toast.error("Failed to update category");
              } else {
                toast.success("Category updated");
                setEditModal({ open: false });
                fetchCategories();
              }
            }}
          >
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
          <Button
            className="flex-1"
            onClick={async () => {
              if (!newName.trim() || !userId) return;
              const maxSort = categories.reduce((max, c) => Math.max(max, c.sort_order), 0);
              const { error } = await supabase.from("categories").insert({
                user_id: userId,
                parent_id: newCatModal.parentId || null,
                name: newName.trim(),
                icon: "category",
                sort_order: maxSort + 1,
              });
              if (error) {
                toast.error("Failed to create category");
              } else {
                toast.success(`Created "${newName.trim()}"`);
                setNewCatModal({ open: false });
                fetchCategories();
              }
            }}
          >
            Create
          </Button>
        </div>
      </Modal>
    </>
  );
}
