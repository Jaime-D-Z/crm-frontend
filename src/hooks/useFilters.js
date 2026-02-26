import { useState, useEffect } from 'react';

export function useFilters(storageKey, defaultFilters = {}) {
    const [filters, setFilters] = useState(() => {
        // Load filters from localStorage on mount
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? { ...defaultFilters, ...JSON.parse(saved) } : defaultFilters;
        } catch {
            return defaultFilters;
        }
    });

    // Save filters to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(filters));
    }, [filters, storageKey]);

    const updateFilter = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            // Reset page when changing other filters
            ...(key !== 'page' && { page: 1 })
        }));
    };

    const resetFilters = () => {
        setFilters(defaultFilters);
        localStorage.removeItem(storageKey);
    };

    return {
        filters,
        setFilters: updateFilter,
        resetFilters
    };
}
