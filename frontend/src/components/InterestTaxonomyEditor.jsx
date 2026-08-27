import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCategoriesApi, getUserInterestsApi, updateUserInterestsApi } from '../api/axiosClient';

export default function InterestTaxonomyEditor({ onSaved = null, autoSave = false, selectedIds = null, onSelectionChange = null }) {
  const { accessToken } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, userInterests] = await Promise.all([
          getCategoriesApi(accessToken),
          getUserInterestsApi(accessToken),
        ]);
        setCategories(Array.isArray(cats) ? cats : []);

        if (selectedIds !== null) {
          setSelectedCategoryIds(selectedIds);
        } else if (Array.isArray(userInterests)) {
          const ids = userInterests.map((c) => (typeof c === 'object' ? c.id : c)).filter(Boolean);
          setSelectedCategoryIds(ids);
        }
      } catch (err) {
        setStatusMessage({ text: 'Failed to load topic categories.', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [accessToken, selectedIds]);

  const toggleCategory = async (categoryId) => {
    let nextSelected;
    if (selectedCategoryIds.includes(categoryId)) {
      nextSelected = selectedCategoryIds.filter((id) => id !== categoryId);
    } else {
      nextSelected = [...selectedCategoryIds, categoryId];
    }
    setSelectedCategoryIds(nextSelected);

    if (onSelectionChange) {
      onSelectionChange(nextSelected);
    }

    if (autoSave && accessToken) {
      try {
        setSaving(true);
        await updateUserInterestsApi(nextSelected, accessToken);
        if (onSaved) onSaved(nextSelected);
      } catch {
        // ignore autosave errors
      } finally {
        setSaving(false);
      }
    }
  };

  const handleManualSave = async () => {
    if (!accessToken) return;
    setStatusMessage({ text: '', type: '' });
    try {
      setSaving(true);
      await updateUserInterestsApi(selectedCategoryIds, accessToken);
      setStatusMessage({ text: 'Interests updated successfully!', type: 'success' });
      if (onSaved) onSaved(selectedCategoryIds);
    } catch (err) {
      setStatusMessage({ text: err.message || 'Failed to save interests.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const categoryIcons = {
    1: '💻',
    2: '🏛️',
    3: '🎨',
    4: '💰',
    5: '📈',
    6: '🤝',
    7: '✨',
  };

  if (loading) {
    return (
      <div className="py-6 text-center text-xs text-muted">
        <div className="h-6 w-6 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
        Loading interest taxonomy...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {statusMessage.text && (
        <div
          className={`rounded-2xl p-3.5 text-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-800 dark:text-red-300'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-default p-6 text-center text-xs text-muted">
          No topic categories currently available.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => {
            const isSelected = selectedCategoryIds.includes(cat.id);
            const icon = categoryIcons[cat.id] || '🏷️';

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? 'border-primary bg-primary text-white shadow-xs'
                    : 'border-border-default bg-surface text-text-primary hover:border-primary-soft hover:bg-surface-alt'
                }`}
              >
                <span>{icon}</span>
                <span>{cat.name}</span>
                {isSelected && (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      {!autoSave && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted">
            {selectedCategoryIds.length} topic{selectedCategoryIds.length !== 1 ? 's' : ''} selected
          </p>
          <button
            type="button"
            onClick={handleManualSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-hover disabled:opacity-60 transition"
          >
            {saving ? 'Saving...' : 'Save Interests'}
          </button>
        </div>
      )}
    </div>
  );
}
