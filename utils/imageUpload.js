import * as ImagePicker from 'expo-image-picker';

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'dlxsai1kr';
const CLOUDINARY_UPLOAD_PRESET = 'chronyx_avatars'; // We'll create this in Cloudinary dashboard

export const pickImageFromGallery = async () => {
  try {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access gallery is required!');
      return null;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8, // Good quality for avatars
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

export const takePhotoWithCamera = async () => {
  try {
    // Request permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access camera is required!');
      return null;
    }

    // Take photo
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

export const uploadImageToCloudinary = async (imageUri) => {
  try {
    // Create form data
    const formData = new FormData();
    
    // Extract file extension
    const fileExtension = imageUri.split('.').pop();
    const fileName = `avatar_${Date.now()}.${fileExtension}`;
    
    // Append file
    formData.append('file', {
      uri: imageUri,
      type: `image/${fileExtension}`,
      name: fileName,
    });
    
    // Append upload preset (no API key needed with unsigned preset)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // NOTE: Folder and transformations must be configured in the upload preset
    // NOT passed here for unsigned uploads

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (data.secure_url) {
      return data.secure_url; // Returns HTTPS URL
    } else {
      throw new Error('Upload failed: ' + (data.error?.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Optional: Delete image from Cloudinary (requires backend with API secret)
export const deleteImageFromCloudinary = async (publicId) => {
  // Note: This requires your backend API to handle deletion
  // because it needs the API secret which shouldn't be exposed in the app
  try {
    const response = await fetch(
      'YOUR_BACKEND_URL/api/delete-cloudinary-image',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      }
    );
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};