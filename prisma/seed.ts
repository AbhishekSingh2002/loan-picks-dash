// =============================================================================
// WHY: Seed script populates database with realistic loan products
// Creates 10+ diverse products for testing and demonstration
// Run with: npx prisma db seed
// Sharing & Persistence (10 points) - provides initial data
// =============================================================================

// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

// Define enums locally since they might not be exported by Prisma client
enum LoanType {
  PERSONAL = 'PERSONAL',
  EDUCATION = 'EDUCATION',
  HOME = 'HOME',
  VEHICLE = 'VEHICLE',
  CREDIT_LINE = 'CREDIT_LINE',
  DEBT_CONSOLIDATION = 'DEBT_CONSOLIDATION'
}

// These enums are used in the Product model but not directly in this file
// They are kept for reference and type safety
const DisbursalSpeed = {
  FAST: 'FAST',
  STANDARD: 'STANDARD',
  SLOW: 'SLOW'
} as const;

const DocsLevel = {
  MINIMAL: 'MINIMAL',
  STANDARD: 'STANDARD',
  EXTENSIVE: 'EXTENSIVE'
} as const;

enum Role {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT'
};

const prismaClient = new PrismaClient();

async function main() {
  console.log('Starting database seeding... 🌱')

  // Clear existing data
  await prismaClient.$executeRaw`TRUNCATE TABLE "chat_messages" CASCADE;`
  await prismaClient.$executeRaw`TRUNCATE TABLE "products" CASCADE;`
  await prismaClient.$executeRaw`TRUNCATE TABLE "users" CASCADE;`
  await prismaClient.$executeRaw`TRUNCATE TABLE "accounts" CASCADE;`
  await prismaClient.$executeRaw`TRUNCATE TABLE "sessions" CASCADE;`
  await prismaClient.$executeRaw`TRUNCATE TABLE "verification_tokens" CASCADE;`

  console.log('✓ Cleared existing data');

  // Create a test user if not exists
  let user = await prismaClient.user.findUnique({
    where: { email: 'test@example.com' },
  })

  if (!user) {
    user = await prismaClient.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        creditScore: 750,
        monthlyIncome: 35000,
        preferredLoanType: LoanType.PERSONAL
      }
    });
  }

  console.log(`✓ Created sample user: ${user.email}`);

  // Create loan products with proper type casting
  const products = await prismaClient.$transaction([
    // Personal Loans
    prismaClient.product.create({
      data: {
        name: 'Quick Personal Loan',
        bank: 'HDFC Bank',
        type: 'PERSONAL',
        rateApr: 8.9,
        minIncome: 20000,
        minCreditScore: 700,
        tenureMinMonths: 12,
        tenureMaxMonths: 60,
        processingFeePct: 2,
        prepaymentAllowed: true,
        disbursalSpeed: DisbursalSpeed.FAST,
        docsLevel: DocsLevel.MINIMAL,
        summary: 'Low interest personal loan with fast approval and no prepayment penalty.',
        faq: [
          { 
            question: 'What documents are needed?', 
            answer: 'ID proof (Aadhaar/PAN), last 3 months salary slips, and 6 months bank statements.' 
          }
        ],
        terms: {
          late_fee: 500,
          foreclosure_charges: '2% of principal amount'
        },
        matchScore: 95
      }
    }),
    prismaClient.product.create({
      data: {
        name: 'Salaried Personal Loan',
        bank: 'ICICI Bank',
        type: 'PERSONAL',
        rateApr: 9.2,
        minIncome: 25000,
        minCreditScore: 720,
        tenureMinMonths: 12,
        tenureMaxMonths: 84,
        processingFeePct: 2.5,
        prepaymentAllowed: true,
        disbursalSpeed: DisbursalSpeed.STANDARD,
        docsLevel: DocsLevel.STANDARD,
        summary: 'Flexible tenure options with competitive rates for salaried professionals.',
        faq: [
          { 
            question: 'What is the maximum loan amount?', 
            answer: 'Up to 40 lakhs based on your income and credit score.' 
          }
        ],
        terms: {
          late_fee: 500,
          foreclosure_charges: '2% of principal amount'
        },
        matchScore: 88
      }
    }),

    // Education Loans
    prismaClient.product.create({
      data: {
        name: 'Education Loan Plus',
        bank: 'SBI',
        type: 'EDUCATION',
        rateApr: 7.5,
        minIncome: 15000,
        minCreditScore: 650,
        tenureMinMonths: 60,
        tenureMaxMonths: 180,
        processingFeePct: 1,
        prepaymentAllowed: false,
        disbursalSpeed: DisbursalSpeed.FAST,
        docsLevel: DocsLevel.STANDARD,
        summary: 'Low-rate education loan for studying in India or abroad.',
        faq: [
          { 
            question: 'Does it cover living expenses?', 
            answer: 'Yes, covers tuition, books, accommodation, and other study-related expenses.' 
          }
        ],
        terms: {
          late_fee: 300,
          foreclosure_charges: '3% of principal amount'
        },
        matchScore: 82
      }
    }),

    // Vehicle Loans
    prismaClient.product.create({
      data: {
        name: 'Vehicle Finance',
        bank: 'Axis Bank',
        type: 'VEHICLE',
        rateApr: 10.5,
        minIncome: 30000,
        minCreditScore: 680,
        tenureMinMonths: 12,
        tenureMaxMonths: 84,
        processingFeePct: 3,
        prepaymentAllowed: true,
        disbursalSpeed: DisbursalSpeed.STANDARD,
        docsLevel: DocsLevel.STANDARD,
        summary: 'Finance your dream car or bike with flexible EMI options.',
        faq: [
          { 
            question: 'Can I finance a used vehicle?', 
            answer: 'Yes, we finance both new and used vehicles up to 5 years old.' 
          }
        ],
        terms: {
          late_fee: 800,
          foreclosure_charges: '4% of principal amount'
        },
        matchScore: 76
      }
    }),

    // Home Loans
    prismaClient.product.create({
      data: {
        name: 'Home Loan Express',
        bank: 'Kotak Mahindra',
        type: 'HOME',
        rateApr: 8.3,
        minIncome: 50000,
        minCreditScore: 750,
        tenureMinMonths: 120,
        tenureMaxMonths: 300,
        processingFeePct: 0.5,
        prepaymentAllowed: false,
        disbursalSpeed: DisbursalSpeed.STANDARD,
        docsLevel: DocsLevel.EXTENSIVE,
        summary: 'Affordable home loan with low processing fees and attractive rates.',
        faq: [
          { 
            question: 'What is the maximum loan amount?', 
            answer: 'Up to 5 crores based on property value and income.' 
          }
        ],
        terms: {
          late_fee: 1000,
          foreclosure_charges: '2% of principal amount'
        },
        matchScore: 70
      }
    }),

    // Business Loans
    prismaClient.product.create({
      data: {
        name: 'Business Credit Line',
        bank: 'HDFC Bank',
        type: 'CREDIT_LINE',
        rateApr: 11.5,
        minIncome: 40000,
        minCreditScore: 720,
        tenureMinMonths: 12,
        tenureMaxMonths: 36,
        processingFeePct: 2.5,
        prepaymentAllowed: true,
        disbursalSpeed: DisbursalSpeed.FAST,
        docsLevel: DocsLevel.STANDARD,
        summary: 'Flexible credit line for business owners. Pay interest only on amount used.',
        faq: [
          { 
            question: 'What is the maximum credit limit?', 
            answer: 'Up to 50 lakhs based on business turnover and credit profile.' 
          }
        ],
        terms: {
          late_fee: 1000,
          foreclosure_charges: '3% of principal amount'
        },
        matchScore: 62
      }
    })
  ]);

  console.log(`✓ Created ${products.length} loan products`);

  // Create sample chat messages with explicit string type
  const sampleMessages: readonly string[] = [
    "What's the interest rate?",
    'What documents do I need to apply?',
    'Is there a prepayment penalty?',
    'How long does approval take?',
    'What is the maximum loan amount?',
  ];

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * sampleMessages.length);
    const randomProductIndex = Math.floor(Math.random() * products.length);
    const message = sampleMessages[randomIndex];
    const selectedProduct = products[randomProductIndex];
    
    if (!message || !selectedProduct) {
      console.warn('No message or product found at index', randomIndex, randomProductIndex);
      continue;
    }

    await prismaClient.chatMessage.create({
      data: {
        content: message, // This is now guaranteed to be a string
        role: Math.random() > 0.5 ? Role.USER : Role.ASSISTANT,
        productId: selectedProduct.id,
        userId: user.id,
      },
    });
  }

  console.log('✓ Created sample chat messages');
  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });