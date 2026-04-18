import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Project } from '@/types'

export interface ConversionProject {
  architecture: Project
  civil?: Project
}

export interface ConversionStats {
  totalFinished: number
  convertedCount: number
  conversionRate: number
  potentialCount: number
}

export function useArchitectureToBuildConversion(picFilter?: string) {
  const { data: allArchitecture = [], isLoading: loadingArch } = useQuery({
    queryKey: ['projects-all-architecture'],
    queryFn: () =>
      pb.collection('projects').getFullList<Project>({
        filter: `type = 'architecture'`,
        expand: 'client,assignee',
        sort: '-created',
      }),
  })

  const { data: allCivil = [], isLoading: loadingCivil } = useQuery({
    queryKey: ['projects-all-civil'],
    queryFn: () =>
      pb.collection('projects').getFullList<Project>({
        filter: `type = 'civil'`,
        expand: 'client',
        sort: '-created',
      }),
  })

  const civilByClientId = new Map<string, Project>()
  for (const cp of allCivil) {
    if (!civilByClientId.has(cp.client)) {
      civilByClientId.set(cp.client, cp)
    }
  }

  const isDone = (status: string) => status === 'finish' || status === 'done'

  let architectureList = allArchitecture
  if (picFilter) {
    architectureList = allArchitecture.filter((p) => p.assignee === picFilter)
  }

  const converted: ConversionProject[] = []
  const potential: ConversionProject[] = []
  const notConverted: ConversionProject[] = []

  for (const arch of architectureList) {
    const civil = civilByClientId.get(arch.client)
    const finished = isDone(arch.status)
    const cancelled = arch.status === 'cancelled'

    if (cancelled) continue

    if (civil) {
      converted.push({ architecture: arch, civil })
    } else if (finished) {
      notConverted.push({ architecture: arch })
    } else {
      potential.push({ architecture: arch })
    }
  }

  const totalFinished = converted.length + notConverted.length
  const stats: ConversionStats = {
    totalFinished,
    convertedCount: converted.length,
    conversionRate:
      totalFinished > 0
        ? Math.round((converted.length / totalFinished) * 100)
        : 0,
    potentialCount: potential.length,
  }

  return {
    converted,
    potential,
    notConverted,
    stats,
    isLoading: loadingArch || loadingCivil,
  }
}
