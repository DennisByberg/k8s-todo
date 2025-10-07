'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TextInput, Button, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { createTodo } from '@/lib/api';

export function TodoForm() {
  const [title, setTitle] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTodo,
    // Success
    onSuccess: () => {
      // Refetch todos after creating new one
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setTitle('');
      notifications.show({
        title: 'Success',
        message: 'Todo created successfully',
        color: 'green',
      });
    },
    // Error
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to create todo',
        color: 'red',
      });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      mutation.mutate({ title: title.trim(), completed: false });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={'md'}>
        <TextInput
          placeholder={'What needs to be done?'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size={'lg'}
        />
        <Button type={'submit'} loading={mutation.isPending} size={'lg'}>
          Add Todo
        </Button>
      </Stack>
    </form>
  );
}
