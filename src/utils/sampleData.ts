import { MoneyInputs } from '../types/money';
import { TimeInputs } from '../types/time';

export const MONEY_PRESETS: Record<string, { label: string; description: string; inputs: MoneyInputs }> = {
  student: {
    label: 'College Student',
    description: 'Modest stipend/allowance, shared housing, campus meals.',
    inputs: {
      monthlyIncome: 22000,
      food: 6500,
      transport: 1500,
      rent: 8000,
      entertainment: 2000,
      other: 1500,
      savingsTarget: 3500,
      currency: 'INR',
    },
  },
  professional: {
    label: 'Software Engineer',
    description: 'Steady IT salary, urban apartment, leisure budget.',
    inputs: {
      monthlyIncome: 95000,
      food: 16000,
      transport: 5000,
      rent: 28000,
      entertainment: 9000,
      other: 7000,
      savingsTarget: 30000,
      currency: 'INR',
    },
  },
  freelancer: {
    label: 'Creative Freelancer',
    description: 'Higher variable income with equipment & workspace expenses.',
    inputs: {
      monthlyIncome: 140000,
      food: 22000,
      transport: 6500,
      rent: 36000,
      entertainment: 14000,
      other: 16500,
      savingsTarget: 45000,
      currency: 'INR',
    },
  },
};

export const TIME_PRESETS: Record<string, { label: string; description: string; inputs: TimeInputs }> = {
  balanced: {
    label: 'Balanced College Scholar',
    description: 'Healthy sleep, full lecture schedule, and steady evening deep work.',
    inputs: {
      sleep: 7.5,
      collegeWork: 6.0,
      travel: 1.5,
      study: 3.0,
      entertainment: 2.0,
      mealsPersonal: 2.5,
      other: 1.5,
      studyTargetDaily: 3.5,
      semesterWeeks: 16,
      selectedDaysPerWeek: 5,
    },
  },
  examSprint: {
    label: 'Competitive Exam Sprint',
    description: 'Focused preparation phase maximizing daily study and minimizing downtime.',
    inputs: {
      sleep: 7.0,
      collegeWork: 4.0,
      travel: 0.5,
      study: 6.5,
      entertainment: 1.0,
      mealsPersonal: 2.0,
      other: 1.0,
      studyTargetDaily: 6.5,
      semesterWeeks: 10,
      selectedDaysPerWeek: 6,
    },
  },
  workStudy: {
    label: 'Working Professional & Learner',
    description: 'Full-time work commitments balanced with disciplined night study.',
    inputs: {
      sleep: 7.0,
      collegeWork: 8.5,
      travel: 1.5,
      study: 2.0,
      entertainment: 1.5,
      mealsPersonal: 2.0,
      other: 1.0,
      studyTargetDaily: 2.5,
      semesterWeeks: 20,
      selectedDaysPerWeek: 5,
    },
  },
};

export const SAMPLE_CSV_CHURN = `CustomerID,AccountTier,MonthlySpend,UsageHoursDaily,SupportTickets,ChurnScore,SignupDate,Country
CUST-1001,Enterprise,450.00,8.4,1,12.5,2023-01-15,USA
CUST-1002,Pro,120.00,4.2,4,48.2,2023-02-10,Germany
CUST-1003,Free,0.00,1.1,0,82.0,2023-03-01,India
CUST-1004,Enterprise,680.00,9.5,2,15.1,2023-03-22,UK
CUST-1005,Pro,140.00,5.0,8,64.3,2023-04-05,Canada
CUST-1006,Pro,115.00,4.8,1,22.0,2023-04-18,USA
CUST-1007,Free,0.00,0.8,3,89.5,2023-05-12,France
CUST-1008,Enterprise,520.00,7.9,0,8.4,2023-05-30,Japan
CUST-1009,Pro, ,5.5,2,31.0,2023-06-11,Germany
CUST-1010,Enterprise,950.00,12.0,5,19.2,2023-06-25,USA
CUST-1011,Free,0.00,1.5,1,75.0,2023-07-04,India
CUST-1012,Pro,130.00,3.9,6,55.8,2023-07-19,UK
CUST-1013,Enterprise,490.00,8.1,2,14.6,2023-08-01,USA
CUST-1014,Free,0.00,0.5,5,94.2,2023-08-14,Australia
CUST-1015,Pro,125.00,4.4,2,28.4,2023-09-02,Germany
CUST-1016,Enterprise,2400.00,14.5,1,9.1,2023-09-17,USA
CUST-1017,Pro,135.00,5.1,3,38.0,2023-10-01,Canada
CUST-1018,Free,0.00,1.2,2,71.5,2023-10-15,India
CUST-1019,Enterprise,610.00,8.8,0,11.2,2023-11-03,UK
CUST-1020,Pro,110.00,3.5,7,62.0,2023-11-20,France
CUST-1012,Pro,130.00,3.9,6,55.8,2023-07-19,UK
CUST-1021,Enterprise,580.00,8.2,3,16.8,2023-12-05,USA
CUST-1022,Free,0.00,0.9,4,88.0,2023-12-18,Germany
CUST-1023,Pro,145.00,5.3,1,20.5,2024-01-08,Japan
CUST-1024,Enterprise,720.00,9.9,2,13.4,2024-01-22,USA
CUST-1025,Free,0.00,1.0,0,79.0,2024-02-14,India
CUST-1026,Pro,120.00,4.1,5,51.2,2024-03-01,Canada
CUST-1027,Enterprise,810.00,10.2,1,10.0,2024-03-19,UK
CUST-1028,Pro,   ,4.6,3,34.5,2024-04-02,USA
CUST-1029,Free,0.00,0.4,6,96.0,2024-04-20,Australia
`;

