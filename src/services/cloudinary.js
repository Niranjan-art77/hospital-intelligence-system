import axios from 'axios';

// Nova Health Cloudinary Configuration
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'nova_health_uploads';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dgx76vqw8';
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '879894567328567';

// Enhanced upload function with multiple fallback strategies
export const uploadToCloudinary = async (file, onProgress = null) => {
    // Validate file
    if (!file) {
        throw new Error('No file provided');
    }

    // File size validation (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'nova-health/reports');
    formData.append('resource_type', 'auto');
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', Math.floor(Date.now() / 1000));

    // Try multiple upload strategies
    const uploadStrategies = [
        {
            url: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
            resourceType: 'auto',
            folder: 'nova-health/reports'
        },
        {
            url: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            resourceType: 'image',
            folder: 'nova-health/images'
        },
        {
            url: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
            resourceType: 'raw',
            folder: 'nova-health/documents'
        }
    ];

    let lastError = null;

    for (const strategy of uploadStrategies) {
        try {
            console.log(`Trying upload strategy: ${strategy.resourceType}`);
            
            const strategyFormData = new FormData();
            strategyFormData.append('file', file);
            strategyFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            strategyFormData.append('folder', strategy.folder);
            strategyFormData.append('resource_type', strategy.resourceType);
            strategyFormData.append('api_key', CLOUDINARY_API_KEY);
            strategyFormData.append('timestamp', Math.floor(Date.now() / 1000));

            const response = await axios.post(strategy.url, strategyFormData, {
                onUploadProgress: (progressEvent) => {
                    if (onProgress) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    }
                },
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                timeout: 60000
            });

            return {
                url: response.data.secure_url,
                publicId: response.data.public_id,
                format: response.data.format || file.type.split('/')[1],
                size: response.data.bytes || file.size,
                createdAt: response.data.created_at,
                resourceType: response.data.resource_type || strategy.resourceType
            };

        } catch (error) {
            console.error(`Upload strategy ${strategy.resourceType} failed:`, error);
            lastError = error;
            continue;
        }
    }

    // If all strategies failed, throw the last error with helpful message
    const errorMessage = lastError?.response?.data?.error?.message || lastError?.message || 'Unknown error';
    throw new Error(`Upload failed. Please check your Cloudinary configuration. Error: ${errorMessage}`);
};

// Enhanced PDF upload function
export const uploadPDFToCloudinary = async (file, onProgress = null) => {
    if (!file) {
        throw new Error('No PDF file provided');
    }

    if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are allowed');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'nova-health/pdfs');
    formData.append('resource_type', 'raw');
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', Math.floor(Date.now() / 1000));

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
            formData,
            {
                onUploadProgress: (progressEvent) => {
                    if (onProgress) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    }
                },
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                timeout: 60000
            }
        );
        
        return {
            url: response.data.secure_url,
            publicId: response.data.public_id,
            size: response.data.bytes || file.size,
            format: 'pdf',
            createdAt: response.data.created_at,
            resourceType: 'raw'
        };
    } catch (error) {
        console.error('Cloudinary PDF upload error:', error);
        
        // Fallback to auto upload
        try {
            const fallbackFormData = new FormData();
            fallbackFormData.append('file', file);
            fallbackFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            fallbackFormData.append('folder', 'nova-health/documents');
            fallbackFormData.append('resource_type', 'auto');
            fallbackFormData.append('api_key', CLOUDINARY_API_KEY);
            fallbackFormData.append('timestamp', Math.floor(Date.now() / 1000));

            const fallbackResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
                fallbackFormData,
                {
                    onUploadProgress: (progressEvent) => {
                        if (onProgress) {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            onProgress(percentCompleted);
                        }
                    },
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    },
                    timeout: 60000
                }
            );
            
            return {
                url: fallbackResponse.data.secure_url,
                publicId: fallbackResponse.data.public_id,
                size: fallbackResponse.data.bytes || file.size,
                format: fallbackResponse.data.format || 'pdf',
                createdAt: fallbackResponse.data.created_at,
                resourceType: fallbackResponse.data.resource_type || 'raw'
            };
        } catch (fallbackError) {
            console.error('Cloudinary PDF fallback upload error:', fallbackError);
            const errorMessage = fallbackError?.response?.data?.error?.message || fallbackError?.message || 'Unknown error';
            throw new Error(`PDF upload failed: Please check your Cloudinary preset configuration. Error: ${errorMessage}`);
        }
    }
};

// Delete function with better error handling
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`,
            {
                public_id: publicId,
                resource_type: resourceType
            }
        );
        return response.data.result === 'ok';
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
        throw new Error(`Delete failed: ${errorMessage}`);
    }
};

// Get file info
export const getCloudinaryInfo = async (publicId, resourceType = 'image') => {
    try {
        const response = await axios.get(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/${publicId}`
        );
        return response.data;
    } catch (error) {
        console.error('Cloudinary info error:', error);
        const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
        throw new Error(`Failed to get file info: ${errorMessage}`);
    }
};

// Generate secure URL with transformations
export const generateSecureUrl = (publicId, transformations = {}) => {
    const defaultTransformations = {
        quality: 'auto:good',
        fetch_format: 'auto',
        secure: true,
        ...transformations
    };
    
    const transformationString = Object.entries(defaultTransformations)
        .map(([key, value]) => `${key}_${value}`)
        .join(',');
    
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}/${publicId}`;
};

// Test Cloudinary configuration
export const testCloudinaryConfig = async () => {
    try {
        // Test with a small text file
        const testContent = 'Test file for Nova Health';
        const blob = new Blob([testContent], { type: 'text/plain' });
        const testFile = new File([blob], 'test.txt', { type: 'text/plain' });
        
        const result = await uploadToCloudinary(testFile);
        
        // Clean up test file
        await deleteFromCloudinary(result.publicId, result.resourceType);
        
        return { success: true, message: 'Cloudinary configuration is working correctly' };
    } catch (error) {
        return { 
            success: false, 
            message: `Cloudinary configuration error: ${error.message}`,
            error: error.message 
        };
    }
};
