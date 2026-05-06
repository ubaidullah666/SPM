/**
 * Seed script — demo NGO, volunteer, and sample projects.
 * Run: cd backend && npm run seed
 * Requires Postgres running and DATABASE_* or DATABASE_URL.
 */
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { NgoEntity } from './entities/ngo.entity';
import { ProjectEntity } from './entities/project.entity';

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;

  const common = {
    entities: [UserEntity, NgoEntity, ProjectEntity],
    synchronize: false,
  };

  const dataSource = databaseUrl
    ? new DataSource({
        type: 'postgres',
        url: databaseUrl,
        ...common,
      })
    : new DataSource({
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: Number.parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'social_impact',
        ...common,
      });

  await dataSource.initialize();
  const userRepo = dataSource.getRepository(UserEntity);
  const ngoRepo = dataSource.getRepository(NgoEntity);
  const projectRepo = dataSource.getRepository(ProjectEntity);

  const hash = async (plain: string) => bcrypt.hash(plain, 12);

  let volunteer = await userRepo.findOne({
    where: { email: 'volunteer@demo.com' },
  });
  if (!volunteer) {
    volunteer = userRepo.create({
      fullName: 'Demo Volunteer',
      email: 'volunteer@demo.com',
      password: await hash('demo123'),
      role: 'volunteer',
      skills: ['Teaching', 'Web Development'],
      bio: 'Demo account',
      isActive: true,
    });
    volunteer = await userRepo.save(volunteer);
    console.info('Created volunteer@demo.com / demo123');
  }

  let ngo = await ngoRepo.findOne({ where: { email: 'ngo@demo.com' } });
  if (!ngo) {
    ngo = ngoRepo.create({
      name: 'Demo NGO',
      email: 'ngo@demo.com',
      password: await hash('demo123'),
      description: 'Demo organization',
      websiteUrl: 'https://example.org',
      status: 'active',
    });
    ngo = await ngoRepo.save(ngo);
    console.info('Created ngo@demo.com / demo123');
  }

  const existingProjects = await projectRepo.count({
    where: { ngoId: ngo.id },
  });

  if (existingProjects === 0) {
    await projectRepo.save([
      projectRepo.create({
        ngoId: ngo.id,
        title: 'Rural Literacy Program',
        description:
          'Teach foundational reading and mathematics to primary students in underserved regions.',
        category: 'Education',
        requiredSkills: ['Teaching'],
        location: 'Remote-friendly',
        isRemote: true,
        volunteersNeeded: 15,
        status: 'open',
        volunteersAccepted: 0,
        totalApplications: 0,
        estimatedHours: 40,
        isActive: true,
      }),
      projectRepo.create({
        ngoId: ngo.id,
        title: 'Community Solar Workshop',
        description:
          'Hands-on sustainability workshop covering solar installations and carbon literacy.',
        category: 'Environment',
        requiredSkills: ['Teaching', 'Data Analysis'],
        location: 'Portland',
        isRemote: false,
        volunteersNeeded: 10,
        status: 'open',
        volunteersAccepted: 0,
        totalApplications: 0,
        estimatedHours: 24,
        isActive: true,
      }),
    ]);
    console.info('Created sample projects for Demo NGO.');
  }

  await dataSource.destroy();
  console.info('Seed complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
