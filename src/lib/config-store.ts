import { prisma } from './prisma';

export async function getSystemConfig(): Promise<{ enabled: boolean }> {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 'system' } });
    return config ?? { enabled: true };
  } catch {
    return { enabled: true };
  }
}

export async function setSystemConfig(config: { enabled: boolean }): Promise<void> {
  await prisma.systemConfig.upsert({
    where: { id: 'system' },
    update: { enabled: config.enabled },
    create: { id: 'system', enabled: config.enabled },
  });
}
