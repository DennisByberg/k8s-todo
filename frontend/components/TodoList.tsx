'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodos, updateTodo } from '@/lib/api';
import { Container, Text, Stack, Card, Checkbox, Loader, Center } from '@mantine/core';
import { TodoForm } from './TodoForm';

export function TodoList() {
  const queryClient = useQueryClient();
  const {
    data: todos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  });

  // Sort todos by id
  const sortedTodos = todos?.sort((a, b) => a.id - b.id);

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      updateTodo(id, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const handleToggle = (id: number, currentCompleted: boolean) => {
    toggleMutation.mutate({ id, completed: !currentCompleted });
  };

  if (isLoading)
    return (
      <Center h={'50vh'}>
        <Loader size={'xl'} type={'dots'} />
      </Center>
    );

  if (error) return <Text c={'red'}>Error loading todos</Text>;

  return (
    <Container size={'xs'} py={'xl'}>
      <TodoForm />
      <Stack gap={'md'} mt={'xl'}>
        {sortedTodos?.length === 0 ? (
          <Text c={'dimmed'}>No todos yet. Create one!</Text>
        ) : (
          sortedTodos?.map((todo) => (
            <Card
              key={todo.id}
              shadow={'sm'}
              padding={'lg'}
              radius={'md'}
              withBorder
              style={{
                backgroundColor: todo.completed
                  ? 'rgba(0, 0, 0, 0.3)'
                  : 'rgba(0, 0, 0, 0.1)',
              }}
            >
              <Checkbox
                label={todo.title}
                checked={todo.completed}
                onChange={() => handleToggle(todo.id, todo.completed)}
                styles={{
                  input: {
                    cursor: 'pointer',
                  },
                  label: {
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    cursor: 'pointer',
                  },
                }}
              />
            </Card>
          ))
        )}
      </Stack>
    </Container>
  );
}
