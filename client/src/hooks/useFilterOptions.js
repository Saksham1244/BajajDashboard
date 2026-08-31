import { useState, useEffect } from 'react';

// Default baseline options from live database schema
const DEFAULT_OPTIONS = {
  lines: ['All', 'Line 1', 'Line 2'],
  stations: ['All', 'Demo', 'Line2', 'Station2'],
  modelFamilies: ['All', 'Bike'],
  models: ['All', 'A'],
  skus: ['All', 'SKU1', 'SKU2'],
  lossCategories: ['All', 'Breakdown Loss'],
  operators: ['All', 'Rahul Sharma', 'Priya Singh', 'Amit Kumar']
};

let cachedFilterOptions = null;
let activeFetchPromise = null;

export function useFilterOptions() {
  const [options, setOptions] = useState(cachedFilterOptions || DEFAULT_OPTIONS);
  const [loading, setLoading] = useState(!cachedFilterOptions);

  useEffect(() => {
    if (cachedFilterOptions) {
      setOptions(cachedFilterOptions);
      return;
    }

    if (!activeFetchPromise) {
      activeFetchPromise = fetch('/api/metadata/filters')
        .then(res => {
          if (!res.ok) throw new Error('Metadata fetch failed');
          return res.json();
        })
        .then(data => {
          const rawLines = data.lines || ['Line 1', 'Line 2'];
          const cleanLines = ['All', ...Array.from(new Set(rawLines.map(l => l === 'Line2' ? 'Line 2' : l)))];
          const merged = {
            lines: cleanLines,
            stations: ['All', ...(data.stations || ['Demo', 'Line2', 'Station2'])],
            modelFamilies: ['All', ...(data.modelFamilies || ['Bike'])],
            models: ['All', ...(data.models || ['A'])],
            skus: ['All', ...(data.skus || ['SKU1', 'SKU2'])],
            lossCategories: ['All', ...(data.lossCategories || ['Breakdown Loss'])],
            operators: ['All', ...(data.operators || ['Rahul Sharma', 'Priya Singh', 'Amit Kumar'])],
          };
          cachedFilterOptions = merged;
          return merged;
        })
        .catch(err => {
          console.warn('Using default filter options fallback:', err.message || err);
          cachedFilterOptions = DEFAULT_OPTIONS;
          return DEFAULT_OPTIONS;
        })
        .finally(() => {
          activeFetchPromise = null;
        });
    }

    activeFetchPromise.then(opts => {
      setOptions(opts);
      setLoading(false);
    });
  }, []);

  return { ...options, loading };
}

export default useFilterOptions;
