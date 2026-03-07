import sequelize from '../config/database';
import { User, Question } from '../models';
import { ALL_FLAT_QUESTIONS, USER_ROLES } from '../config/constants';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync database (create tables)
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created');

    // Seed Questions (all roles)
    console.log('📝 Seeding questions...');
    await Question.bulkCreate(ALL_FLAT_QUESTIONS);
    console.log(`✅ Created ${ALL_FLAT_QUESTIONS.length} questions across all roles`);

    // Seed Users
    console.log('👥 Seeding users...');

    // Create Admin
    await User.create({
      name: 'System Admin',
      email: 'admin@company.com',
      password: 'Admin@123',
      role: USER_ROLES.ADMIN
    });
    console.log('✅ Created admin user');

    // Create Managers
    const manager1 = await User.create({
      name: 'Bob Johnson',
      email: 'bob.johnson@company.com',
      password: 'Password@123',
      role: USER_ROLES.MANAGER
    });

    const manager2 = await User.create({
      name: 'Sarah Williams',
      email: 'sarah.williams@company.com',
      password: 'Password@123',
      role: USER_ROLES.MANAGER
    });
    console.log('✅ Created 2 managers');

    // Create Tech Leads
    const techLead1 = await User.create({
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      password: 'Password@123',
      role: USER_ROLES.TECH_LEAD,
      managerId: manager1.id
    });

    const techLead2 = await User.create({
      name: 'Mike Chen',
      email: 'mike.chen@company.com',
      password: 'Password@123',
      role: USER_ROLES.TECH_LEAD,
      managerId: manager1.id
    });

    const techLead3 = await User.create({
      name: 'Emily Davis',
      email: 'emily.davis@company.com',
      password: 'Password@123',
      role: USER_ROLES.TECH_LEAD,
      managerId: manager2.id
    });
    console.log('✅ Created 3 tech leads');

    // Create Developers
    const developers = [
      {
        name: 'John Doe',
        email: 'john.doe@company.com',
        password: 'Password@123',
        role: USER_ROLES.DEVELOPER,
        techLeadId: techLead1.id,
        managerId: manager1.id
      },
      {
        name: 'Alice Brown',
        email: 'alice.brown@company.com',
        password: 'Password@123',
        role: USER_ROLES.DEVELOPER,
        techLeadId: techLead1.id,
        managerId: manager1.id
      },
      {
        name: 'David Wilson',
        email: 'david.wilson@company.com',
        password: 'Password@123',
        role: USER_ROLES.DEVELOPER,
        techLeadId: techLead1.id,
        managerId: manager1.id
      },
      {
        name: 'Emma Garcia',
        email: 'emma.garcia@company.com',
        password: 'Password@123',
        role: USER_ROLES.DEVELOPER,
        techLeadId: techLead2.id,
        managerId: manager1.id
      },
      {
        name: 'James Martinez',
        email: 'james.martinez@company.com',
        password: 'Password@123',
        role: USER_ROLES.DEVELOPER,
        techLeadId: techLead2.id,
        managerId: manager1.id
      },
      {
        name: 'Olivia Anderson',
        email: 'olivia.anderson@company.com',
        password: 'Password@123',
        role: USER_ROLES.DEVELOPER,
        techLeadId: techLead3.id,
        managerId: manager2.id
      },
      {
        name: 'William Taylor',
        email: 'william.taylor@company.com',
        password: 'Password@123',
        role: USER_ROLES.DEVELOPER,
        techLeadId: techLead3.id,
        managerId: manager2.id
      }
    ];

    await User.bulkCreate(developers);
    console.log(`✅ Created ${developers.length} developers`);

    // Create Testers
    const testers = [
      {
        name: 'Sophia Thomas',
        email: 'sophia.thomas@company.com',
        password: 'Password@123',
        role: USER_ROLES.TESTER,
        techLeadId: techLead1.id,
        managerId: manager1.id
      },
      {
        name: 'Liam Moore',
        email: 'liam.moore@company.com',
        password: 'Password@123',
        role: USER_ROLES.TESTER,
        techLeadId: techLead2.id,
        managerId: manager1.id
      },
      {
        name: 'Ava Jackson',
        email: 'ava.jackson@company.com',
        password: 'Password@123',
        role: USER_ROLES.TESTER,
        techLeadId: techLead3.id,
        managerId: manager2.id
      }
    ];

    await User.bulkCreate(testers);
    console.log(`✅ Created ${testers.length} testers`);

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   - Admin: 1`);
    console.log(`   - Managers: 2`);
    console.log(`   - Tech Leads: 3`);
    console.log(`   - Developers: ${developers.length}`);
    console.log(`   - Testers: ${testers.length}`);
    console.log(`   - Questions: ${ALL_FLAT_QUESTIONS.length} (across all roles)`);
    console.log('\n🔑 Default Credentials:');
    console.log('   Admin:');
    console.log('      Email: admin@company.com');
    console.log('      Password: Admin@123');
    console.log('\n   Sample Developer:');
    console.log('      Email: john.doe@company.com');
    console.log('      Password: Password@123');
    console.log('\n   Sample Tester:');
    console.log('      Email: sophia.thomas@company.com');
    console.log('      Password: Password@123');
    console.log('\n   Sample Tech Lead:');
    console.log('      Email: jane.smith@company.com');
    console.log('      Password: Password@123');
    console.log('\n   Sample Manager:');
    console.log('      Email: bob.johnson@company.com');
    console.log('      Password: Password@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
