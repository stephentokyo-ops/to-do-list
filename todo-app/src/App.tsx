import { useTodos } from "./hooks/useTodos";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import { TodoFooter } from "./components/TodoFooter";
import styles from "./App.module.css";

function App() {
  const { todos, addTodo, toggleTodo, deleteTodo, completedCount } =
    useTodos();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Todo</h1>
      <TodoForm onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      <TodoFooter total={todos.length} completedCount={completedCount} />
    </div>
  );
}

export default App;
