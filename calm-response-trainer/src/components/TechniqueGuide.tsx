import { useState } from "react";
import { techniques } from "../data/techniques";
import styles from "./TechniqueGuide.module.css";

export function TechniqueGuide() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>冷静に返すためのテクニック集</h3>
      <ul className={styles.list}>
        {techniques.map((t) => (
          <li key={t.id} className={styles.item}>
            <button
              type="button"
              className={styles.itemHeader}
              onClick={() => setOpenId((cur) => (cur === t.id ? null : t.id))}
            >
              {t.title}
              <span>{openId === t.id ? "－" : "＋"}</span>
            </button>
            {openId === t.id && (
              <div className={styles.itemBody}>
                <p>{t.description}</p>
                <p className={styles.example}>例: {t.example}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
