import type { Todo } from "../types/todo";
import styles from "./TodoItem.module.css";

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <li className={`${styles.item} ${todo.completed ? styles.completed : ""}`}>
      <label className={styles.label}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <span className={styles.title}>{todo.title}</span>
      </label>
      <button
        className={styles.deleteButton}
        onClick={() => onDelete(todo.id)}
        aria-label={`${todo.title}を削除`}
      >
        &times;
      </button>
    </li>
  );
}
