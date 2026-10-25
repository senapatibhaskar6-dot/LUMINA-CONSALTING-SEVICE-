export const ASSAM_DISTRICTS: string[] = [
  'Barpeta',
  'Bajali',
  'Baksa',
  'Biswanath',
  'Bongaigaon',
  'Cachar',
  'Charaideo',
  'Chirang',
  'Darrang',
  'Dhemaji',
  'Dhubri',
  'Dibrugarh',
  'Dima Hasao',
  'Goalpara',
  'Golaghat',
  'Hailakandi',
  'Hojai',
  'Jorhat',
  'Kamrup Metropolitan (Guwahati)',
  'Kamrup Rural',
  'Karbi Anglong',
  'Karimganj',
  'Kokrajhar',
  'Lakhimpur',
  'Majuli',
  'Morigaon',
  'Nagaon',
  'Nalbari',
  'Sivasagar',
  'Sonitpur',
  'South Salmara-Mankachar',
  'Tamulpur',
  'Tinsukia',
  'Udalguri',
  'West Karbi Anglong',
  'Other / Outside Assam'
];

export const QUALIFICATIONS: string[] = [
  'Class 10th Pass (Matriculate / HSLC)',
  'Class 12th Pass (Higher Secondary / HS)',
  'Graduate (BA / B.Sc / B.Com / BCA)',
  'Post Graduate (MA / M.Sc / M.Com)',
  'Ex-Army / Ex-Paramilitary Service Certificate',
  'Diploma / ITI (Technical / Security Management)',
  'Other Equivalent Qualification'
];

export const SALARY_MATRIX = {
  'Security Supervisor': {
    monthlySalary: 'Rs. 26,178',
    monthlySalaryNumeric: 26178,
    note: 'Inclusive / excluding of PF and ESIC as applicable under GeM guidelines',
    qualificationHint: 'Minimum 10th/12th Pass + Prior Security/Supervisor Experience + Valid Driving License required',
    dutySchedule: 'Rotating 3 Shifts (24x7 Coverage): Morning, Evening, Night',
    responsibilities: [
      'Supervision of security guards at all BMCH hospital blocks, OPD, ICU, and casualty wards',
      'Daily muster roll verification, shift deployment, and visitor crowd management',
      'Liaison with hospital superintendent and local police authorities during emergencies'
    ]
  },
  'Unarmed Security Guard': {
    monthlySalary: 'Rs. 17,756',
    monthlySalaryNumeric: 17756,
    note: 'Inclusive / excluding of PF and ESIC as applicable under GeM guidelines',
    qualificationHint: 'Minimum 10th Pass (HSLC) / Physical fitness standard as per security norms',
    dutySchedule: 'Rotating 3 Shifts (24x7 Coverage): Morning, Evening, Night (8 Hours each)',
    responsibilities: [
      'Stationary and perimeter patrolling of hospital premises and emergency gates',
      'Visitor screening, patient attendant regulation, and property surveillance',
      'Prompt assistance in emergency patient transfer and casualty gate discipline'
    ]
  }
} as const;

export const APPLICATION_FEE = 200; // in INR
export const GEM_BID_NUMBER = 'GEM/2026/B/8101646';
export const INSTITUTION_NAME = 'Barpeta Medical College and Hospital (BMCH)';
export const INSTITUTION_FULL_NAME = 'Fakhruddin Ali Ahmed Medical College & Hospital (FAAMCH), Barpeta, Assam';
export const AGENCY_NAME = 'LUMINA BUSINESS CONSULTING SERVICES';
export const AGENCY_ADDRESS = 'Bharalu, Guwahati-781009, Kamrup(M), Assam';
export const AGENCY_FULL_DETAILS = 'Lumina Business Consulting Services, Bharalu, Guwahati-781009, Kamrup(M), Assam';
export const REGISTRATION_LAST_DATE = '31/11/2026';
export const REGISTRATION_LAST_DATE_DISPLAY = '31/11/2026';
