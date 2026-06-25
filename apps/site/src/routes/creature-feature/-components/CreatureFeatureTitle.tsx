interface CreatureFeatureTitleProps {
  className?: string;
}

export function CreatureFeatureTitle({ className }: CreatureFeatureTitleProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className ?? ""}`}>
      <p className="font-serif text-lg italic tracking-[0.16em] text-[#ff5b51]/45 md:text-2xl">
        featuring
      </p>
      <h2 className="mt-4 font-serif text-[15vw] leading-[0.82] font-semibold tracking-[0.08em] text-[#ff5b51] md:mt-5 md:text-[9vw]">
        THE CREATURE
      </h2>
    </div>
  );
}
