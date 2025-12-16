/**
 * Format a timestamp into a human-readable "last active" string
 * Similar to WhatsApp's "last seen" feature
 * @param {string|Date} timestamp - The lastActive timestamp
 * @returns {string} Formatted string like "Activo hace 5 min"
 */
export function formatLastActive(timestamp) {
    if (!timestamp) return null;

    const now = new Date();
    const lastActive = new Date(timestamp);
    const diffMs = now - lastActive;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Less than 1 minute
    if (diffMinutes < 1) {
        return 'Activo ahora';
    }

    // Less than 1 hour
    if (diffMinutes < 60) {
        return `Activo hace ${diffMinutes} min`;
    }

    // Less than 24 hours
    if (diffHours < 24) {
        return `Activo hace ${diffHours}h`;
    }

    // Yesterday
    if (diffDays === 1) {
        return 'Activo ayer';
    }

    // Less than a week
    if (diffDays < 7) {
        return `Activo hace ${diffDays} días`;
    }

    // More than a week
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `Activo hace ${weeks} sem`;
    }

    // More than a month
    const months = Math.floor(diffDays / 30);
    if (months === 1) {
        return 'Activo hace 1 mes';
    }
    return `Activo hace ${months} meses`;
}

export default formatLastActive;
