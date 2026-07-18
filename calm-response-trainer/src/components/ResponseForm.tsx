import { useState } from "react";
import styles from "./ResponseForm.module.css";

interface Props {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export function ResponseForm({ onSubmit, disabled }: Props) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="この発言に、あなたならどう返しますか？"
        rows={4}
        disabled={disabled}
      />
      <button type="submit" className={styles.button} disabled={disabled}>
        この返答で診断する
      </button>
    </form>
  );
}
