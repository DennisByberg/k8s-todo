'use client';

import { useQuery } from '@tanstack/react-query';
import { getTodos } from '@/lib/api';
import { Container, Title, Text, Stack, Card, Checkbox } from '@mantine/core';

export function TodoList() {
  const {
    data: todos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  });

  if (isLoading) return <Text>Loading todos...</Text>;
  if (error) return <Text c="red">Error loading todos</Text>;

  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="lg">
        My Todos
      </Title>

      {todos?.length === 0 ? (
        <Text c="dimmed">No todos yet. Create one!</Text>
      ) : (
        <Stack gap="md">
          {todos?.map((todo) => (
            <Card key={todo.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Checkbox label={todo.title} checked={todo.completed} readOnly />
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
