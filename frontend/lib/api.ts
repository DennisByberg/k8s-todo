const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface CreateTodoData {
  title: string;
  completed: boolean;
}

// Fetch all todos
export async function getTodos(): Promise<Todo[]> {
  const response = await fetch(`${API_URL}/api/todos`);

  if (!response.ok) throw new Error('Failed to fetch todos');

  return response.json();
}

// Create new todo
export async function createTodo(data: CreateTodoData): Promise<Todo> {
  const response = await fetch(`${API_URL}/api/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to create todo');

  return response.json();
}
