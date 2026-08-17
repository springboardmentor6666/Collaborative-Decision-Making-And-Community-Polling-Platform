import React, { useState, useEffect } from 'react';
import { getCategoriesApi, createCategoryApi } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function CategorySelector({ selectedCategoryId, onChange, label = 'Category' }) {
  const { accessToken } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [creatingCustom, setCreatingCustom] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategoriesApi(accessToken);
        setCategories(data);
      } catch {
        // Fallback handled in getCategoriesApi
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, [accessToken]);

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    if (!customName.trim() || creatingCustom) return;

    try {
      setCreatingCustom(true);
      const newCat = await createCategoryApi(customName.trim(), accessToken);
      if (newCat) {
        setCategories((prev) => {
          if (prev.some((c) => c.id === newCat.id)) return prev;
          return [...prev, newCat];
        });
        onChange(newCat.id, newCat.name);
        setCustomName('');
        setShowCustomInput(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to create category');
    } finally {
      setCreatingCustom(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="text-xs font-semibold text-primary hover:underline transition-all"
        >
          {showCustomInput ? 'Choose existing' : '+ Custom / User-Made'}
        </button>
      </div>

      {showCustomInput ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Enter custom category name (e.g. AI Research)..."
            className="app-input flex-1 px-4 py-2.5 text-xs sm:text-sm"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreateCustom}
            disabled={!customName.trim() || creatingCustom}
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-contrast, #ffffff)',
            }}
            className="rounded-xl px-4 py-2 text-xs font-bold shadow-sm hover:opacity-90 disabled:opacity-50"
          >
            {creatingCustom ? 'Adding...' : 'Add'}
          </button>
        </div>
      ) : (
        <select
          value={selectedCategoryId || ''}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : null;
            const cat = categories.find((c) => c.id === val);
            onChange(val, cat?.name || null);
          }}
          disabled={loading}
          className="app-input px-4 py-3 text-xs sm:text-sm w-full"
        >
          <option value="">-- Select a Category (Optional) --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
