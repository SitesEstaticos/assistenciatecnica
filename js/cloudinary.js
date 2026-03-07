// ============================================
// CLOUDINARY IMAGE UPLOAD MODULE
// ============================================

class CloudinaryManager {
    constructor() {
        this.cloudName = CLOUDINARY_CONFIG.CLOUD_NAME;
        this.uploadPreset = CLOUDINARY_CONFIG.UPLOAD_PRESET;
        this.uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    }

    /**
     * Compress image before upload
     */
    async compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > IMAGE_CONFIG.MAX_WIDTH) {
                        height = (height * IMAGE_CONFIG.MAX_WIDTH) / width;
                        width = IMAGE_CONFIG.MAX_WIDTH;
                    }
                    if (height > IMAGE_CONFIG.MAX_HEIGHT) {
                        width = (width * IMAGE_CONFIG.MAX_HEIGHT) / height;
                        height = IMAGE_CONFIG.MAX_HEIGHT;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            resolve(blob);
                        },
                        file.type,
                        IMAGE_CONFIG.COMPRESSION_QUALITY
                    );
                };

                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };

                img.src = e.target.result;
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Validate image file
     */
    validateImage(file) {
        if (!file) {
            throw new Error('Nenhum arquivo selecionado');
        }

        if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
            throw new Error('Tipo de arquivo não permitido. Use: JPG, PNG, WebP ou GIF');
        }

        if (file.size > IMAGE_CONFIG.MAX_SIZE) {
            throw new Error(`Arquivo muito grande. Máximo: ${IMAGE_CONFIG.MAX_SIZE / 1024 / 1024}MB`);
        }

        return true;
    }

    /**
     * Upload image to Cloudinary
     */
    async uploadImage(file, onProgress = null) {
        try {
            // Validate image
            this.validateImage(file);

            Logger.log('Starting image upload:', file.name);

            // Compress image
            const compressedBlob = await this.compressImage(file);
            const compressedFile = new File([compressedBlob], file.name, { type: file.type });

            // Create FormData
            const formData = new FormData();
            formData.append('file', compressedFile);
            formData.append('upload_preset', this.uploadPreset);
            formData.append('folder', 'assistencia-tecnica');
            formData.append('resource_type', 'auto');

            // Upload to Cloudinary
            const xhr = new XMLHttpRequest();

            if (onProgress) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        onProgress(percentComplete);
                    }
                });
            }

            return new Promise((resolve, reject) => {
                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        Logger.log('Image uploaded successfully:', response.public_id);
                        resolve({
                            url: response.secure_url,
                            public_id: response.public_id,
                            width: response.width,
                            height: response.height,
                            size: response.bytes,
                        });
                    } else {
                        reject(new Error('Upload failed'));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Upload error'));
                });

                xhr.open('POST', this.uploadUrl);
                xhr.send(formData);
            });
        } catch (error) {
            Logger.error('Image upload error', error);
            throw error;
        }
    }

    /**
     * Upload multiple images
     */
    async uploadMultipleImages(files, onProgress = null) {
        try {
            const results = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                try {
                    const result = await this.uploadImage(file, (progress) => {
                        if (onProgress) {
                            const totalProgress = ((i + progress / 100) / files.length) * 100;
                            onProgress(totalProgress);
                        }
                    });

                    results.push(result);
                } catch (error) {
                    Logger.error(`Error uploading file ${i + 1}:`, error);
                    results.push({
                        error: error.message,
                        file: file.name,
                    });
                }
            }

            return results;
        } catch (error) {
            Logger.error('Multiple upload error', error);
            throw error;
        }
    }

    /**
     * Delete image from Cloudinary
     */
    async deleteImage(publicId) {
        try {
            Logger.log('Deleting image:', publicId);

            // Note: Deletion requires authentication token
            // For now, we'll just log it
            // In production, you'd need a backend endpoint to handle this securely

            Logger.log('Image deletion initiated:', publicId);
            return true;
        } catch (error) {
            Logger.error('Image deletion error', error);
            throw error;
        }
    }

    /**
     * Get image URL with transformations
     */
    getImageUrl(publicId, options = {}) {
        const {
            width = null,
            height = null,
            crop = 'fill',
            quality = 'auto',
            format = 'auto',
        } = options;

        let url = `https://res.cloudinary.com/${this.cloudName}/image/upload/`;

        const transformations = [];

        if (width || height) {
            transformations.push(`w_${width || 'auto'}`);
            transformations.push(`h_${height || 'auto'}`);
            transformations.push(`c_${crop}`);
        }

        transformations.push(`q_${quality}`);
        transformations.push(`f_${format}`);

        if (transformations.length > 0) {
            url += transformations.join(',') + '/';
        }

        url += publicId;

        return url;
    }

    /**
     * Get thumbnail URL
     */
    getThumbnailUrl(publicId) {
        return this.getImageUrl(publicId, {
            width: 200,
            height: 200,
            crop: 'fill',
        });
    }

    /**
     * Get preview URL
     */
    getPreviewUrl(publicId) {
        return this.getImageUrl(publicId, {
            width: 800,
            height: 600,
            crop: 'fit',
        });
    }
}

// Create global Cloudinary instance
const cloudinary = new CloudinaryManager();

// ============================================
// IMAGE UPLOAD UI HANDLER
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Handle image upload button
    const uploadImagesBtn = document.getElementById('uploadImagesBtn');
    const equipmentImages = document.getElementById('equipmentImages');
    const imagePreview = document.getElementById('imagePreview');

    if (uploadImagesBtn && equipmentImages) {
        uploadImagesBtn.addEventListener('click', () => {
            equipmentImages.click();
        });

        equipmentImages.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);

            if (files.length === 0) return;

            // Show preview
            imagePreview.innerHTML = '';

            for (const file of files) {
                const reader = new FileReader();

                reader.onload = (event) => {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'image-preview-item';
                    previewItem.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                    imagePreview.appendChild(previewItem);
                };

                reader.readAsDataURL(file);
            }

            Logger.log(`${files.length} image(s) selected for upload`);
        });
    }
});
