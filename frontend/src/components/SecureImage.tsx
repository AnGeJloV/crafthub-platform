import { useEffect, useState } from 'react';
import apiClient from '../api';

interface SecureImageProps {
    src: string;
    className?: string;
    alt?: string;
}

export const SecureImage = ({ src, className, alt }: SecureImageProps) => {
    const [imageSrc, setImageSrc] = useState<string>('');

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await apiClient.get(`/verification/files/${src}`, {
                    responseType: 'blob',
                });
                const url = URL.createObjectURL(response.data);
                setImageSrc(url);
            } catch (error) {
                console.error('Ошибка загрузки защищенного изображения', error);
            }
        };

        if (src) fetchImage();

        return () => {
            if (imageSrc) URL.revokeObjectURL(imageSrc);
        };
    }, [src]);

    if (!imageSrc) return <div className="animate-pulse bg-gray-200 w-full h-48 rounded-lg flex items-center justify-center">Загрузка...</div>;

    return <img src={imageSrc} className={className} alt={alt} />;
};