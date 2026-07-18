import { useEffect, useRef, useState } from "react";
import styles from "./BreathTimer.module.css";

const DURATION = 6;

export function BreathTimer() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const start = () => {
    if (remaining !== null) return;
    setRemaining(DURATION);
    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.button}
        onClick={start}
        disabled={remaining !== null}
      >
        {remaining !== null ? `深呼吸中… ${remaining}` : "答える前に6秒深呼吸する"}
      </button>
      <p className={styles.hint}>
        怒りのピークは6秒ほどで過ぎるといわれています。返信前に一呼吸置きましょう。
      </p>
    </div>
  );
}
