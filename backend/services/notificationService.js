const Notification = require('../models/Notification');
const User = require('../models/User');

// Expo Push Notification endpoint
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Notification types with their default titles and colors
 */
const NOTIFICATION_TYPES = {
    accepted: {
        title: '¡Reporte Aprobado!',
        color: '#4CAF50'
    },
    review: {
        title: 'Reporte en Revisión',
        color: '#FF9800'
    },
    rejected: {
        title: 'Reporte Rechazado',
        color: '#F44336'
    },
    updated: {
        title: 'Estado Actualizado',
        color: '#2196F3'
    },
    comment: {
        title: 'Nuevo Comentario',
        color: '#9C27B0'
    },
    system: {
        title: 'Notificación del Sistema',
        color: '#607D8B'
    }
};

/**
 * Send Expo Push Notification
 * @param {string} expoPushToken - The Expo push token
 * @param {string} title - Notification title
 * @param {string} body - Notification body/message
 * @param {object} data - Additional data for deep linking
 */
const sendExpoPush = async (expoPushToken, title, body, data = {}) => {
    // Validate Expo push token format
    if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken')) {
        console.log('⚠️ Invalid or missing Expo push token:', expoPushToken);
        return null;
    }

    const message = {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
        channelId: 'default'
    };

    try {
        const response = await fetch(EXPO_PUSH_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const result = await response.json();

        if (result.data && result.data.status === 'ok') {
            console.log('✅ Push notification sent successfully');
        } else {
            console.log('⚠️ Push notification response:', result);
        }

        return result;
    } catch (error) {
        console.error('❌ Error sending push notification:', error);
        return null;
    }
};

/**
 * Create a notification and optionally send a push notification
 * @param {object} options - Notification options
 * @param {string} options.userId - User ID to notify
 * @param {string} options.type - Notification type
 * @param {string} options.title - Custom title (optional)
 * @param {string} options.message - Notification message
 * @param {string} options.reportId - Related report ID (optional)
 * @param {object} options.data - Additional data (optional)
 * @param {boolean} options.sendPush - Whether to send push notification (default: true)
 */
const createNotification = async ({
    userId,
    type,
    title,
    message,
    reportId = null,
    data = {},
    sendPush = true
}) => {
    try {
        // Get default title if not provided
        const notificationTitle = title || NOTIFICATION_TYPES[type]?.title || 'Notificación';

        // Create notification in database
        const notification = await Notification.create({
            userId,
            type,
            title: notificationTitle,
            message,
            reportId,
            data,
            isRead: false
        });

        console.log('📬 Notification created:', notification._id);

        // Send push notification if requested
        if (sendPush) {
            const user = await User.findById(userId).select('expoPushToken');

            if (user?.expoPushToken) {
                await sendExpoPush(
                    user.expoPushToken,
                    notificationTitle,
                    message,
                    {
                        notificationId: notification._id.toString(),
                        type,
                        reportId: reportId?.toString(),
                        ...data
                    }
                );
            }
        }

        return notification;
    } catch (error) {
        console.error('❌ Error creating notification:', error);
        throw error;
    }
};

/**
 * Notify user about report status change
 * @param {string} userId - User to notify
 * @param {object} report - Report object
 * @param {string} newStatus - New status
 */
const notifyReportStatusChange = async (userId, report, newStatus) => {
    const statusMessages = {
        active: 'Tu reporte está activo y visible para todos.',
        investigating: 'Tu reporte está siendo investigado por las autoridades.',
        resolved: '¡Buenas noticias! El caso ha sido resuelto.',
        closed: 'El caso ha sido cerrado.'
    };

    return createNotification({
        userId,
        type: 'updated',
        message: statusMessages[newStatus] || `El estado ha cambiado a: ${newStatus}`,
        reportId: report._id,
        data: {
            reportName: report.name,
            newStatus
        }
    });
};

/**
 * Notify user about report validation
 * @param {string} userId - User to notify
 * @param {object} report - Report object
 * @param {boolean} isApproved - Whether the report was approved
 */
const notifyReportValidation = async (userId, report, isApproved) => {
    const type = isApproved ? 'accepted' : 'rejected';
    const message = isApproved
        ? `Tu reporte de "${report.name}" ha sido aprobado y ahora es visible públicamente.`
        : `Tu reporte de "${report.name}" ha sido rechazado. Por favor, revisa la información.`;

    return createNotification({
        userId,
        type,
        message,
        reportId: report._id,
        data: {
            reportName: report.name,
            validated: isApproved
        }
    });
};

/**
 * Update user's Expo push token
 * @param {string} userId - User ID
 * @param {string} token - Expo push token
 */
const updatePushToken = async (userId, token) => {
    try {
        await User.findByIdAndUpdate(userId, { expoPushToken: token });
        console.log('📱 Push token updated for user:', userId);
        return true;
    } catch (error) {
        console.error('❌ Error updating push token:', error);
        return false;
    }
};

module.exports = {
    createNotification,
    notifyReportStatusChange,
    notifyReportValidation,
    updatePushToken,
    sendExpoPush,
    NOTIFICATION_TYPES
};
