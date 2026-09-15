"use client";

import { useState } from "react";
import styles from "./StarRating.module.css";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export default function StarRating({ value, onChange }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className={styles.stars} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((estrela) => {
        const preenchida = estrela <= (hover || value);
        return (
          <button
            type="button"
            key={estrela}
            className={`${styles.star} ${preenchida ? styles.starPreenchida : ""}`}
            onMouseEnter={() => setHover(estrela)}
            onClick={() => onChange(estrela)}
            aria-label={`${estrela} de 5 estrelas`}
          >
            <svg viewBox="0 0 24 24" fill={preenchida ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
              <path
                d="m12 3.5 2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
