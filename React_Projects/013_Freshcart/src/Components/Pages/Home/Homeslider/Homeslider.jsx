import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function Homeslider() {
  return (
    <div className="d-flex justify-content-center align-items-center mb-4">
      <style>{`/* make bullets look like lines instead of dots */
        .swiper {
          width: 100%;
          max-width: 1400px;
          border-radius: 18px;
        }
        .swiper-pagination-bullet {
          width: 20px;               /* length of the dash */
          height: 4px;               /* thickness */
          border-radius: 2px;        /* slightly rounded ends (set to 0 for sharp edges) */
          background-color: gray;    /* default color */
          opacity: 0.6;              /* lighter inactive */
        }
        .swiper-slide img {
          width: 80%;
          height: auto;
          max-height: 260px;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          object-fit: cover;
        }
        .swiper-pagination-bullet-active {
          background-color: black;   /* active color */
          opacity: 1;
        }
      `}</style>
      <Swiper
        modules={[Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        loop={true}
        grabCursor={true}
        pagination={{ clickable: true }}
      >
        <SwiperSlide>
          <img src={require('../../../../Assets/Images/Slider/slider-image-1.jpeg')} alt="slide1" />
        </SwiperSlide>
        <SwiperSlide>
          <img src={require('../../../../Assets/Images/Slider/slider-image-2.jpeg')} alt="slide2" />
        </SwiperSlide>
        <SwiperSlide>
          <img src={require('../../../../Assets/Images/Slider/slider-image-3.jpeg')} alt="slide3" />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
