import React, { useState } from 'react';
import { RegistrationFormData, SecurityPosition } from '../types';
import { ASSAM_DISTRICTS, QUALIFICATIONS, APPLICATION_FEE, GEM_BID_NUMBER, AGENCY_NAME, AGENCY_ADDRESS } from '../data/assamDistricts';
import { PositionSalarySelector } from './PositionSalarySelector';
import {
  User,
  MapPin,
  Phone,
  CreditCard,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Calendar
} from 'lucide-react';

interface RegistrationFormProps {
  initialData?: RegistrationFormData;
  onSubmit: (formData: RegistrationFormData) => void;
}

const DEFAULT_FORM: RegistrationFormData = {
  position: 'Unarmed Security Guard',
  fullName: '',
  fatherName: '',
  dob: '',
  gender: '',
  qualification: '',
  villageTown: '',
  postOffice: '',
  district: 'Barpeta',
  pinCode: '',
  contactNumber: '',
  aadhaarNumber: '',
  email: '',
  experienceYears: '1',
  isExServicemen: 'No',
  exServicemenDetails: '',
  drivingLicenseNo: '',
  drivingLicenseValidUpTo: '',
  acceptedDeclaration: false,
};

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<RegistrationFormData>(
    initialData || DEFAULT_FORM
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Helper to handle text changes
  const handleChange = (
    field: keyof RegistrationFormData,
    value: string | boolean
  ) => {
    // If full name, force capital letters
    if (field === 'fullName' && typeof value === 'string') {
      value = value.toUpperCase();
    }
    
    // If contact number, clean non-digits, max 10
    if (field === 'contactNumber' && typeof value === 'string') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    // If PIN code, clean non-digits, max 6
    if (field === 'pinCode' && typeof value === 'string') {
      value = value.replace(/\D/g, '').slice(0, 6);
    }

    // If Aadhaar / VID, clean non-digits, max 16
    if (field === 'aadhaarNumber' && typeof value === 'string') {
      value = value.replace(/\D/g, '').slice(0, 16);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required (in Capital Letters).';
    } else if (!/^[A-Z\s.]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Full Name must contain English capital letters only.';
    }

    if (!formData.fatherName.trim()) {
      newErrors.fatherName = "Father's / Guardian's Name is required.";
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of Birth is required.';
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        newErrors.dob = 'Applicant must be at least 18 years old to apply.';
      } else if (age > 60) {
        newErrors.dob = 'Maximum age limit for security recruitment is 60 years.';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your Gender.';
    }

    if (!formData.qualification) {
      newErrors.qualification = 'Please select your Educational Qualification.';
    }

    if (!formData.villageTown.trim()) {
      newErrors.villageTown = 'Village / Town name is required.';
    }

    if (!formData.postOffice.trim()) {
      newErrors.postOffice = 'Post Office (P.O.) is required.';
    }

    if (!formData.district) {
      newErrors.district = 'Please select your District in Assam.';
    }

    if (!formData.pinCode || formData.pinCode.length !== 6) {
      newErrors.pinCode = 'Valid 6-digit Postal PIN Code is required.';
    }

    if (!formData.contactNumber || formData.contactNumber.length !== 10) {
      newErrors.contactNumber = 'Valid 10-digit Indian Mobile Number is required.';
    }

    if (!formData.aadhaarNumber || (formData.aadhaarNumber.length !== 12 && formData.aadhaarNumber.length !== 16)) {
      newErrors.aadhaarNumber = 'Valid 12-digit Aadhaar Card or 16-digit VID number is required.';
    }

    // Driving license specifically required for Security Supervisor
    if (formData.position === 'Security Supervisor') {
      if (!formData.drivingLicenseNo.trim()) {
        newErrors.drivingLicenseNo = 'Driving License Number is mandatory for Security Supervisor post.';
      }
      if (!formData.drivingLicenseValidUpTo) {
        newErrors.drivingLicenseValidUpTo = 'License validity date is required for Supervisor.';
      }
    }

    if (!formData.acceptedDeclaration) {
      newErrors.acceptedDeclaration =
        'You must accept the terms and conditions to perform 3-shift duty (24x7) at BMCH.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    } else {
      // Scroll to first error
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  // Quick fill samples for evaluator convenience
  const fillSample = (role: SecurityPosition) => {
    if (role === 'Security Supervisor') {
      setFormData({
        position: 'Security Supervisor',
        fullName: 'BHASKAR JYOTI KALITA',
        fatherName: 'Late Bipul Chandra Kalita',
        dob: '1992-05-14',
        gender: 'Male',
        qualification: 'Graduate (BA / B.Sc / B.Com / BCA)',
        villageTown: 'Barpeta Town, Ward No 4',
        postOffice: 'Barpeta P.O.',
        district: 'Barpeta',
        pinCode: '781301',
        contactNumber: '9864201934',
        aadhaarNumber: '748291038491',
        email: 'bhaskar.sec.bmch@gmail.com',
        experienceYears: '4',
        isExServicemen: 'No',
        exServicemenDetails: '',
        drivingLicenseNo: 'AS-15-20150029381',
        drivingLicenseValidUpTo: '2029-08-20',
        acceptedDeclaration: true,
      });
    } else {
      setFormData({
        position: 'Unarmed Security Guard',
        fullName: 'PRANJAL NATH',
        fatherName: 'Dineswar Nath',
        dob: '1997-11-22',
        gender: 'Male',
        qualification: 'Class 10th Pass (Matriculate / HSLC)',
        villageTown: 'Howly Pathsala Road',
        postOffice: 'Howly',
        district: 'Barpeta',
        pinCode: '781316',
        contactNumber: '9435182940',
        aadhaarNumber: '619283740192',
        email: 'pranjalnath.sec@gmail.com',
        experienceYears: '2',
        isExServicemen: 'No',
        exServicemenDetails: '',
        drivingLicenseNo: '',
        drivingLicenseValidUpTo: '',
        acceptedDeclaration: true,
      });
    }
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Sample Fast-Fill Bar for testing */}
      <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Sparkles className="w-4 h-4 text-sky-800" />
          <span>Quick Autofill for Testing & Demo:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fillSample('Security Supervisor')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Autofill Supervisor Sample
          </button>
          <button
            type="button"
            onClick={() => fillSample('Unarmed Security Guard')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Autofill Guard Sample
          </button>
        </div>
      </div>

      {/* 1. Position & Salary Selection */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-900 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Position & Remuneration Details
            </h2>
            <p className="text-xs text-slate-500">
              Recruitment managed by {AGENCY_NAME} under GeM Bid: {GEM_BID_NUMBER} for Barpeta Medical College & Hospital
            </p>
          </div>
        </div>

        <PositionSalarySelector
          selectedPosition={formData.position}
          onChangePosition={(pos) => handleChange('position', pos)}
        />
      </div>

      {/* 2. Personal Details */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-900 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Personal Details</h2>
            <p className="text-xs text-slate-500">
              Must match with your Aadhaar and official government identity proofs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name in Capital Letters */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Full Name (in Capital Letters) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder="E.G. RAMESH CHANDRA BARMAN"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-semibold tracking-wide uppercase transition-colors outline-none ${
                  errors.fullName
                    ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                    : 'border-slate-300 focus:border-sky-800'
                }`}
              />
            </div>
            {errors.fullName ? (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 inline shrink-0" /> {errors.fullName}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Letters automatically convert to capital. Type exactly as written on your Aadhaar Card.
              </p>
            )}
          </div>

          {/* Father's / Guardian's Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Father's / Guardian's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fatherName}
              onChange={(e) => handleChange('fatherName', e.target.value)}
              onBlur={() => handleBlur('fatherName')}
              placeholder="Enter Father's or Guardian's full name"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors outline-none ${
                errors.fatherName
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                  : 'border-slate-300 focus:border-sky-800'
              }`}
            />
            {errors.fatherName && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.fatherName}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                onBlur={() => handleBlur('dob')}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors outline-none ${
                  errors.dob
                    ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                    : 'border-slate-300 focus:border-sky-800'
                }`}
              />
            </div>
            {errors.dob ? (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.dob}</p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Age must be between 18 and 60 years as on date of application.
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              onBlur={() => handleBlur('gender')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white transition-colors outline-none cursor-pointer ${
                errors.gender
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                  : 'border-slate-300 focus:border-sky-800'
              }`}
            >
              <option value="">-- Select Gender --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.gender}</p>
            )}
          </div>

          {/* Educational Qualification */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Educational Qualification <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.qualification}
              onChange={(e) => handleChange('qualification', e.target.value)}
              onBlur={() => handleBlur('qualification')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white transition-colors outline-none cursor-pointer ${
                errors.qualification
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                  : 'border-slate-300 focus:border-sky-800'
              }`}
            >
              <option value="">-- Select Qualification --</option>
              {QUALIFICATIONS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
            {errors.qualification && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.qualification}</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Address Details */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-900 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Residential Address Details</h2>
            <p className="text-xs text-slate-500">
              Permanent / Present residence in Assam
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Vill / Town */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Village / Town <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.villageTown}
              onChange={(e) => handleChange('villageTown', e.target.value)}
              onBlur={() => handleBlur('villageTown')}
              placeholder="e.g. Ward No 3, Barpeta Town"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors outline-none ${
                errors.villageTown
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                  : 'border-slate-300 focus:border-sky-800'
              }`}
            />
            {errors.villageTown && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.villageTown}</p>
            )}
          </div>

          {/* Post Office */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Post Office (P.O.) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.postOffice}
              onChange={(e) => handleChange('postOffice', e.target.value)}
              onBlur={() => handleBlur('postOffice')}
              placeholder="e.g. Barpeta H.O."
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors outline-none ${
                errors.postOffice
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                  : 'border-slate-300 focus:border-sky-800'
              }`}
            />
            {errors.postOffice && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.postOffice}</p>
            )}
          </div>

          {/* District */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              District (Assam) <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.district}
              onChange={(e) => handleChange('district', e.target.value)}
              onBlur={() => handleBlur('district')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white transition-colors outline-none cursor-pointer ${
                errors.district
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                  : 'border-slate-300 focus:border-sky-800'
              }`}
            >
              <option value="">-- Select District --</option>
              {ASSAM_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.district && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.district}</p>
            )}
          </div>

          {/* PIN Code */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Postal PIN Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.pinCode}
              onChange={(e) => handleChange('pinCode', e.target.value)}
              onBlur={() => handleBlur('pinCode')}
              placeholder="e.g. 781301"
              maxLength={6}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono tracking-wider transition-colors outline-none ${
                errors.pinCode
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                  : 'border-slate-300 focus:border-sky-800'
              }`}
            />
            {errors.pinCode && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.pinCode}</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Contact Details & Aadhaar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-900 flex items-center justify-center font-bold text-sm">
            4
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Contact & Identity Proof</h2>
            <p className="text-xs text-slate-500">
              Payment confirmation & interview date alerts will be sent to this phone number
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Contact Number */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Contact Number (Mobile) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-2.5 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-sm font-semibold">
                +91
              </span>
              <input
                type="text"
                value={formData.contactNumber}
                onChange={(e) => handleChange('contactNumber', e.target.value)}
                onBlur={() => handleBlur('contactNumber')}
                placeholder="10-digit mobile number"
                maxLength={10}
                className={`w-full px-3.5 py-2.5 rounded-r-lg border text-sm font-mono tracking-wider transition-colors outline-none ${
                  errors.contactNumber
                    ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                    : 'border-slate-300 focus:border-sky-800'
                }`}
              />
            </div>
            {errors.contactNumber ? (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.contactNumber}</p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                Active SMS-enabled phone number required for real-time interview notice.
              </p>
            )}
          </div>

          {/* Aadhaar / VID Card Number */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Aadhaar / VID Card Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.aadhaarNumber}
              onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
              onBlur={() => handleBlur('aadhaarNumber')}
              placeholder="12-digit Aadhaar or 16-digit VID"
              maxLength={16}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono tracking-wider transition-colors outline-none ${
                errors.aadhaarNumber
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                  : 'border-slate-300 focus:border-sky-800'
              }`}
            />
            {errors.aadhaarNumber ? (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.aadhaarNumber}</p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Enter without spaces. Aadhaar will be verified during document scrutiny.
              </p>
            )}
          </div>

          {/* Email Address (Optional) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="e.g. applicant@email.com (for e-receipt copy)"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm transition-colors outline-none focus:border-sky-800"
            />
          </div>
        </div>
      </div>

      {/* 5. Experience & License Details */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-900 flex items-center justify-center font-bold text-sm">
            5
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Experience & License Details</h2>
            <p className="text-xs text-slate-500">
              Note: Driving License is mandatory for Security Supervisor candidates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Total Years of Experience */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Total Years of Experience (Security / Defense) <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.experienceYears}
              onChange={(e) => handleChange('experienceYears', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white transition-colors outline-none cursor-pointer focus:border-sky-800"
            >
              <option value="0">Fresher (0 Years)</option>
              <option value="1">1 Year Experience</option>
              <option value="2">2 Years Experience</option>
              <option value="3">3 Years Experience</option>
              <option value="4">4 Years Experience</option>
              <option value="5+">5+ Years Experience</option>
              <option value="10+">10+ Years (Senior / Veteran)</option>
            </select>
          </div>

          {/* Ex-Servicemen Status */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Ex-Servicemen Status (Defense / Paramilitary) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="radio"
                  name="isExServicemen"
                  checked={formData.isExServicemen === 'No'}
                  onChange={() => handleChange('isExServicemen', 'No')}
                  className="w-4 h-4 text-sky-900 focus:ring-sky-800"
                />
                <span>No</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="radio"
                  name="isExServicemen"
                  checked={formData.isExServicemen === 'Yes'}
                  onChange={() => handleChange('isExServicemen', 'Yes')}
                  className="w-4 h-4 text-sky-900 focus:ring-sky-800"
                />
                <span>Yes (Army / Navy / IAF / Assam Rifles / CRPF / BSF)</span>
              </label>
            </div>
          </div>

          {/* Ex-Servicemen Details if Yes */}
          {formData.isExServicemen === 'Yes' && (
            <div className="md:col-span-2 p-3 bg-amber-50/70 rounded-lg border border-amber-200">
              <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1">
                Discharge Book No / Regimental Force Details
              </label>
              <input
                type="text"
                value={formData.exServicemenDetails || ''}
                onChange={(e) => handleChange('exServicemenDetails', e.target.value)}
                placeholder="e.g. Ex-Naik 10 Assam Regiment, PPO / Discharge Book No: 12345/DIS"
                className="w-full px-3 py-2 rounded border border-amber-300 text-sm bg-white focus:outline-none"
              />
            </div>
          )}

          {/* Driving License Number (Mandatory for Supervisor) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Driving License Number{' '}
                {formData.position === 'Security Supervisor' ? (
                  <span className="text-red-500">* (Mandatory for Supervisor)</span>
                ) : (
                  <span className="text-slate-400 font-normal">(Optional for Guard)</span>
                )}
              </label>
            </div>
            <input
              type="text"
              value={formData.drivingLicenseNo}
              onChange={(e) => handleChange('drivingLicenseNo', e.target.value.toUpperCase())}
              onBlur={() => handleBlur('drivingLicenseNo')}
              placeholder="e.g. AS-15-20180012345"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono uppercase tracking-wider transition-colors outline-none ${
                errors.drivingLicenseNo
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                  : 'border-slate-300 focus:border-sky-800'
              }`}
            />
            {errors.drivingLicenseNo ? (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.drivingLicenseNo}</p>
            ) : formData.position === 'Security Supervisor' ? (
              <p className="text-[11px] text-sky-800 mt-1 font-medium">
                Supervisors require valid license for emergency hospital mobility.
              </p>
            ) : null}
          </div>

          {/* Driving License Valid Up To */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              License Valid Up To (Date){' '}
              {formData.position === 'Security Supervisor' ? (
                <span className="text-red-500">*</span>
              ) : (
                <span className="text-slate-400 font-normal">(If applicable)</span>
              )}
            </label>
            <input
              type="date"
              value={formData.drivingLicenseValidUpTo}
              onChange={(e) => handleChange('drivingLicenseValidUpTo', e.target.value)}
              onBlur={() => handleBlur('drivingLicenseValidUpTo')}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors outline-none ${
                errors.drivingLicenseValidUpTo
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                  : 'border-slate-300 focus:border-sky-800'
              }`}
            />
            {errors.drivingLicenseValidUpTo && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                {errors.drivingLicenseValidUpTo}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 6. Terms & Conditions / Declaration */}
      <div className="bg-sky-50/50 rounded-2xl p-6 border border-sky-200">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sky-100 mb-4">
          <FileCheck className="w-5 h-5 text-sky-900" />
          <h2 className="text-base font-bold text-slate-900">
            Mandatory Declaration & Shift Commitment (BMCH)
          </h2>
        </div>

        <div className="space-y-3 text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-sky-100">
          <p className="font-semibold text-slate-900">
            Barpeta Medical College and Hospital (BMCH) operates emergency, casualty, ICU, and inpatient hospital services on a round-the-clock basis (24x7).
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>
              I agree to perform active duty in <strong>3 rotating shifts</strong> (Shift A: 06:00 to 14:00, Shift B: 14:00 to 22:00, Shift C: 22:00 to 06:00) as scheduled by hospital authorities without exception.
            </li>
            <li>
              I certify that all details submitted (Name, Age, Address, Aadhaar, Experience & Driving License) are accurate and genuine.
            </li>
            <li>
              I understand that the Application Registration Fee of <strong>Rs. {APPLICATION_FEE}</strong> is strictly non-refundable under all circumstances.
            </li>
          </ul>
        </div>

        <div className="mt-4 pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.acceptedDeclaration}
              onChange={(e) => handleChange('acceptedDeclaration', e.target.checked)}
              className="w-5 h-5 rounded text-sky-900 border-slate-300 mt-0.5 focus:ring-sky-800"
            />
            <span className="text-xs font-semibold text-slate-900 leading-normal">
              I accept the above terms and conditions and hereby give my solemn consent to perform duty in 3 shifts (24x7 basis) at Barpeta Medical College and Hospital (BMCH). <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.acceptedDeclaration && (
            <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 inline" /> {errors.acceptedDeclaration}
            </p>
          )}
        </div>
      </div>

      {/* 7. Fee & Submission Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-xs text-slate-500 font-medium">Non-Refundable Processing Fee:</div>
          <div className="text-2xl font-extrabold text-slate-900 flex items-center gap-1 font-mono">
            <span>Rs. {APPLICATION_FEE}.00</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 ml-2">
              Payment Gateway Secured
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            GeM Reference: {GEM_BID_NUMBER} · Cashfree Payment Gateway Integration
          </div>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-sky-900 hover:bg-sky-800 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CreditCard className="w-4 h-4 text-amber-300" />
          <span>Proceed to Pay Rs. {APPLICATION_FEE} & Submit</span>
        </button>
      </div>
    </form>
  );
};
