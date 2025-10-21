'use client';

import { IconBrandGithub, IconHome, IconCheckbox } from '@tabler/icons-react';
import {
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Group,
  ScrollArea,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './HeaderMegaMenu.module.css';

export function HeaderMegaMenu() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);

  return (
    <Box>
      <header className={classes.header}>
        <Group justify={'space-between'} h={'100%'}>
          <a href={'#'} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Group gap={'xs'}>
              <IconCheckbox size={30} stroke={1.5} />
              <Text size={'xl'} fw={700}>
                Todo App [v.0.0.1]
              </Text>
            </Group>
          </a>

          <Group h={'100%'} gap={0} visibleFrom={'sm'}>
            <a href={'#'} className={classes.link}>
              <Group gap={'xs'}>
                <IconHome size={20} />
                Home
              </Group>
            </a>
            <a
              href={'https://github.com/DennisByberg/k8s-todo'}
              target={'_blank'}
              rel={'noopener noreferrer'}
              className={classes.link}
            >
              <Group gap={'xs'}>
                <IconBrandGithub size={20} />
                GitHub
              </Group>
            </a>
          </Group>

          <Group visibleFrom={'sm'}>
            <Button variant={'default'} onClick={() => {}}>
              Log in
            </Button>
            <Button onClick={() => {}}>Sign up</Button>
          </Group>

          <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom={'sm'} />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size={'100%'}
        padding={'md'}
        hiddenFrom={'sm'}
        zIndex={1000000}
      >
        <ScrollArea h={'calc(100vh - 80px'} mx={'-md'}>
          <Divider my={'sm'} />

          <a href={'#'} className={classes.link} onClick={closeDrawer}>
            <Group gap={'xs'}>
              <IconHome size={20} />
              Home
            </Group>
          </a>
          <a
            href={'https://github.com/DennisByberg/k8s-todo'}
            target={'_blank'}
            rel={'noopener noreferrer'}
            className={classes.link}
            onClick={closeDrawer}
          >
            <Group gap={'xs'}>
              <IconBrandGithub size={20} />
              GitHub
            </Group>
          </a>

          <Divider my={'sm'} />

          <Group justify={'center'} grow pb={'xl'} px={'md'}>
            <Button variant={'default'} onClick={() => {}}>
              Log in
            </Button>
            <Button onClick={() => {}}>Sign up</Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
