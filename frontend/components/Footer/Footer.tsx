'use client';

import { useQuery } from '@tanstack/react-query';
import { getHealth } from '@/lib/api';
import { Group, Badge, Text } from '@mantine/core';
import { IconDatabase } from '@tabler/icons-react';
import classes from './Footer.module.css';

export function Footer() {
  const { data: healthData } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 30000,
    enabled: typeof window !== 'undefined',
  });

  const databaseType = healthData?.database?.type || 'Loading...';
  const databaseHost = healthData?.database?.host || 'unknown';
  const isAzureDB = healthData?.database?.managed === true;

  return (
    <div className={classes.footer}>
      <div className={classes.inner}>
        <Group gap={'xs'}>
          <IconDatabase size={18} stroke={1.5} />
          <Text size={'sm'} c={'dimmed'}>
            Database:
          </Text>
        </Group>

        <Badge color={isAzureDB ? 'blue' : 'orange'} variant={'light'} size={'md'}>
          {databaseType}
        </Badge>

        <Text size={'xs'} c={'dimmed'}>
          ({databaseHost})
        </Text>
      </div>
    </div>
  );
}
