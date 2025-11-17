import { sampleTasks } from "@/lib/tasks";

export default function Home() {
  return (
    <main className="ff-container">
      <h1>Fleas & Frogs 🐸</h1>
      <p>Your local-first planner for clearing fleas and tackling frogs.</p>

      <section className="ff-section">
        <h2>Sample tasks</h2>
        <ul className="ff-task-list">
          {sampleTasks.map((task) => (
            <li key={task.id} className={`ff-task ff-task--${task.type}`}>
              <span className="ff-task-type">
                {task.type === "flea" ? "🪳 Flea" : "🐸 Frog"}
              </span>
              <span>{task.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
