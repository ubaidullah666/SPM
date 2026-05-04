/**
 * Seed script — creates demo accounts and sample projects.
 * Run with: npx ts-node src/seed.ts
 */
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/social-impact';

const UserSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String,
  bio: String, skills: [String], totalHours: Number, impactScore: Number,
  organizationName: String, isActive: Boolean,
}, { timestamps: true });

const ProjectSchema = new mongoose.Schema({
  title: String, description: String, category: String,
  ngoId: mongoose.Schema.Types.ObjectId, ngoName: String,
  requiredSkills: [String], location: String, isRemote: Boolean,
  status: String, volunteersNeeded: Number, volunteersAccepted: Number,
  estimatedHours: Number, totalApplications: Number, isActive: Boolean,
}, { timestamps: true });

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const User = mongoose.model('User', UserSchema);
  const Project = mongoose.model('Project', ProjectSchema);

  // Clear existing
  await User.deleteMany({});
  await Project.deleteMany({});

  const hash = (pw: string) => bcrypt.hash(pw, 12);

  // Create demo users
  const [vol1, vol2, ngo1, ngo2] = await User.insertMany([
    {
      name: 'Alex Johnson', email: 'volunteer@demo.com',
      password: await hash('demo123'), role: 'volunteer',
      bio: 'Passionate about education and technology',
      skills: ['Teaching', 'Web Development', 'Design'],
      totalHours: 45, impactScore: 450, isActive: true,
    },
    {
      name: 'Maria Garcia', email: 'maria@demo.com',
      password: await hash('demo123'), role: 'volunteer',
      bio: 'Environmental activist and data analyst',
      skills: ['Data Analysis', 'Marketing', 'Writing'],
      totalHours: 30, impactScore: 300, isActive: true,
    },
    {
      name: 'Green Earth Foundation', email: 'ngo@demo.com',
      password: await hash('demo123'), role: 'ngo',
      organizationName: 'Green Earth Foundation',
      bio: 'Fighting climate change through community action',
      isActive: true,
    },
    {
      name: 'EduReach NGO', email: 'edureach@demo.com',
      password: await hash('demo123'), role: 'ngo',
      organizationName: 'EduReach NGO',
      bio: 'Bringing quality education to underserved communities',
      isActive: true,
    },
  ]);

  // Create sample projects
  await Project.insertMany([
    {
      title: 'Digital Literacy Program for Rural Schools',
      description: 'Help us teach basic computer skills and internet safety to students in rural areas. Volunteers will create lesson plans and conduct weekly online sessions.',
      category: 'Education',
      ngoId: ngo2._id, ngoName: 'EduReach NGO',
      requiredSkills: ['Teaching', 'Web Development'],
      location: 'Remote', isRemote: true,
      status: 'open', volunteersNeeded: 10, volunteersAccepted: 3,
      estimatedHours: 40, totalApplications: 8, isActive: true,
    },
    {
      title: 'Urban Tree Planting Initiative',
      description: 'Join our weekend tree planting drives across the city. Help restore green cover and educate communities about environmental conservation.',
      category: 'Environment',
      ngoId: ngo1._id, ngoName: 'Green Earth Foundation',
      requiredSkills: ['Community Organizing'],
      location: 'New York, USA', isRemote: false,
      status: 'open', volunteersNeeded: 50, volunteersAccepted: 12,
      estimatedHours: 20, totalApplications: 25, isActive: true,
    },
    {
      title: 'Mental Health Awareness Campaign',
      description: 'Create social media content and organize webinars to raise awareness about mental health. We need writers, designers, and social media experts.',
      category: 'Health',
      ngoId: ngo1._id, ngoName: 'Green Earth Foundation',
      requiredSkills: ['Writing', 'Design', 'Marketing'],
      location: 'Remote', isRemote: true,
      status: 'open', volunteersNeeded: 8, volunteersAccepted: 2,
      estimatedHours: 30, totalApplications: 15, isActive: true,
    },
    {
      title: 'Open Source Healthcare App',
      description: 'Build a mobile app to help rural clinics manage patient records. Looking for React Native developers and UX designers.',
      category: 'Technology',
      ngoId: ngo2._id, ngoName: 'EduReach NGO',
      requiredSkills: ['Web Development', 'Design', 'Data Analysis'],
      location: 'Remote', isRemote: true,
      status: 'ongoing', volunteersNeeded: 5, volunteersAccepted: 5,
      estimatedHours: 100, totalApplications: 20, isActive: true,
    },
    {
      title: 'Food Bank Distribution Network',
      description: 'Help coordinate food distribution to families in need. Volunteers assist with sorting, packing, and delivering food packages every Saturday.',
      category: 'Community',
      ngoId: ngo1._id, ngoName: 'Green Earth Foundation',
      requiredSkills: ['Community Organizing'],
      location: 'Los Angeles, USA', isRemote: false,
      status: 'open', volunteersNeeded: 30, volunteersAccepted: 8,
      estimatedHours: 15, totalApplications: 18, isActive: true,
    },
    {
      title: 'Youth Photography Workshop',
      description: 'Teach photography skills to underprivileged youth aged 12-18. Help them express themselves through art and build a portfolio.',
      category: 'Arts',
      ngoId: ngo2._id, ngoName: 'EduReach NGO',
      requiredSkills: ['Photography', 'Teaching'],
      location: 'Chicago, USA', isRemote: false,
      status: 'open', volunteersNeeded: 4, volunteersAccepted: 1,
      estimatedHours: 25, totalApplications: 6, isActive: true,
    },
  ]);

  console.log('✅ Seed complete!');
  console.log('Demo accounts:');
  console.log('  Volunteer: volunteer@demo.com / demo123');
  console.log('  NGO:       ngo@demo.com / demo123');
  await mongoose.disconnect();
}

seed().catch(console.error);
