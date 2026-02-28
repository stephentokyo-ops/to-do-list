import styles from "./TodoFooter.module.css";

interface Props {
  total: number;
  completedCount: number;
}

export function TodoFooter({ total, completedCount }: Props) {
  if (total === 0) return null;

  return (
    <div className={styles.footer}>
      全{total}件（完了: {completedCount}件）
    </div>
  );
}
