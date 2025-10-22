'use client';

import { useQuery } from '@tanstack/react-query';
import { getTodos, getHealth } from '@/lib/api';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Checkbox,
  Group,
  Badge,
} from '@mantine/core';
import { IconDatabase } from '@tabler/icons-react';
import { TodoForm } from './TodoForm';

export function TodoList() {
  const {
    data: todos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  });

  // Fetch database info
  const { data: healthData } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: typeof window !== 'undefined', // Only fetch on client-side
  });

  const databaseType = healthData?.database?.type || 'Loading...';
  const databaseHost = healthData?.database?.host || 'unknown';
  const isAzureDB = healthData?.database?.managed === true;

  if (isLoading) return <Text>Loading todos...</Text>;
  if (error) return <Text c={'red'}>Error loading todos</Text>;

  return (
    <Container size={'sm'} py={'xl'}>
      <Title order={1} mb={'xs'}>
        My Todos
      </Title>

      {/* Database Info */}
      <Group gap={'xs'} mb={'lg'}>
        <Text size={'sm'} c={'dimmed'}>
          Using:
        </Text>
        <IconDatabase size={16} />
        <Badge color={isAzureDB ? 'blue' : 'gray'} variant={'light'} size={'sm'}>
          {databaseType}
        </Badge>
        <Text size={'xs'} c={'dimmed'}>
          ({databaseHost})
        </Text>
      </Group>

      <TodoForm />

      <Stack gap={'md'} mt={'xl'}>
        {todos?.length === 0 ? (
          <Text c={'dimmed'}>No todos yet. Create one!</Text>
        ) : (
          todos?.map((todo) => (
            <Card key={todo.id} shadow={'sm'} padding={'lg'} radius={'md'} withBorder>
              <Checkbox label={todo.title} checked={todo.completed} readOnly />
            </Card>
          ))
        )}
      </Stack>
    </Container>
  );
}
