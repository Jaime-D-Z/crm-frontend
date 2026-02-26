// Validation utilities
export const validators = {
    email: (value) => {
        if (!value) return 'El email es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'El email no es válido';
        }
        return null;
    },

    password: (value) => {
        if (!value) return 'La contraseña es obligatoria';
        if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            return 'La contraseña debe contener mayúsculas, minúsculas y números';
        }
        return null;
    },

    name: (value) => {
        if (!value) return 'El nombre es obligatorio';
        if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres';
        if (value.length > 100) return 'El nombre no puede exceder 100 caracteres';
        return null;
    },

    phone: (value) => {
        if (value && !/^[+]?[\d\s\-\(\)]+$/.test(value)) {
            return 'El teléfono no es válido';
        }
        return null;
    },

    required: (value, fieldName = 'Este campo') => {
        if (!value || value.toString().trim() === '') {
            return `${fieldName} es obligatorio`;
        }
        return null;
    },

    minLength: (value, min) => {
        if (value && value.length < min) {
            return `Debe tener al menos ${min} caracteres`;
        }
        return null;
    },

    maxLength: (value, max) => {
        if (value && value.length > max) {
            return `No puede exceder ${max} caracteres`;
        }
        return null;
    }
};

// Form validation helper
export const validateForm = (data, schema) => {
    const errors = {};
    
    Object.keys(schema).forEach(field => {
        const fieldValidators = Array.isArray(schema[field]) ? schema[field] : [schema[field]];
        
        for (const validator of fieldValidators) {
            const error = typeof validator === 'function' 
                ? validator(data[field]) 
                : validators[validator.type](data[field], validator.fieldName);
            
            if (error) {
                errors[field] = error;
                break;
            }
        }
    });
    
    return errors;
};
