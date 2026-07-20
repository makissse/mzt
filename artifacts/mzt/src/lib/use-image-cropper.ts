import { useState, useCallback } from 'react';
import type { CropAspect } from '@/components/image-cropper';

export interface CropperState {
  open: boolean;
  imageUrl: string | null;
  aspect: CropAspect;
  title: string;
  circularPreview: boolean;
  onCropped?: (file: File) => void;
}

export function useImageCropper() {
  const [state, setState] = useState<CropperState>({
    open: false,
    imageUrl: null,
    aspect: 1,
    title: 'Обрезать изображение',
    circularPreview: false,
  });

  const openCropper = useCallback((
    file: File,
    options: { aspect: CropAspect; title: string; circularPreview?: boolean; onCropped: (file: File) => void }
  ) => {
    const url = URL.createObjectURL(file);
    setState({
      open: true,
      imageUrl: url,
      aspect: options.aspect,
      title: options.title,
      circularPreview: options.circularPreview ?? false,
      onCropped: (croppedFile: File) => {
        options.onCropped(croppedFile);
        URL.revokeObjectURL(url);
        setState((s) => ({ ...s, open: false }));
      },
    });
  }, []);

  const closeCropper = useCallback(() => {
    if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
    setState((s) => ({ ...s, open: false, imageUrl: null }));
  }, [state.imageUrl]);

  return {
    cropperProps: {
      open: state.open,
      onClose: closeCropper,
      imageUrl: state.imageUrl,
      aspect: state.aspect,
      title: state.title,
      circularPreview: state.circularPreview,
      onCropped: state.onCropped ?? (() => {}),
    },
    openCropper,
  };
}
