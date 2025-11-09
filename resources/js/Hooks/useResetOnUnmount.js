import { useEffect, useRef } from 'react';

/**
 * Ensures specific form fields are cleared when a component unmounts, without
 * fighting React hook dependency linting or relying on unstable callbacks.
 */
export default function useResetOnUnmount(reset, ...fields) {
    const resetRef = useRef(reset);
    const fieldsRef = useRef(fields);

    resetRef.current = reset;
    fieldsRef.current = fields;

    useEffect(() => {
        return () => {
            if (typeof resetRef.current === 'function') {
                resetRef.current(...fieldsRef.current);
            }
        };
    }, []);
}
