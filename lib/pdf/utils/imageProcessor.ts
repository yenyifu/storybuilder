import { ProcessedImage } from '../types';
import { PDF_CONSTANTS } from '../constants';

export interface ImageProcessor {
  processImageForPDF(imageUrl: string, quality: 'low' | 'medium' | 'high'): Promise<string>;
  resizeImage(imageData: string, maxWidth: number, maxHeight: number): Promise<string>;
  convertImageFormat(imageData: string, format: 'JPEG' | 'PNG'): Promise<string>;
  validateImageUrl(imageUrl: string): boolean;
  getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }>;
}

class PDFImageProcessor implements ImageProcessor {
  private imageCache: Map<string, ProcessedImage> = new Map();
  private processingQueue: Set<string> = new Set();

  async processImageForPDF(imageUrl: string, quality: 'low' | 'medium' | 'high' = 'medium'): Promise<string> {
    try {
      // Check cache first
      const cacheKey = `${imageUrl}_${quality}`;
      if (this.imageCache.has(cacheKey)) {
        return this.imageCache.get(cacheKey)!.data;
      }

      // Prevent duplicate processing
      if (this.processingQueue.has(cacheKey)) {
        throw new Error('Image is already being processed');
      }

      this.processingQueue.add(cacheKey);

      // Validate image URL
      if (!this.validateImageUrl(imageUrl)) {
        throw new Error('Invalid image URL');
      }

      // Get image dimensions
      const dimensions = await this.getImageDimensions(imageUrl);
      
      // Get quality settings
      const qualitySettings = PDF_CONSTANTS.QUALITY_SETTINGS[quality];
      
      // Resize image if needed
      let processedImageData = imageUrl;
      if (dimensions.width > qualitySettings.maxImageWidth || dimensions.height > qualitySettings.maxImageHeight) {
        processedImageData = await this.resizeImage(
          imageUrl, 
          qualitySettings.maxImageWidth, 
          qualitySettings.maxImageHeight
        );
      }

      // Convert to appropriate format
      const format = this.determineOptimalFormat(imageUrl, quality);
      processedImageData = await this.convertImageFormat(processedImageData, format);

      // Cache the result
      const processedImage: ProcessedImage = {
        data: processedImageData,
        width: dimensions.width,
        height: dimensions.height,
        format,
        size: processedImageData.length
      };

      this.imageCache.set(cacheKey, processedImage);
      this.processingQueue.delete(cacheKey);

      return processedImageData;

    } catch (error) {
      console.error('Image processing failed:', error);
      throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async resizeImage(imageData: string, maxWidth: number, maxHeight: number): Promise<string> {
    try {
      // For now, we'll use a simple approach with canvas
      // In a production environment, you might want to use Sharp or similar
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate new dimensions maintaining aspect ratio
          const aspectRatio = img.width / img.height;
          let newWidth = maxWidth;
          let newHeight = maxHeight;

          if (aspectRatio > 1) {
            newHeight = maxWidth / aspectRatio;
          } else {
            newWidth = maxHeight * aspectRatio;
          }

          canvas.width = newWidth;
          canvas.height = newHeight;

          // Draw and resize image
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Convert to base64
          const resizedImageData = canvas.toDataURL('image/jpeg', 0.9);
          resolve(resizedImageData);
        };

        img.onerror = () => {
          reject(new Error('Failed to load image for resizing'));
        };

        img.src = imageData;
      });
    } catch (error) {
      console.error('Image resizing failed:', error);
      // Return original image if resizing fails
      return imageData;
    }
  }

  async convertImageFormat(imageData: string, format: 'JPEG' | 'PNG'): Promise<string> {
    try {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;

          // Draw image
          ctx.drawImage(img, 0, 0);
          
          // Convert to desired format
          const mimeType = format === 'JPEG' ? 'image/jpeg' : 'image/png';
          const quality = format === 'JPEG' ? 0.9 : 1.0;
          const convertedImageData = canvas.toDataURL(mimeType, quality);
          
          resolve(convertedImageData);
        };

        img.onerror = () => {
          reject(new Error('Failed to load image for format conversion'));
        };

        img.src = imageData;
      });
    } catch (error) {
      console.error('Image format conversion failed:', error);
      // Return original image if conversion fails
      return imageData;
    }
  }

  validateImageUrl(imageUrl: string): boolean {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return false;
    }

    // Check if it's a data URL
    if (imageUrl.startsWith('data:')) {
      return true;
    }

    // Check if it's a valid URL
    try {
      new URL(imageUrl);
      return true;
    } catch {
      return false;
    }
  }

  async getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for dimension check'));
      };

      img.src = imageUrl;
    });
  }

  private determineOptimalFormat(imageUrl: string, quality: 'low' | 'medium' | 'high'): 'JPEG' | 'PNG' {
    // Use JPEG for photos and PNG for graphics with transparency
    if (imageUrl.includes('photo') || imageUrl.includes('image')) {
      return 'JPEG';
    }
    
    // Use PNG for graphics, icons, or if quality is high
    if (quality === 'high' || imageUrl.includes('icon') || imageUrl.includes('graphic')) {
      return 'PNG';
    }
    
    // Default to JPEG for better compression
    return 'JPEG';
  }

  // Clear cache to free memory
  clearCache(): void {
    this.imageCache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; entries: number } {
    return {
      size: Array.from(this.imageCache.values()).reduce((total, img) => total + img.size, 0),
      entries: this.imageCache.size
    };
  }
}

// Export singleton instance
export const imageProcessor = new PDFImageProcessor();

// Helper function to process image with timeout
export async function processImageWithTimeout(
  imageUrl: string, 
  quality: 'low' | 'medium' | 'high' = 'medium',
  timeout: number = PDF_CONSTANTS.IMAGE_PROCESSING_TIMEOUT
): Promise<string> {
  return Promise.race([
    imageProcessor.processImageForPDF(imageUrl, quality),
    new Promise<string>((_, reject) => 
      setTimeout(() => reject(new Error('Image processing timeout')), timeout)
    )
  ]);
}
