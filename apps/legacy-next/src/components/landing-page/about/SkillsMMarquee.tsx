"use client";

import { techSkills } from "@/components/shared/container/site";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/pagination";

// Import required modules
import { Grid, Pagination, Autoplay } from "swiper/modules";

interface SkillsMMarqueeProps {
  className?: string;
}

export function SkillsMMarquee({ className }: SkillsMMarqueeProps) {
  return (
    <div className={`w-full py-8 ${className}`}>
      <Swiper
        slidesPerView={3}
        grid={{
          rows: 2,
        }}
        spaceBetween={30}
        pagination={{
          clickable: true,
        }}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: {
            slidesPerView: 4,
            grid: {
              rows: 2,
            },
          },
          768: {
            slidesPerView: 5,
            grid: {
              rows: 2,
            },
          },
          1024: {
            slidesPerView: 4,
            grid: {
              rows: 2,
            },
          },
        }}
        modules={[Grid, Pagination, Autoplay]}
        className="skills-swiper"
      >
        {techSkills.map((skill, index) => (
          <SwiperSlide key={`${skill}-${index}`} className="swiper-slide-skill">
            <div className="px-4 py-2 bg-base-content/10 rounded-full font-medium text-base-content flex items-center justify-center border border-primary/5 shadow-sm shadow-secondary/5 h-full w-full">
              {skill}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .skills-swiper {
          width: 100%;
          height: auto;
          padding-bottom: 50px !important;
        }

        .skills-swiper .swiper-wrapper {
          row-gap: 10px;
        }

        .skills-swiper .swiper-slide-skill {
          height: auto !important;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .skills-swiper .swiper-pagination {
          bottom: 0;
        }

        .skills-swiper .swiper-pagination-bullet-active {
          background-color: hsl(var(--p));
        }
      `}</style>
    </div>
  );
}
