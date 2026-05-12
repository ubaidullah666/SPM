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

  // ======== VOLUNTEERS ========
  const volunteers = [
    {
      fullName: 'Demo Volunteer',
      email: 'volunteer@demo.com',
      password: 'demo123',
      skills: ['Teaching', 'Web Development'],
      bio: 'Demo account for testing',
      location: 'San Francisco, CA',
    },
    {
      fullName: 'Sarah Johnson',
      email: 'sarah.j@demo.com',
      password: 'demo123',
      skills: ['Teaching', 'Community Organizing'],
      bio: 'Passionate about education and youth development',
      location: 'New York, NY',
    },
    {
      fullName: 'Michael Chen',
      email: 'michael.c@demo.com',
      password: 'demo123',
      skills: ['Data Analysis', 'Web Development'],
      bio: 'Tech enthusiast looking to give back',
      location: 'Seattle, WA',
    },
    {
      fullName: 'Emma Rodriguez',
      email: 'emma.r@demo.com',
      password: 'demo123',
      skills: ['Environmental Science', 'Project Management'],
      bio: 'Environmental activist and organizer',
      location: 'Portland, OR',
    },
    {
      fullName: 'James Park',
      email: 'james.p@demo.com',
      password: 'demo123',
      skills: ['Healthcare', 'Community Support'],
      bio: 'Healthcare professional committed to community health',
      location: 'Los Angeles, CA',
    },
  ];

  for (const vol of volunteers) {
    const existing = await userRepo.findOne({ where: { email: vol.email } });
    if (!existing) {
      await userRepo.save(
        userRepo.create({
          fullName: vol.fullName,
          email: vol.email,
          password: await hash(vol.password),
          role: 'volunteer',
          skills: vol.skills,
          bio: vol.bio,
          location: vol.location,
          isActive: true,
        }),
      );
      console.info(`✓ Created volunteer: ${vol.email}`);
    }
  }

  // ======== NGOs ========
  const ngos = [
    {
      name: 'Demo NGO',
      email: 'ngo@demo.com',
      password: 'demo123',
      description: 'Demo organization for testing platform features',
      websiteUrl: 'https://example.org',
    },
    {
      name: 'Global Education Initiative',
      email: 'education@demo.com',
      password: 'demo123',
      description:
        'Non-profit focused on providing quality education to underserved communities worldwide',
      websiteUrl: 'https://globaleducation.org',
    },
    {
      name: 'Clean Earth Coalition',
      email: 'environment@demo.com',
      password: 'demo123',
      description:
        'Working to protect the environment through education, advocacy, and community action',
      websiteUrl: 'https://cleanearthcoalition.org',
    },
    {
      name: 'Community Health Network',
      email: 'health@demo.com',
      password: 'demo123',
      description:
        'Improving health outcomes and access to healthcare in underprivileged areas',
      websiteUrl: 'https://communityhealthnetwork.org',
    },
  ];

  const ngoMap = new Map<string, NgoEntity>();

  for (const ngoData of ngos) {
    const existing = await ngoRepo.findOne({ where: { email: ngoData.email } });
    if (existing) {
      ngoMap.set(ngoData.email, existing);
    } else {
      const ngo = await ngoRepo.save(
        ngoRepo.create({
          name: ngoData.name,
          email: ngoData.email,
          password: await hash(ngoData.password),
          description: ngoData.description,
          websiteUrl: ngoData.websiteUrl,
          status: 'active',
          isVerified: true,
        }),
      );
      ngoMap.set(ngoData.email, ngo);
      console.info(`✓ Created NGO: ${ngoData.email}`);
    }
  }

  // ======== PROJECTS ========
  const projectsData = [
    {
      ngoEmail: 'ngo@demo.com',
      title: 'Rural Literacy Program',
      description:
        'Teach foundational reading and mathematics to primary students in underserved regions. Help bridge the education gap and empower young minds.',
      category: 'Education',
      requiredSkills: ['Teaching', 'Community Organizing'],
      location: 'Remote-friendly',
      isRemote: true,
      volunteersNeeded: 15,
      estimatedHours: 40,
    },
    {
      ngoEmail: 'ngo@demo.com',
      title: 'Community Solar Workshop',
      description:
        'Hands-on sustainability workshop covering solar installations and carbon literacy. Learn renewable energy while helping communities transition to clean energy.',
      category: 'Environment',
      requiredSkills: ['Environmental Science', 'Project Management'],
      location: 'Portland, OR',
      isRemote: false,
      volunteersNeeded: 10,
      estimatedHours: 24,
    },
    {
      ngoEmail: 'education@demo.com',
      title: 'STEM Tutoring Initiative',
      description:
        'Provide one-on-one STEM tutoring to underrepresented high school students. Build the next generation of scientists and engineers.',
      category: 'Education',
      requiredSkills: ['Teaching', 'Web Development'],
      location: 'New York, NY',
      isRemote: true,
      volunteersNeeded: 20,
      estimatedHours: 50,
    },
    {
      ngoEmail: 'education@demo.com',
      title: 'Digital Literacy for Seniors',
      description:
        'Help senior citizens learn basic computer skills, internet navigation, and online safety. Bridge the digital divide in your community.',
      category: 'Education',
      requiredSkills: ['Teaching', 'Patience'],
      location: 'Various Cities',
      isRemote: false,
      volunteersNeeded: 8,
      estimatedHours: 30,
    },
    {
      ngoEmail: 'environment@demo.com',
      title: 'Coastal Cleanup Campaign',
      description:
        'Join our team to clean up local beaches and waterways. Help protect marine life and reduce ocean pollution through direct environmental action.',
      category: 'Environment',
      requiredSkills: ['Physical Work', 'Community Organizing'],
      location: 'San Francisco, CA',
      isRemote: false,
      volunteersNeeded: 25,
      estimatedHours: 16,
    },
    {
      ngoEmail: 'environment@demo.com',
      title: 'Reforestation Project',
      description:
        'Help us plant and nurture thousands of trees in deforested areas. Make a lasting environmental impact by contributing to forest restoration.',
      category: 'Environment',
      requiredSkills: ['Environmental Science', 'Physical Work'],
      location: 'Multiple locations',
      isRemote: false,
      volunteersNeeded: 30,
      estimatedHours: 20,
    },
    {
      ngoEmail: 'health@demo.com',
      title: 'Health Awareness Outreach',
      description:
        'Organize and participate in health awareness campaigns in underserved neighborhoods. Share knowledge about preventive health and wellness.',
      category: 'Healthcare',
      requiredSkills: ['Healthcare', 'Community Support'],
      location: 'Los Angeles, CA',
      isRemote: false,
      volunteersNeeded: 12,
      estimatedHours: 35,
    },
    {
      ngoEmail: 'health@demo.com',
      title: 'Mental Health Support Network',
      description:
        'Support our mental health initiatives by helping organize support groups and wellness programs in the community.',
      category: 'Healthcare',
      requiredSkills: ['Community Support'],
      location: 'Remote-friendly',
      isRemote: true,
      volunteersNeeded: 15,
      estimatedHours: 25,
    },
  ];

  for (const projData of projectsData) {
    const ngo = ngoMap.get(projData.ngoEmail);
    if (!ngo) continue;

    const existingCount = await projectRepo.countBy({ title: projData.title });
    if (existingCount === 0) {
      await projectRepo.save(
        projectRepo.create({
          ngoId: ngo.id,
          title: projData.title,
          description: projData.description,
          category: projData.category,
          requiredSkills: projData.requiredSkills,
          location: projData.location,
          isRemote: projData.isRemote,
          volunteersNeeded: projData.volunteersNeeded,
          volunteersAccepted: 0,
          totalApplications: 0,
          estimatedHours: projData.estimatedHours,
          status: 'open',
          isActive: true,
        }),
      );
      console.info(`✓ Created project: ${projData.title}`);
    }
  }

  await dataSource.destroy();
  console.info('\n✅ Seed complete! Database populated with test data.');
  console.info('\nDemo Accounts:');
  console.info('Volunteer: volunteer@demo.com / demo123');
  console.info('NGO: ngo@demo.com / demo123');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
