import type { User, Wallet, TestStandard, AssessmentCode, TestResult, DiagnosticCenter, Transaction, ConsentShare } from "@shared/schema";

// Mock current user
export const mockUser: User = {
  id: "user-1",
  email: "adebayo.okonkwo@example.com",
  firstName: "Adebayo",
  lastName: "Okonkwo",
  profileImageUrl: null,
  role: "patient",
  phone: "+234 803 456 7890",
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
};

// Mock wallet
export const mockWallet: Wallet = {
  id: "wallet-1",
  userId: "user-1",
  balance: "15750.00",
  currency: "NGN",
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-11-20"),
};

// Mock test standards - Updated with comprehensive options per product suggestions
export const mockTestStandards: TestStandard[] = [
  {
    id: "test-std-1",
    name: "Comprehensive STI Screen",
    description: "Complete screening package including HIV, Hepatitis B & C, and Syphilis (Recommended)",
    price: "15000.00",
    currency: "NGN",
    testsIncluded: ["HIV I & II Rapid", "HBsAg (Hepatitis B)", "Hep C Antibody", "VDRL (Syphilis)"],
    sampleType: "Blood",
    turnaroundTime: "Same day (4-6 hours)",
    active: true,
    isDefault: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "test-std-2",
    name: "HIV I & II Rapid Test",
    description: "Quick HIV antibody screening test",
    price: "5000.00",
    currency: "NGN",
    testsIncluded: ["HIV I & II Antibody"],
    sampleType: "Blood",
    turnaroundTime: "30 minutes",
    active: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "test-std-3",
    name: "HIV Quantitative / P24 Early Detection",
    description: "Early detection test that can identify HIV infection sooner than standard antibody tests",
    price: "25000.00",
    currency: "NGN",
    testsIncluded: ["HIV RNA/DNA PCR", "P24 Antigen"],
    sampleType: "Blood",
    turnaroundTime: "2-3 days",
    active: true,
    hasWindowPeriodInfo: true,
    windowPeriodDays: 10,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "test-std-4",
    name: "HBsAg (Hepatitis B)",
    description: "Hepatitis B surface antigen screening",
    price: "4000.00",
    currency: "NGN",
    testsIncluded: ["HBsAg"],
    sampleType: "Blood",
    turnaroundTime: "Same day",
    active: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "test-std-5",
    name: "Hepatitis C Antibody",
    description: "Hepatitis C virus antibody screening",
    price: "4500.00",
    currency: "NGN",
    testsIncluded: ["Hep C Antibody"],
    sampleType: "Blood",
    turnaroundTime: "Same day",
    active: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "test-std-6",
    name: "VDRL (Syphilis)",
    description: "Syphilis screening test",
    price: "3500.00",
    currency: "NGN",
    testsIncluded: ["VDRL"],
    sampleType: "Blood",
    turnaroundTime: "Same day",
    active: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Sexual Wellness Add-On options
export const sexualWellnessAddOns = [
  {
    id: "addon-1",
    name: "Testosterone Level Check",
    description: "For users interested in hormone health",
    price: "8000.00",
    currency: "NGN",
    turnaroundTime: "1-2 days",
  },
  {
    id: "addon-2",
    name: "Fertility Baseline (Male)",
    description: "Basic semen analysis and hormone panel",
    price: "15000.00",
    currency: "NGN",
    turnaroundTime: "2-3 days",
  },
  {
    id: "addon-3",
    name: "Fertility Baseline (Female)",
    description: "FSH, LH, and basic hormone panel",
    price: "18000.00",
    currency: "NGN",
    turnaroundTime: "2-3 days",
  },
];

// Mock assessment codes
export const mockAssessmentCodes: AssessmentCode[] = [
  {
    id: "code-1",
    code: "PSN8K2M9L4P7",
    testStandardId: "test-std-1",
    patientId: "user-1",
    patientName: "Adebayo Okonkwo",
    sponsorId: "user-1",
    sponsorType: "self",
    status: "pending",
    validUntil: new Date("2024-12-15"),
    usedAt: null,
    diagnosticCenterId: null,
    createdAt: new Date("2024-11-20"),
  },
  {
    id: "code-2",
    code: "PSN3X7Y2Q9W5",
    testStandardId: "test-std-2",
    patientId: "user-1",
    patientName: "Adebayo Okonkwo",
    sponsorId: "sponsor-1",
    sponsorType: "employer",
    status: "used",
    validUntil: new Date("2024-11-30"),
    usedAt: new Date("2024-11-10"),
    diagnosticCenterId: "center-1",
    createdAt: new Date("2024-10-15"),
  },
];

// Mock diagnostic centers in Lagos, Nigeria
export const mockDiagnosticCenters: DiagnosticCenter[] = [
  {
    id: "center-1",
    userId: "center-user-1",
    name: "Lifebridge Medical Diagnostics",
    address: "12 Admiralty Way, Lekki Phase 1",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    latitude: "6.4474",
    longitude: "3.4649",
    phone: "+234 901 234 5678",
    email: "info@lifebridge.ng",
    hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-2PM",
    verified: true,
    rating: "4.75",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "center-2",
    userId: "center-user-2",
    name: "St. Nicholas Hospital Lab",
    address: "57 Campbell Street, Lagos Island",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    latitude: "6.4550",
    longitude: "3.4242",
    phone: "+234 802 345 6789",
    email: "lab@saintnicholashospital.com",
    hours: "Mon-Sun: 24 Hours",
    verified: true,
    rating: "4.85",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "center-3",
    userId: "center-user-3",
    name: "Clina-Lancet Laboratories",
    address: "21 Mobolaji Bank Anthony Way, Ikeja",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    latitude: "6.6018",
    longitude: "3.3515",
    phone: "+234 703 456 7890",
    email: "contact@clinalancet.com",
    hours: "Mon-Fri: 7AM-7PM, Sat: 8AM-4PM",
    verified: true,
    rating: "4.60",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "center-4",
    userId: "center-user-4",
    name: "Cedarcrest Hospitals Diagnostics",
    address: "8 Oba Elegushi Road, Ikoyi",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    latitude: "6.4541",
    longitude: "3.4366",
    phone: "+234 805 678 9012",
    email: "diagnostics@cedarcrest.com.ng",
    hours: "Mon-Sat: 8AM-5PM",
    verified: true,
    rating: "4.70",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "center-5",
    userId: "center-user-5",
    name: "Pathcare Nigeria",
    address: "Plot 1678 Oladipo Diya Street, Victoria Island",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    latitude: "6.4281",
    longitude: "3.4219",
    phone: "+234 906 789 0123",
    email: "info@pathcare.ng",
    hours: "Mon-Fri: 7:30AM-6PM, Sat: 8AM-1PM",
    verified: true,
    rating: "4.80",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Mock test results - Updated with realistic clinical lab format
export const mockTestResults: TestResult[] = [
  {
    id: "result-1",
    assessmentCodeId: "code-2",
    patientId: "user-1",
    diagnosticCenterId: "center-1",
    testStandardId: "test-std-2",
    results: [
      {
        parameter: "HIV 1&2 Antibody",
        value: "0.15",
        unit: "S/CO",
        referenceRange: "< 1.0 (Non-Reactive)",
        interpretation: "Non-Reactive",
        status: "normal"
      },
      {
        parameter: "Hepatitis B Surface Antigen (HBsAg)",
        value: "0.08",
        unit: "IU/mL",
        referenceRange: "< 0.05 IU/mL (Negative)",
        interpretation: "Negative",
        status: "normal"
      },
      {
        parameter: "Hepatitis C Antibody (Anti-HCV)",
        value: "0.12",
        unit: "S/CO",
        referenceRange: "< 1.0 (Non-Reactive)",
        interpretation: "Non-Reactive",
        status: "normal"
      },
    ],
    viewed: false,
    viewedAt: null,
    sponsorNotified: true,
    sponsorNotifiedAt: new Date("2024-11-12"),
    testedAt: new Date("2024-11-10"),
    uploadedAt: new Date("2024-11-12"),
  },
  {
    id: "result-2",
    assessmentCodeId: "code-prev-1",
    patientId: "user-1",
    diagnosticCenterId: "center-2",
    testStandardId: "test-std-3",
    results: [
      {
        parameter: "Neisseria gonorrhoeae (Gonorrhea) PCR",
        value: "Not Detected",
        unit: "",
        referenceRange: "Not Detected",
        interpretation: "Negative",
        status: "normal"
      },
      {
        parameter: "Chlamydia trachomatis PCR",
        value: "Not Detected",
        unit: "",
        referenceRange: "Not Detected",
        interpretation: "Negative",
        status: "normal"
      },
      {
        parameter: "Syphilis VDRL (RPR)",
        value: "Non-Reactive",
        unit: "",
        referenceRange: "Non-Reactive",
        interpretation: "Non-Reactive",
        status: "normal"
      },
    ],
    viewed: true,
    viewedAt: new Date("2024-09-16"),
    sponsorNotified: false,
    sponsorNotifiedAt: null,
    testedAt: new Date("2024-09-14"),
    uploadedAt: new Date("2024-09-15"),
  },
];

// Mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: "txn-1",
    walletId: "wallet-1",
    userId: "user-1",
    type: "credit",
    amount: "20000.00",
    currency: "NGN",
    description: "Wallet funding via Card",
    reference: "TXN-20241120-001",
    status: "completed",
    metadata: { method: "card" },
    createdAt: new Date("2024-11-20"),
  },
  {
    id: "txn-2",
    walletId: "wallet-1",
    userId: "user-1",
    type: "debit",
    amount: "12500.00",
    currency: "NGN",
    description: "Purchase: Comprehensive STI Panel",
    reference: "ORD-20241120-001",
    status: "completed",
    metadata: { testStandardId: "test-std-1", codeId: "code-1" },
    createdAt: new Date("2024-11-20"),
  },
  {
    id: "txn-3",
    walletId: "wallet-1",
    userId: "user-1",
    type: "credit",
    amount: "10000.00",
    currency: "NGN",
    description: "Wallet funding via Mobile Money",
    reference: "TXN-20241015-002",
    status: "completed",
    metadata: { method: "mobile" },
    createdAt: new Date("2024-10-15"),
  },
];

// Mock consent shares
export const mockConsentShares: ConsentShare[] = [
  {
    id: "share-1",
    testResultId: "result-2",
    patientId: "user-1",
    sharedWith: "dr.amina@healthclinic.ng",
    sharedWithType: "email",
    accessLevel: "full",
    expiresAt: new Date("2024-12-14"),
    revoked: false,
    revokedAt: null,
    accessedAt: new Date("2024-09-17"),
    createdAt: new Date("2024-09-16"),
  },
];

// Mock sponsor data
export const mockSponsoredCodes = [
  {
    id: "sponsored-1",
    recipientName: "Chioma Nwosu",
    recipientContact: "+234 803 456 7890",
    testType: "Comprehensive STI Panel",
    code: "PSN3X7Y2Q9W5",
    status: "completed" as const,
    sentAt: new Date("2024-11-05"),
    completedAt: new Date("2024-11-10"),
    // Patient chose to share results with sponsor
    sharedWithSponsor: true,
    shareExpiresAt: new Date("2024-12-10"),
    overallStatus: "All Normal" as const,
    resultId: "result-1", // Link to the actual result
  },
  {
    id: "sponsored-2",
    recipientName: "Oluwaseun Adeyemi",
    recipientContact: "+234 805 678 9012",
    testType: "HIV & Hepatitis Screening",
    code: "PSN2M8K4N7L3",
    status: "pending" as const,
    sentAt: new Date("2024-11-15"),
    completedAt: undefined,
    sharedWithSponsor: false,
  },
  {
    id: "sponsored-3",
    recipientName: "Emeka Okafor",
    recipientContact: "+234 807 123 4567",
    testType: "Basic STI Check",
    code: "PSN9R5T1M8K2",
    status: "completed" as const,
    sentAt: new Date("2024-11-01"),
    completedAt: new Date("2024-11-08"),
    // Patient chose NOT to share - sponsor only knows it's complete
    sharedWithSponsor: false,
  },
];

// Mock diagnostic center data
export const mockCenterTests = [
  {
    id: "test-1",
    code: "PSN3X7Y2Q9W5",
    patientName: "Adebayo Okonkwo",
    testType: "HIV & Hepatitis Screening",
    status: "completed" as const,
    testedAt: new Date("2024-11-10"),
  },
  {
    id: "test-2",
    code: "PSN2M8K4N7L3",
    patientName: "Chioma Nwosu",
    testType: "Comprehensive STI Panel",
    status: "completed" as const,
    testedAt: new Date("2024-11-08"),
  },
];

// Mock code validation data
export const mockCodeValidation = {
  code: "PSN8K2M9L4P7",
  patientName: "Adebayo Okonkwo",
  testType: "Comprehensive STI Panel",
  testsIncluded: ["HIV 1&2", "Hepatitis B", "Hepatitis C", "Syphilis", "Gonorrhea", "Chlamydia"],
  sponsorType: "Self-Paid",
  validUntil: new Date("2024-12-15"),
  status: "Valid",
};

// Center-specific test pricing - each center sets their own prices
export type CenterTestPrice = {
  testStandardId: string;
  price: string;
  currency: string;
};

export type CenterPricing = {
  centerId: string;
  testPrices: CenterTestPrice[];
};

export const mockCenterPricing: CenterPricing[] = [
  {
    centerId: "center-1", // Lifebridge Medical Diagnostics
    testPrices: [
      { testStandardId: "test-std-1", price: "14500.00", currency: "NGN" }, // Comprehensive STI Screen
      { testStandardId: "test-std-2", price: "4800.00", currency: "NGN" },  // HIV I & II Rapid Test
      { testStandardId: "test-std-3", price: "24000.00", currency: "NGN" }, // HIV Quantitative
      { testStandardId: "test-std-4", price: "3800.00", currency: "NGN" },  // HBsAg
      { testStandardId: "test-std-5", price: "4200.00", currency: "NGN" },  // Hep C Antibody
      { testStandardId: "test-std-6", price: "3200.00", currency: "NGN" },  // VDRL
    ],
  },
  {
    centerId: "center-2", // St. Nicholas Hospital Lab
    testPrices: [
      { testStandardId: "test-std-1", price: "16000.00", currency: "NGN" },
      { testStandardId: "test-std-2", price: "5500.00", currency: "NGN" },
      { testStandardId: "test-std-3", price: "27000.00", currency: "NGN" },
      { testStandardId: "test-std-4", price: "4500.00", currency: "NGN" },
      { testStandardId: "test-std-5", price: "5000.00", currency: "NGN" },
      { testStandardId: "test-std-6", price: "4000.00", currency: "NGN" },
    ],
  },
  {
    centerId: "center-3", // Clina-Lancet Laboratories
    testPrices: [
      { testStandardId: "test-std-1", price: "13500.00", currency: "NGN" },
      { testStandardId: "test-std-2", price: "4500.00", currency: "NGN" },
      { testStandardId: "test-std-3", price: "23000.00", currency: "NGN" },
      { testStandardId: "test-std-4", price: "3500.00", currency: "NGN" },
      { testStandardId: "test-std-5", price: "4000.00", currency: "NGN" },
      { testStandardId: "test-std-6", price: "3000.00", currency: "NGN" },
    ],
  },
  {
    centerId: "center-4", // Cedarcrest Hospitals Diagnostics
    testPrices: [
      { testStandardId: "test-std-1", price: "15500.00", currency: "NGN" },
      { testStandardId: "test-std-2", price: "5200.00", currency: "NGN" },
      { testStandardId: "test-std-3", price: "26000.00", currency: "NGN" },
      { testStandardId: "test-std-4", price: "4200.00", currency: "NGN" },
      { testStandardId: "test-std-5", price: "4700.00", currency: "NGN" },
      { testStandardId: "test-std-6", price: "3700.00", currency: "NGN" },
    ],
  },
  {
    centerId: "center-5", // Pathcare Nigeria
    testPrices: [
      { testStandardId: "test-std-1", price: "14000.00", currency: "NGN" },
      { testStandardId: "test-std-2", price: "4600.00", currency: "NGN" },
      { testStandardId: "test-std-3", price: "24500.00", currency: "NGN" },
      { testStandardId: "test-std-4", price: "3600.00", currency: "NGN" },
      { testStandardId: "test-std-5", price: "4100.00", currency: "NGN" },
      { testStandardId: "test-std-6", price: "3100.00", currency: "NGN" },
    ],
  },
];

// Helper function to get test price for a specific center
export function getCenterTestPrice(centerId: string, testStandardId: string): string | null {
  const centerPricing = mockCenterPricing.find(cp => cp.centerId === centerId);
  if (!centerPricing) return null;

  const testPrice = centerPricing.testPrices.find(tp => tp.testStandardId === testStandardId);
  return testPrice?.price || null;
}

// Helper function to get all test prices for a center
export function getCenterTestPrices(centerId: string): CenterTestPrice[] {
  const centerPricing = mockCenterPricing.find(cp => cp.centerId === centerId);
  return centerPricing?.testPrices || [];
}

// Center packages for partner test dialog - combines center pricing with test standard details
export type CenterPackage = {
  id: string;
  name: string;
  description: string;
  price: string;
};

export type CenterPrices = {
  centerId: string;
  packages: CenterPackage[];
};

// Generate mockCenterPrices from mockCenterPricing and mockTestStandards
export const mockCenterPrices: CenterPrices[] = mockCenterPricing.map(cp => ({
  centerId: cp.centerId,
  packages: cp.testPrices.map(tp => {
    const testStandard = mockTestStandards.find(ts => ts.id === tp.testStandardId);
    return {
      id: tp.testStandardId,
      name: testStandard?.name || 'Unknown Test',
      description: testStandard?.description || '',
      price: tp.price,
    };
  }),
}));

// Home Service data - centers that offer home sample collection
export type HomeServiceCenter = {
  centerId: string;
  offersHomeService: boolean;
  serviceRadius: number; // in km
  homeServicePrices: CenterTestPrice[];
  operatingHours: {
    startHour: number; // 24-hour format (e.g., 7 = 7:00 AM)
    endHour: number;   // 24-hour format (e.g., 17 = 5:00 PM)
  };
  unavailableDays: number[]; // 0 = Sunday, 6 = Saturday
};

export const mockHomeServiceCenters: HomeServiceCenter[] = [
  {
    centerId: "center-1", // Lifebridge Medical Diagnostics
    offersHomeService: true,
    serviceRadius: 15,
    homeServicePrices: [
      { testStandardId: "test-std-1", price: "18850.00", currency: "NGN" }, // ~30% markup
      { testStandardId: "test-std-2", price: "6240.00", currency: "NGN" },
      { testStandardId: "test-std-3", price: "31200.00", currency: "NGN" },
      { testStandardId: "test-std-4", price: "4940.00", currency: "NGN" },
      { testStandardId: "test-std-5", price: "5460.00", currency: "NGN" },
      { testStandardId: "test-std-6", price: "4160.00", currency: "NGN" },
    ],
    operatingHours: { startHour: 8, endHour: 16 }, // 8 AM - 4 PM
    unavailableDays: [0], // Closed on Sundays
  },
  {
    centerId: "center-2", // St. Nicholas Hospital Lab
    offersHomeService: true,
    serviceRadius: 20,
    homeServicePrices: [
      { testStandardId: "test-std-1", price: "20800.00", currency: "NGN" },
      { testStandardId: "test-std-2", price: "7150.00", currency: "NGN" },
      { testStandardId: "test-std-3", price: "35100.00", currency: "NGN" },
      { testStandardId: "test-std-4", price: "5850.00", currency: "NGN" },
      { testStandardId: "test-std-5", price: "6500.00", currency: "NGN" },
      { testStandardId: "test-std-6", price: "5200.00", currency: "NGN" },
    ],
    operatingHours: { startHour: 7, endHour: 17 }, // 7 AM - 5 PM
    unavailableDays: [], // Open every day
  },
  {
    centerId: "center-5", // Pathcare Nigeria
    offersHomeService: true,
    serviceRadius: 12,
    homeServicePrices: [
      { testStandardId: "test-std-1", price: "17500.00", currency: "NGN" },
      { testStandardId: "test-std-2", price: "5750.00", currency: "NGN" },
      { testStandardId: "test-std-3", price: "30625.00", currency: "NGN" },
      { testStandardId: "test-std-4", price: "4500.00", currency: "NGN" },
      { testStandardId: "test-std-5", price: "5125.00", currency: "NGN" },
      { testStandardId: "test-std-6", price: "3875.00", currency: "NGN" },
    ],
    operatingHours: { startHour: 8, endHour: 16 }, // 8 AM - 4 PM
    unavailableDays: [0, 6], // Closed on Sundays and Saturdays
  },
];

// Helper function to get centers offering home service
export function getHomeServiceCenters() {
  return mockHomeServiceCenters
    .filter(hsc => hsc.offersHomeService)
    .map(hsc => ({
      ...hsc,
      centerDetails: mockDiagnosticCenters.find(c => c.id === hsc.centerId),
    }));
}

// Helper function to get home service price for a test
export function getHomeServicePrice(centerId: string, testStandardId: string): string | null {
  const homeService = mockHomeServiceCenters.find(hsc => hsc.centerId === centerId);
  if (!homeService) return null;

  const testPrice = homeService.homeServicePrices.find(tp => tp.testStandardId === testStandardId);
  return testPrice?.price || null;
}

// Center Wallet & Revenue Data
export type CenterWallet = {
  centerId: string;
  balance: string;
  pendingWithdrawal: string;
  totalEarnings: string;
  currency: string;
};

export type CenterRevenueItem = {
  id: string;
  type: 'test' | 'home_service' | 'prime_referral';
  description: string;
  amount: string;
  currency: string;
  patientCode: string;
  testType: string;
  date: Date;
  status: 'completed' | 'pending' | 'processing';
};

export type WithdrawalRequest = {
  id: string;
  centerId?: string;
  amount: string;
  currency: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
};

export const mockCenterWallet: CenterWallet = {
  centerId: "center-1",
  balance: "425750.00",
  pendingWithdrawal: "0.00",
  totalEarnings: "1250000.00",
  currency: "NGN",
};

export const mockCenterRevenue: CenterRevenueItem[] = [
  {
    id: "rev-1",
    type: "test",
    description: "Comprehensive STI Panel",
    amount: "14500.00",
    currency: "NGN",
    patientCode: "PSN3X7Y2Q9W5",
    testType: "Comprehensive STI Panel",
    date: new Date(Date.now() - 2 * 86400000),
    status: "completed",
  },
  {
    id: "rev-2",
    type: "home_service",
    description: "Home Service - HIV & Hepatitis Screening",
    amount: "20800.00",
    currency: "NGN",
    patientCode: "PSN8K2M9L4P7",
    testType: "HIV & Hepatitis Screening",
    date: new Date(Date.now() - 3 * 86400000),
    status: "completed",
  },
  {
    id: "rev-3",
    type: "test",
    description: "HIV I & II Rapid Test",
    amount: "4800.00",
    currency: "NGN",
    patientCode: "PSN2M8K4N7L3",
    testType: "HIV I & II Rapid Test",
    date: new Date(Date.now() - 5 * 86400000),
    status: "completed",
  },
  {
    id: "rev-4",
    type: "home_service",
    description: "Home Service - Comprehensive STI Panel",
    amount: "18850.00",
    currency: "NGN",
    patientCode: "PSN9R5T1M8K2",
    testType: "Comprehensive STI Panel",
    date: new Date(Date.now() - 7 * 86400000),
    status: "completed",
  },
  {
    id: "rev-5",
    type: "test",
    description: "VDRL (Syphilis)",
    amount: "3200.00",
    currency: "NGN",
    patientCode: "PSN1A2B3C4D5",
    testType: "VDRL (Syphilis)",
    date: new Date(Date.now() - 10 * 86400000),
    status: "completed",
  },
  {
    id: "rev-6",
    type: "prime_referral",
    description: "Prime Subscription Referral Bonus",
    amount: "2500.00",
    currency: "NGN",
    patientCode: "PSN5E6F7G8H9",
    testType: "Prime Referral",
    date: new Date(Date.now() - 12 * 86400000),
    status: "completed",
  },
];

export const mockCenterWithdrawals: WithdrawalRequest[] = [
  {
    id: "withdraw-1",
    centerId: "center-1",
    amount: "500000.00",
    currency: "NGN",
    bankName: "First Bank of Nigeria",
    accountNumber: "3012345678",
    accountName: "Lifebridge Medical Ltd",
    status: "completed",
    createdAt: new Date(Date.now() - 14 * 86400000),
    processedAt: new Date(Date.now() - 12 * 86400000),
  },
  {
    id: "withdraw-2",
    centerId: "center-1",
    amount: "324250.00",
    currency: "NGN",
    bankName: "First Bank of Nigeria",
    accountNumber: "3012345678",
    accountName: "Lifebridge Medical Ltd",
    status: "completed",
    createdAt: new Date(Date.now() - 30 * 86400000),
    processedAt: new Date(Date.now() - 28 * 86400000),
  },
];

// Admin Platform Revenue Data
// Admin revenue comes from: Prime subscriptions + Test commissions (% of each test done on the platform)
export type AdminRevenueStats = {
  totalRevenue: string;
  primeSubscriptions: string;
  testCommissions: string;
  pendingPayouts: string;
  completedPayouts: string;
  platformBalance: string;
  currency: string;
};

export type AdminRevenueItem = {
  id: string;
  type: 'prime_subscription' | 'test_commission' | 'center_payout' | 'withdrawal';
  description: string;
  amount: string;
  currency: string;
  reference: string;
  date: Date;
  status: 'completed' | 'pending' | 'processing';
  metadata?: Record<string, string>;
};

export const mockAdminRevenueStats: AdminRevenueStats = {
  totalRevenue: "9000000.00",
  primeSubscriptions: "3750000.00",
  testCommissions: "5250000.00",
  pendingPayouts: "850000.00",
  completedPayouts: "8500000.00",
  platformBalance: "4150000.00",
  currency: "NGN",
};

export const mockAdminRevenue: AdminRevenueItem[] = [
  {
    id: "admin-rev-1",
    type: "prime_subscription",
    description: "Prime Monthly Subscription",
    amount: "4999.00",
    currency: "NGN",
    reference: "PRIME-2024-001",
    date: new Date(Date.now() - 1 * 86400000),
    status: "completed",
    metadata: { userId: "user-123", plan: "monthly" },
  },
  {
    id: "admin-rev-2",
    type: "test_commission",
    description: "Test Commission - Lifebridge Medical",
    amount: "1450.00",
    currency: "NGN",
    reference: "COMM-2024-001",
    date: new Date(Date.now() - 2 * 86400000),
    status: "completed",
    metadata: { centerId: "center-1", testCode: "PSN3X7Y2Q9W5" },
  },
  {
    id: "admin-rev-3",
    type: "test_commission",
    description: "Test Commission - St. Nicholas Hospital",
    amount: "1200.00",
    currency: "NGN",
    reference: "COMM-2024-002",
    date: new Date(Date.now() - 3 * 86400000),
    status: "completed",
    metadata: { centerId: "center-2", testCode: "PSN8K2M9L4P7" },
  },
  {
    id: "admin-rev-4",
    type: "prime_subscription",
    description: "Prime Quarterly Subscription",
    amount: "12999.00",
    currency: "NGN",
    reference: "PRIME-2024-002",
    date: new Date(Date.now() - 5 * 86400000),
    status: "completed",
    metadata: { userId: "user-456", plan: "quarterly" },
  },
  {
    id: "admin-rev-5",
    type: "center_payout",
    description: "Payout to Lifebridge Medical",
    amount: "-500000.00",
    currency: "NGN",
    reference: "PAYOUT-2024-001",
    date: new Date(Date.now() - 12 * 86400000),
    status: "completed",
    metadata: { centerId: "center-1", withdrawalId: "withdraw-1" },
  },
  {
    id: "admin-rev-6",
    type: "test_commission",
    description: "Test Commission - Cedarcrest Hospitals",
    amount: "1800.00",
    currency: "NGN",
    reference: "COMM-2024-003",
    date: new Date(Date.now() - 7 * 86400000),
    status: "completed",
    metadata: { centerId: "center-4", testCode: "PSN5E6F7G8H9" },
  },
];

export const mockAdminWithdrawals: WithdrawalRequest[] = [
  {
    id: "admin-withdraw-1",
    amount: "2000000.00",
    currency: "NGN",
    bankName: "Zenith Bank",
    accountNumber: "1234567890",
    accountName: "PriveScreen Technologies Ltd",
    status: "completed",
    createdAt: new Date(Date.now() - 30 * 86400000),
    processedAt: new Date(Date.now() - 28 * 86400000),
  },
];

// Nigerian Banks for dropdown
export const nigerianBanks = [
  "Access Bank",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank",
  "Globus Bank",
  "Guaranty Trust Bank",
  "Heritage Bank",
  "Keystone Bank",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "SunTrust Bank",
  "Titan Trust Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
];

// Home Service Bookings
export type HomeServiceBooking = {
  id: string;
  testStandardId: string;
  centerId: string;
  scheduledDate: Date;
  scheduledTime: string;
  address: string;
  phoneNumber: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  price: string;
  createdAt: Date;
  completedAt?: Date;
  resultId?: string;
};

export const mockHomeServiceBookings: HomeServiceBooking[] = [
  {
    id: "booking-1",
    testStandardId: "test-std-1",
    centerId: "center-1",
    scheduledDate: new Date(Date.now() + 3 * 86400000), // 3 days from now
    scheduledTime: "10:00 AM",
    address: "15 Victoria Island, Lagos",
    phoneNumber: "+234 812 345 6789",
    status: "confirmed",
    price: "18850.00",
    createdAt: new Date(Date.now() - 86400000), // Yesterday
  },
  {
    id: "booking-2",
    testStandardId: "test-std-2",
    centerId: "center-2",
    scheduledDate: new Date(Date.now() - 7 * 86400000), // 7 days ago
    scheduledTime: "9:00 AM",
    address: "42 Lekki Phase 1, Lagos",
    phoneNumber: "+234 803 456 7890",
    status: "completed",
    price: "7150.00",
    createdAt: new Date(Date.now() - 10 * 86400000),
    completedAt: new Date(Date.now() - 7 * 86400000),
    resultId: "result-1",
  },
  {
    id: "booking-3",
    testStandardId: "test-std-3",
    centerId: "center-5",
    scheduledDate: new Date(Date.now() - 21 * 86400000), // 3 weeks ago
    scheduledTime: "11:00 AM",
    address: "8 Admiralty Way, Lekki",
    phoneNumber: "+234 809 123 4567",
    status: "completed",
    price: "30625.00",
    createdAt: new Date(Date.now() - 25 * 86400000),
    completedAt: new Date(Date.now() - 21 * 86400000),
    resultId: "result-2",
  },
];

// Sponsor Test Request Data - Patients can request sponsors to pay for their tests
export type SponsorTestRequest = {
  id: string;
  code: string;
  patientId: string;
  patientName: string;
  sponsorEmail?: string;
  sponsorPhone?: string;
  sponsorName?: string;
  centerId: string;
  testPackageId: string;
  testPrice: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'completed';
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
};

export const mockSponsorTestRequests: SponsorTestRequest[] = [
  {
    id: "str-1",
    code: "STR-ABC123",
    patientId: "user-1",
    patientName: "Adebayo Okonkwo",
    sponsorEmail: "sponsor@company.com",
    sponsorName: "Lagos Corp HR",
    centerId: "center-1",
    testPackageId: "test-std-1",
    testPrice: "14500.00",
    message: "Hello, I would like to request that you sponsor my STI screening test. This is part of a routine health check.",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 86400000),
    expiresAt: new Date(Date.now() + 5 * 86400000),
  },
  {
    id: "str-2",
    code: "STR-XYZ789",
    patientId: "user-3",
    patientName: "Chioma Nwosu",
    sponsorPhone: "+234 801 234 5678",
    sponsorName: "HealthFirst NGO",
    centerId: "center-3",
    testPackageId: "test-std-2",
    testPrice: "4500.00",
    message: "I am a beneficiary of your health program. Please sponsor my HIV test.",
    status: "accepted",
    createdAt: new Date(Date.now() - 5 * 86400000),
    expiresAt: new Date(Date.now() + 2 * 86400000),
    acceptedAt: new Date(Date.now() - 3 * 86400000),
  },
];

// Helper to get a sponsor test request by code
export function getSponsorTestByCode(code: string): SponsorTestRequest | undefined {
  return mockSponsorTestRequests.find(str => str.code === code);
}
