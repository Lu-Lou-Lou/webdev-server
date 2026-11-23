import type { Express, Request, Response } from "express";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  description?: string;
};

const todos: Todo[] = [
  { id: 1, title: "Task 1", completed: false },
  { id: 2, title: "Task 2", completed: true },
  { id: 3, title: "Task 3", completed: false },
  { id: 4, title: "Task 4", completed: true },
];

let lastCreatedId = 0;

function nextTodoId() {
  lastCreatedId = Math.max(Date.now(), lastCreatedId + 1);
  return lastCreatedId;
}

type TodoFields = Omit<Todo, "id">;

function isTodoUpdate(body: unknown): body is Partial<TodoFields> {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;

  const fields = Object.entries(body);
  return fields.length > 0 && fields.every(([key, value]) => {
    switch (key) {
      case "title":
        return typeof value === "string" && value.trim().length > 0;
      case "completed":
        return typeof value === "boolean";
      case "description":
        return typeof value === "string";
      default:
        return false;
    }
  });
}

export default function WorkingWithRemoteArrays(app: Express) {
  const getTodos = (req: Request, res: Response) => {
    const { completed } = req.query;
    if (completed === undefined) {
      res.json(todos);
      return;
    }
    if (completed !== "true" && completed !== "false") {
      res.status(400).json({ message: "Completed must be true or false" });
      return;
    }
    res.json(todos.filter((todo) => todo.completed === (completed === "true")));
  };

  const createNewTodo = (_req: Request, res: Response) => {
    todos.push({ id: nextTodoId(), title: "New Task", completed: false });
    res.json(todos);
  };

  const getTodoById = (req: Request<{ id: string }>, res: Response) => {
    const todo = todos.find((item) => String(item.id) === req.params.id);
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    res.json(todo);
  };

  const removeTodo = (req: Request<{ id: string }>, res: Response) => {
    const index = todos.findIndex((item) => String(item.id) === req.params.id);
    if (index === -1) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    todos.splice(index, 1);
    res.json(todos);
  };

  const updateTodoTitle = (req: Request<{ id: string; title: string }>, res: Response) => {
    const { id, title } = req.params;
    const todo = todos.find((item) => String(item.id) === id);
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    todo.title = title;
    res.json(todos);
  };

  const updateTodoCompleted = (req: Request<{ id: string; completed: string }>, res: Response) => {
    const { id, completed } = req.params;
    const todo = todos.find((item) => String(item.id) === id);
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    if (completed !== "true" && completed !== "false") {
      res.status(400).json({ message: "Completed must be true or false" });
      return;
    }
    todo.completed = completed === "true";
    res.json(todos);
  };

  const updateTodoDescription = (req: Request<{ id: string; description: string }>, res: Response) => {
    const { id, description } = req.params;
    const todo = todos.find((item) => String(item.id) === id);
    if (!todo) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }
    todo.description = description;
    res.json(todos);
  };

  const postNewTodo = (req: Request<object, unknown, unknown>, res: Response) => {
    const body = req.body;
    if (!isTodoUpdate(body) || body.title === undefined || body.completed === undefined) {
      res.status(400).json({ message: "Provide a non-empty title, a boolean completed value, and an optional text description." });
      return;
    }
    const todo = { ...body, title: body.title, completed: body.completed, id: nextTodoId() };
    todos.push(todo);
    res.json(todo);
  };

  const deleteTodo = (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const index = todos.findIndex((item) => String(item.id) === id);
    if (index === -1) {
      res.status(404).json({ message: `Unable to delete Todo with ID ${id}` });
      return;
    }
    todos.splice(index, 1);
    res.sendStatus(200);
  };

  const updateTodo = (req: Request<{ id: string }, unknown, unknown>, res: Response) => {
    const { id } = req.params;
    const todo = todos.find((item) => String(item.id) === id);
    if (!todo) {
      res.status(404).json({ message: `Unable to update Todo with ID ${id}` });
      return;
    }
    if (!isTodoUpdate(req.body)) {
      res.status(400).json({ message: "Provide valid todo fields: title, completed, or description." });
      return;
    }
    Object.assign(todo, req.body);
    res.sendStatus(200);
  };

  app.get("/lab5/todos", getTodos);
  app.get("/lab5/todos/create", createNewTodo);
  app.get("/lab5/todos/:id", getTodoById);
  app.get("/lab5/todos/:id/delete", removeTodo);
  app.get("/lab5/todos/:id/title/:title", updateTodoTitle);
  app.get("/lab5/todos/:id/completed/:completed", updateTodoCompleted);
  app.get("/lab5/todos/:id/description/:description", updateTodoDescription);
  app.post("/lab5/todos", postNewTodo);
  app.delete("/lab5/todos/:id", deleteTodo);
  app.put("/lab5/todos/:id", updateTodo);
}
