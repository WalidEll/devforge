"use client";

import { useState, useMemo } from "react";
import type { Tutorial, TutorialCategory, TutorialDifficulty } from "@/lib/tutorials";
import { tutorialCategories } from "@/lib/tutorials";
import TutorialCard from "./TutorialCard";

interface TutorialSearchProps {
  tutorials: Tutorial[];
}

export default function TutorialSearch({ tutorials }: TutorialSearchProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TutorialCategory | "all">("all");
  const [difficulty, setDifficulty] = useState<TutorialDifficulty | "all">("all");

  const filtered = useMemo(() => {
    return tutorials.filter((t) => {
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q));
      const matchesCategory = category === "all" || t.category === category;
      const matchesDifficulty = difficulty === "all" || t.difficulty === difficulty;
      return matchesQuery && matchesCategory && matchesDifficulty;
    });
  }, [tutorials, query, category, difficulty]);

  const categoryKeys = Object.keys(tutorialCategories) as TutorialCategory[];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search tutorials... (e.g. docker, ssh, sql joins)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TutorialCategory | "all")}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          <option value="all">All Categories</option>
          {categoryKeys.map((key) => (
            <option key={key} value={key}>
              {tutorialCategories[key].label}
            </option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as TutorialDifficulty | "all")}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-white">No tutorials found</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} tutorial{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tutorial) => (
              <TutorialCard key={tutorial.slug} tutorial={tutorial} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
