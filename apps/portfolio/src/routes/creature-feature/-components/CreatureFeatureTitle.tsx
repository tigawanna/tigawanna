interface CreatureFeatureTitleProps {
  className?: string;
}

export function CreatureFeatureTitle({ className }: CreatureFeatureTitleProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className ?? ""}`}>
      <p className="font-serif text-xl italic tracking-[0.18em] text-[#ff5b51]/45 md:text-3xl">
        Featuring:
      </p>
      <h2 className="mt-4 font-serif text-[18vw] leading-[0.78] font-semibold tracking-[0.06em] text-[#ff5b51] md:mt-5 md:text-[13vw]">
        THE CREATURE
      </h2>
    </div>
  );
}
