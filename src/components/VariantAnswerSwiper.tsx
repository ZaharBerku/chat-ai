import { Swiper } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { FC, PropsWithChildren, Children, useState, useEffect } from "react";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import "swiper/css";
import "swiper/css/navigation";

interface VariantAnswerSwiperProps extends PropsWithChildren {
  activeSlide: number;
  setActiveSlide: (value: number) => void;
}

const VariantAnswerSwiper: FC<VariantAnswerSwiperProps> = ({
  children,
  setActiveSlide,
  activeSlide,
}) => {
  const [swiper, setSwiper] = useState<any>(null);
  const numberOfChildren = Children.count(children);
  useEffect(() => {
    if (activeSlide && swiper) {
      swiper.slideTo(activeSlide);
    }
  }, [activeSlide]);
  return (
    <div className="relative pb-4">
      <div className="flex gap-1 absolute -bottom-3 left-0 text-sm">
        <button className="prev-slide-button">
          <GoChevronLeft />
        </button>
        <div className="flex gap-0.5">
          <span>{activeSlide + 1}</span>
          <span>/</span>
          <span>{numberOfChildren}</span>
        </div>
        <button className="next-slide-button">
          <GoChevronRight />
        </button>
      </div>
      <Swiper
        initialSlide={activeSlide}
        modules={[Navigation, Pagination]}
        navigation={{
          nextEl: ".next-slide-button",
          prevEl: ".prev-slide-button",
        }}
        pagination={{ clickable: true }}
        onSwiper={setSwiper}
        onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
      >
        {children}
      </Swiper>
    </div>
  );
};

export default VariantAnswerSwiper;
