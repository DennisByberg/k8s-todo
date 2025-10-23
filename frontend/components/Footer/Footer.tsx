'use client';

import { useQuery } from '@tanstack/react-query';
import { getHealth, getTodos } from '@/lib/api';
import { Group, Badge, Text, Divider } from '@mantine/core';
import {
  IconDatabase,
  IconChecklist,
  IconClock,
  IconServer,
  IconBrandAzure,
} from '@tabler/icons-react';
import classes from './Footer.module.css';

export function Footer() {
  const { data: healthData } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 30000,
    enabled: typeof window !== 'undefined',
  });

  const { data: todos } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
    enabled: typeof window !== 'undefined',
  });

  const databaseHost = healthData?.database?.host || 'unknown';
  const isAzureDB = healthData?.database?.managed === true;

  const totalTodos = todos?.length || 0;
  const completedTodos = todos?.filter((todo) => todo.completed).length || 0;
  const completionRate =
    totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0';

  // Determine environment based on database host
  const isProduction = databaseHost.includes('azure.com');
  const environment = isProduction ? 'Azure (AKS)' : 'Local (Docker Desktop)';

  return (
    <div className={classes.footer}>
      <div className={classes.inner}>
        {/* Environment */}
        <Group gap={'xs'}>
          {isProduction ? (
            <IconBrandAzure size={18} stroke={1.5} />
          ) : (
            <IconServer size={18} stroke={1.5} />
          )}
          <Text size={'sm'} c={'dimmed'}>
            Environment:
          </Text>
        </Group>
        <Badge color={isProduction ? 'blue' : 'grape'} variant={'light'} size={'md'}>
          {environment}
        </Badge>

        <Divider orientation={'vertical'} />

        {/* Database Info */}
        <Group gap={'xs'}>
          <IconDatabase size={18} stroke={1.5} />
          <Text size={'sm'} c={'dimmed'}>
            Database:
          </Text>
        </Group>
        <Badge color={isAzureDB ? 'blue' : 'orange'} variant={'light'} size={'md'}>
          {isAzureDB ? 'Azure PostgreSQL' : 'In-Cluster'}
        </Badge>
        <Text size={'xs'} c={'dimmed'}>
          ({databaseHost})
        </Text>

        <Divider orientation={'vertical'} />

        {/* Todo Stats */}
        <Group gap={'xs'}>
          <IconChecklist size={18} stroke={1.5} />
          <Text size={'sm'} c={'dimmed'}>
            Tasks:
          </Text>
        </Group>
        <Badge color={'green'} variant={'light'} size={'md'}>
          {completedTodos}/{totalTodos}
        </Badge>
        <Text size={'xs'} c={'dimmed'}>
          ({completionRate}% done)
        </Text>

        <Divider orientation={'vertical'} />

        {/* App Version */}
        <Group gap={'xs'}>
          <IconClock size={18} stroke={1.5} />
          <Text size={'sm'} c={'dimmed'}>
            Version:
          </Text>
        </Group>
        <Badge color={'gray'} variant={'light'} size={'md'}>
          v.{appVersion}
        </Badge>
      </div>
    </div>
  );
}
