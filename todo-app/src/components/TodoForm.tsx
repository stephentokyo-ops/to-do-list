import { useState } from "react";
import styles from "./TodoForm.module.css";

interface Props {
  onAdd: (title: string) => void;
}

export function TodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="新しいTodoを入力..."
      />
      <button className={styles.button} type="submit">
        追加
      </button>
    </form>
  );
}
