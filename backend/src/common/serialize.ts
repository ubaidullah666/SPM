import type { ProjectEntity } from '../entities/project.entity';
import type { NgoEntity } from '../entities/ngo.entity';

export function stringId(id: number): string {
  return String(id);
}

export function serializeNgoSummary(ngo: NgoEntity | undefined | null): string {
  return ngo?.name ?? '';
}

export function serializeProject(
  p: ProjectEntity,
  ngoName?: string,
): Record<string, unknown> {
  const id = stringId(p.id);
  const name = ngoName ?? serializeNgoSummary(p.ngo);
  return {
    _id: id,
    id,
    title: p.title,
    description: p.description,
    category: p.category ?? '',
    ngoId: stringId(p.ngoId),
    ngoName: name,
    requiredSkills: p.requiredSkills ?? [],
    location: p.location ?? '',
    isRemote: p.isRemote,
    status: p.status,
    volunteersNeeded: p.volunteersNeeded,
    volunteersAccepted: p.volunteersAccepted,
    startDate: p.startDate,
    endDate: p.endDate,
    estimatedHours: p.estimatedHours,
    impactScore: 0,
    imageUrl: p.imageUrl ?? '',
    totalApplications: p.totalApplications,
    isActive: p.isActive,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export function serializeProjectBrief(p: ProjectEntity | null | undefined): Record<string, unknown> | null {
  if (!p) {
    return null;
  }
  const id = stringId(p.id);
  return {
    _id: id,
    id,
    title: p.title,
    category: p.category ?? '',
    status: p.status,
    ngoName: serializeNgoSummary(p.ngo),
    imageUrl: p.imageUrl ?? '',
  };
}
