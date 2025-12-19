import api from './api';

const userService = {
    // Get current user profile
    async getProfile() {
        try {
            const response = await api.get('/users/profile');
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Update user profile (name, phone, photo)
    async updateProfile(profileData) {
        try {
            const formData = new FormData();

            if (profileData.name) {
                formData.append('name', profileData.name);
            }
            if (profileData.phone !== undefined) {
                formData.append('phone', profileData.phone || '');
            }

            // Append profile image if exists
            if (profileData.profileImage) {
                const uriParts = profileData.profileImage.split('.');
                const fileType = uriParts[uriParts.length - 1];

                formData.append('profileImage', {
                    uri: profileData.profileImage,
                    name: `profile.${fileType}`,
                    type: `image/${fileType}`
                });
            }

            const response = await api.put('/users/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response;
        } catch (error) {
            throw error;
        }
    },

    // Change password
    async changePassword(passwordData) {
        try {
            const response = await api.put('/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default userService;
