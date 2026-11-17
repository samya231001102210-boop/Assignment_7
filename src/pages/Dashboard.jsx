
import { useTasks } from "../context/TaskContext";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { tasks } = useTasks();
  const { user, token } = useAuth();

  const total = tasks.length;
  const raised = tasks.filter((t) => t.status === "Raised").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;
  const completed = tasks.filter((t) => t.status === "Closed").length;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your Task Manager Dashboard.</p>

      <div className="session-card">
        <h3>Session (JWT Simulation)</h3>
        <p>
          Logged in as <strong>{user.username}</strong>
        </p>
        <p>Issued: {new Date(user.iat * 1000).toLocaleString()}</p>
        <p>Expires: {new Date(user.exp * 1000).toLocaleString()}</p>
        <code className="token">{token}</code>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <h1>{total}</h1>
        </div>

        <div className="stat-card">
          <h3>Raised Tasks</h3>
          <h1>{raised}</h1>
        </div>

        <div className="stat-card">
          <h3>Pending Tasks</h3>
          <h1>{pending}</h1>
        </div>

        <div className="stat-card">
          <h3>Completed Tasks</h3>
          <h1>{completed}</h1>
        </div>
      </div>

      <Link to="/add-task" className="add-btn">
        + Add New Task
      </Link>

      <h2>Recent Tasks</h2>

      {tasks.slice(-5).reverse().map((task) => (
        <div className="task-card" key={task.id}>
          <Link to={`/tasks/${task.id}`}>
            {task.title}
          </Link>
          <span className={`status ${task.status.toLowerCase()}`}>
            {task.status}
          </span>
        </div>
      ))}

      {tasks.length === 0 && <p>No tasks available.</p>}
    </div>
  );
};

export default Dashboard;
