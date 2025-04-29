"use client";

import { TechIcons } from "@/components/icons/tech";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { SectionHeader } from "../../../shared/SectionHeader";

interface FilterByTopicsProps {
  topics: string[];
}

export function FilterByTopics({ topics }: FilterByTopicsProps) {
  const [uniqueTopics, setUniqueTopics] = useState(["featured", ...topics]);
  const [topic, setTopic] = useQueryState("topic", { defaultValue: "all" });

  if (!topics || topics.length === 0) {
    return null;
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
      <SectionHeader heading="Technologies" id="tech" />
      <p className="text-sm text-base-content/80">select a technology to filter-by</p>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {uniqueTopics.map((item) => {
          if (item === topic) {
            return (
              <button
                key={topic}
                className={`btn btn-secondary btn-sm   font-semibold`}
                onClick={() => {
                  setTopic(item);
                }}>
                {item}
                {TechIcons.map((tech) => {
                  if (tech.name.toLowerCase().includes(item.toLowerCase())) {
                    return <tech.icon key={tech.name} className="h-5 w-5" />;
                  }
                  return null;
                })}
              </button>
            );
          }
          return (
            <button
              key={item}
              className={`btn btn-secondary btn-sm btn-outline  font-semibold`}
              onClick={() => {
                setTopic(item);
              }}>
              {item}
              {TechIcons.map((tech) => {
                if (tech.name.toLowerCase().includes(item.toLowerCase())) {
                  return <tech.icon key={tech.name} className="h-5 w-5" />;
                }
                return null;
              })}
            </button>
          );
        })}
      </div>
    </div>
  );
}