export const SAMPLE_CSV_STUDENT = `StudentID,WeeklyStudyHours,SleepHoursDaily,AttendancePercentage,MidtermScore,FinalExamScore,StressIndex,PassingStatus
STU-201,18.5,7.2,94.0,78,84,4.2,PASS
STU-202,24.0,7.0,98.5,86,92,5.1,PASS
STU-203,8.0,5.5,72.0,52,58,7.8,PASS
STU-204,4.5,4.8,61.0,40,42,8.9,FAIL
STU-205,32.0,6.8,100.0,92,97,6.0,PASS
STU-206,14.0,7.5,88.0,68,71,3.8,PASS
STU-207,11.5,6.0,80.0,60,64,6.2,PASS
STU-208,6.0,5.0,65.0,45,49,8.4,FAIL
STU-209,21.0,7.8,92.0,81,85,4.0,PASS
STU-210,16.5,7.0,89.0,74,79,4.5,PASS
STU-211,2.0,8.5,50.0,34,31,9.2,FAIL
STU-212,28.0,7.1,96.0,89,94,5.4,PASS
STU-213,12.0,6.5,82.0,63,67,5.0,PASS
STU-214,19.5,7.4,91.0,79,83,4.1,PASS
STU-215,7.5,5.2,70.0,48,51,7.9,PASS
STU-216,26.5,6.9,97.0,88,91,5.2,PASS
STU-217,15.0,7.0,85.0,70,75,4.7,PASS
STU-218,5.0,4.5,58.0,38,40,9.0,FAIL
STU-219,22.5,7.3,95.0,84,88,4.3,PASS
STU-220,10.0,6.2,76.0,56,61,6.5,PASS
`;

export const SAMPLE_CSV_BUDGET = `TransactionID,Date,Category,Amount,PaymentMethod,Merchant,Flagged
TX-801,2024-01-02,Groceries,4250,UPI,SuperMart,No
TX-802,2024-01-03,Transport,350,MetroCard,DMRC Metro,No
TX-803,2024-01-05,Rent,28000,NetBanking,Landlord Transfer,No
TX-804,2024-01-08,Dining,1850,CreditCard,Bistro Central,No
TX-805,2024-01-10,Utilities,2400,UPI,Power Corp,No
TX-806,2024-01-14,Groceries,3100,UPI,Fresh Organics,No
TX-807,2024-01-16,Entertainment,999,CreditCard,StreamFlix Sub,No
TX-808,2024-01-20,Shopping,6500,CreditCard,Urban Outfitters,No
TX-809,2024-01-22,Transport,450,UPI,Uber Ride,No
TX-810,2024-01-25,Dining,2400,CreditCard,Olive Garden,No
TX-811,2024-01-28,Healthcare,1200,UPI,Apollo Pharmacy,No
TX-812,2024-01-30,Groceries,2800,UPI,Daily Market,No
TX-813,2024-02-01,Rent,28000,NetBanking,Landlord Transfer,No
TX-814,2024-02-04,Groceries,4600,UPI,SuperMart,No
TX-815,2024-02-09,Electronics,48000,CreditCard,Apple Store,Yes
TX-816,2024-02-12,Transport,500,MetroCard,DMRC Metro,No
TX-817,2024-02-15,Dining,1650,UPI,Coffee Club,No
`;
