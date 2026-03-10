// ============================================
// CLOUDINARY IMAGE UPLOAD MODULE - STATIC VERSION
// ============================================

class CloudinaryManager {
    constructor(config, imageConfig) {
        this.cloudName = config.CLOUD_NAME;
        this.uploadPreset = config.UPLOAD_PRESET;
        this.uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
        this.imageConfig = imageConfig;
    }

    // Compress image (skips GIFs to preserve animation)
    async compressImage(file) {
        if (file.type === 'image/gif') return file; // preserve GIFs

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize proportionally
                    if (width > this.imageConfig.MAX_WIDTH) {
                        height = (height * this.imageConfig.MAX_WIDTH) / width;
                        width = this.imageConfig.MAX_WIDTH;
                    }
                    if (height > this.imageConfig.MAX_HEIGHT) {
                        width = (width * this.imageConfig.MAX_HEIGHT) / height;
                        height = this.imageConfig.MAX_HEIGHT;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => resolve(blob),
                        file.type,
                        this.imageConfig.COMPRESSION_QUALITY
                    );
                };

                img.onerror = () => reject(new Error('Falha ao carregar a imagem'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
            reader.readAsDataURL(file);
        });
    }

    // Validate image
    validateImage(file) {
        if (!file) throw new Error('Nenhum arquivo selecionado');
        if (!this.imageConfig.ALLOWED_TYPES.includes(file.type))
            throw new Error('Tipo de arquivo não permitido. Use: JPG, PNG, WebP ou GIF');
        if (file.size > this.imageConfig.MAX_SIZE)
            throw new Error(`Arquivo muito grande. Máximo: ${this.imageConfig.MAX_SIZE / 1024 / 1024}MB`);
        return true;
    }

    // Upload single image
    async uploadImage(file, onProgress = null) {
        try {
            this.validateImage(file);
            const compressedFile = await this.compressImage(file);

            const formData = new FormData();
            formData.append('file', compressedFile);
            formData.append('upload_preset', this.uploadPreset);
            formData.append('folder', 'assistencia-tecnica');
            formData.append('resource_type', 'auto');

            const xhr = new XMLHttpRequest();

            if (onProgress) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percent = (e.loaded / e.total) * 100;
                        onProgress(percent);
                    }
                });
            }

            return new Promise((resolve, reject) => {
                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        resolve({
                            url: response.secure_url,
                            public_id: response.public_id,
                            width: response.width,
                            height: response.height,
                            size: response.bytes,
                        });
                    } else {
                        reject(new Error('Upload falhou'));
                    }
                });

                xhr.addEventListener('error', () => reject(new Error('Erro no upload')));
                xhr.open('POST', this.uploadUrl);
                xhr.send(formData);
            });
        } catch (error) {
            throw error;
        }
    }

    // Upload multiple images em paralelo
    async uploadMultipleImages(files, onProgress = null) {
        const results = await Promise.allSettled(
            files.map((file, index) =>
                this.uploadImage(file, (progress) => {
                    if (onProgress) {
                        const totalProgress = ((index + progress / 100) / files.length) * 100;
                        onProgress(totalProgress);
                    }
                })
            )
        );

        return results.map((r) =>
            r.status === 'fulfilled' ? r.value : { error: r.reason.message, file: r.reason?.file?.name || 'unknown' }
        );
    }

    // Deletion (log only, sem backend)
    async deleteImage(publicId) {
        console.warn('Não é possível deletar imagens em site estático. Use o painel Cloudinary.');
        return true;
    }

    // Image URL with transformations
    getImageUrl(publicId, options = {}) {
        const { width = null, height = null, crop = 'fill', quality = 'auto', format = 'auto' } = options;
        let url = `https://res.cloudinary.com/${this.cloudName}/image/upload/`;
        const transformations = [];

        if (width || height) {
            transformations.push(`w_${width || 'auto'}`);
            transformations.push(`h_${height || 'auto'}`);
            transformations.push(`c_${crop}`);
        }
        transformations.push(`q_${quality}`, `f_${format}`);

        if (transformations.length > 0) url += transformations.join(',') + '/';
        url += publicId;

        return url;
    }

    getThumbnailUrl(publicId) {
        return this.getImageUrl(publicId, { width: 200, height: 200, crop: 'fill' });
    }

    getPreviewUrl(publicId) {
        return this.getImageUrl(publicId, { width: 800, height: 600, crop: 'fit' });
    }
}

// ============================================
// CONFIGURAÇÕES
// ============================================

const CLOUDINARY_CONFIG = window.CLOUDINARY_CONFIG;

const IMAGE_CONFIG = {
    MAX_WIDTH: 1600,
    MAX_HEIGHT: 1600,
    COMPRESSION_QUALITY: 0.8,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
};

// Instância global
const cloudinary = new CloudinaryManager(CLOUDINARY_CONFIG, IMAGE_CONFIG);

// ============================================
// IMAGE UPLOAD UI HANDLER
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadImagesBtn');
    const inputFiles = document.getElementById('equipmentImages');
    const previewContainer = document.getElementById('imagePreview');

    if (!uploadBtn || !inputFiles) return;

    uploadBtn.addEventListener('click', () => inputFiles.click());

    inputFiles.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        previewContainer.innerHTML = '';

        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const div = document.createElement('div');
                div.className = 'image-preview-item';
                div.innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
                previewContainer.appendChild(div);
            };
            reader.readAsDataURL(file);
        }

        console.log(`${files.length} imagem(ns) selecionada(s)`);
    });
});