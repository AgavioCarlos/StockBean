import React, { useState, useCallback } from 'react';

/**
 * Custom hook to manage form state and changes.
 * @param initialValues Initial state of the form
 * @returns { values, handleChange, setValues, resetForm }
 */
export function useForm<T extends Record<string, any>>(initialValues: T) {
    const [values, setFormValues] = useState<T>(initialValues);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setFormValues(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === "" ? "" : Number(value)) : value
        }));
    }, []);

    const setValues = useCallback((newValues: Partial<T>) => {
        setFormValues(prev => ({
            ...prev,
            ...newValues
        }));
    }, []);

    const resetForm = useCallback(() => {
        setFormValues(initialValues);
    }, [initialValues]);

    return {
        values,
        handleChange,
        setValues,
        resetForm
    };
}
