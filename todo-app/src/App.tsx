import { useState } from 'react';
import { useTodos } from './hooks/useTodos';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';
import { TodoFooter } from './components/TodoFooter';
import { GoGame } from './go-game/GoGame';
import styles from './App.module.css';

type AppTab = 'todo' | 'go';

function App() {
  const [tab, setTab] = useState<AppTab>('go');
  const { todos, addTodo, toggleTodo, deleteTodo, completedCount } = useTodos();

  return (
    <div>
      {/* Navigation */}
      <nav className={styles.nav}>
        <button
          className={`${styles.navBtn} ${tab === 'go' ? styles.navBtnActive : ''}`}
          onClick={() => setTab('go')}
        >
          🎲 囲碁ゲーム
        </button>
        <button
          className={`${styles.navBtn} ${tab === 'todo' ? styles.navBtnActive : ''}`}
          onClick={() => setTab('todo')}
        >
          📝 Todo
        </button>
      </nav>

      {tab === 'go' && <GoGame />}

      {tab === 'todo' && (
        <div className={styles.container}>
          <h1 className={styles.title}>Todo</h1>
          <TodoForm onAdd={addTodo} />
          <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
          <TodoFooter total={todos.length} completedCount={completedCount} />
        </div>
      )}
    </div>
  );
}

export default App;
