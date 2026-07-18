import type { CategoryFilter as CategoryFilterType } from "../hooks/useTrainer";
import { CATEGORY_LABELS } from "../utils/labels";
import styles from "./CategoryFilter.module.css";

interface Props {
  value: CategoryFilterType;
  onChange: (value: CategoryFilterType) => void;
}

export function CategoryFilter({ value, onChange }: Props) {
  return (
    <label className={styles.wrapper}>
      シチュエーション
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value as CategoryFilterType)}
      >
        <option value="all">すべて</option>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
