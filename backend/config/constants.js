module.exports = {
    // User Roles
    ROLES: {
        USER: 'user',
        ADMIN: 'admin'
    },

    // Report Status
    REPORT_STATUS: {
        ACTIVE: 'active',
        INVESTIGATING: 'investigating',
        RESOLVED: 'resolved',
        CLOSED: 'closed'
    },

    // Alert Types
    ALERT_TYPES: {
        MISSING_PERSON: 'missing_person',
        FOUND: 'found',
        UPDATE: 'update',
        URGENT: 'urgent',
        INFO: 'info'
    },

    // Alert Priority
    ALERT_PRIORITY: {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        CRITICAL: 'critical'
    },

    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
};
