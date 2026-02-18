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

    if (!imageSrc) return (
        <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center text-xs text-gray-400`}>
            Загрузка...
        </div>
    );

    return <img src={imageSrc} className={className} alt={alt} />;
};