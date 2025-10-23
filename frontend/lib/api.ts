// Use relative URL when in production (same domain via Ingress)
// Use localhost when in development (port-forwarding)
const API_URL =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '' // Empty string = relative URL (uses same domain)
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

export interface UpdateTodoData {
  completed: boolean;
}

export interface HealthResponse {
  status: string;
  database: {
    type: string;
    managed: boolean;
    host: string;
  };
}

// Fetch health check (includes database info)
export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) throw new Error('Failed to fetch health');

  return response.json();
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

// Update todo
export async function updateTodo(id: number, data: UpdateTodoData): Promise<Todo> {
  console.log('🔵 updateTodo called:', { id, data });
  console.log('🔵 API_URL:', API_URL);
  console.log('🔵 Full URL:', `${API_URL}/api/todos/${id}`);

  const response = await fetch(`${API_URL}/api/todos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  console.log('🔵 Response status:', response.status);
  console.log('🔵 Response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Update failed:', errorText);
    throw new Error('Failed to update todo');
  }

  const result = await response.json();
  console.log('✅ Update success:', result);

  return result;
}
