import { useState, useEffect } from 'react';

export function useApi(apiFunction, dependencies = [], immediate = true) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = async (...args) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiFunction(...args);
            setData(result.data || result);
            return result;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, dependencies);

    return {
        data,
        loading,
        error,
        execute,
        setData,
        setError
    };
}
