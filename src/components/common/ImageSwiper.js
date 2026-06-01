import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { RiImageAddLine } from "react-icons/ri";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ImageSwiper = ({
  images = [],
  className = "",
  altPrefix = "image",
  fallbackText = "No image",
  showNavigation = true,
  showPagination = true,
  topContent,
  bottomContent,
  imageClassName = "",

  onSlideChange   
}) => {
  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {images?.length ? (
        <Swiper
          modules={[Navigation, Pagination]}
          navigation={showNavigation}
          pagination={showPagination ? { clickable: true } : false}
          loop={images.length > 1}
           onSlideChange={onSlideChange}
          className="h-full w-full"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full w-full group">
                {image?.url ? (
                  <img
                    src={image.url}
                    alt={image?.alt || `${altPrefix}-${index + 1}`}
                    className={`h-full w-full object-cover ${imageClassName}`}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                    <RiImageAddLine className="text-3xl" />
                    <span className="mt-1 text-xs">{fallbackText}</span>
                  </div>
                )}

                {topContent && topContent(index, image)}
                {bottomContent && bottomContent(index, image)}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
          <RiImageAddLine className="text-3xl" />
          <span className="mt-1 text-xs">{fallbackText}</span>
        </div>
      )}
    </div>
  );
};

export default ImageSwiper;