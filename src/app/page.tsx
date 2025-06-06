'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { JobFormData, jobFormSchema } from '@/lib/schema';
import { FormInput, FormCheckbox, FormSelect } from '@/components/FormInput';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Open_Sans } from 'next/font/google';
import { supabase } from '@/lib/supabaseClient';
import SuccessModal from '@/components/SuccessModal';
import ExhibitUpload from '@/components/ExhibitUpload';

// Initialize Open Sans font
const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['700'], // Assuming the title is bold, adjust if needed
});

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [selectedExhibits, setSelectedExhibits] = useState<File[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      scheduledStartTime: '09:00',
      actualStartTime: '09:00',
      endTime: '09:00',
      testimonyTypes: {
        regular: false,
        technical: false,
        video: false,
        interpreter: false,
        realtime: false,
        roughDraft: false,
        recordingTranscription: false,
      },
      expenses: {
        parking: '',
        travel: '',
        mileage: '',
        shipping: '',
        other: '',
      },
      exhibitFiles: [],
    },
  });

  console.log('Form errors:', errors);

  // Trap focus in modal and close on Escape
  useEffect(() => {
    if (!showSuccessModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
      // Trap focus
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    // Focus the close button on open
    setTimeout(() => {
      modalRef.current?.querySelector('button')?.focus();
    }, 0);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuccessModal]);

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    window.location.reload();
  };

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting form', data);
      // Fetch user's IP address
      let ip_address = null;
      try {
        const res = await fetch('/api/ip');
        const json = await res.json();
        ip_address = json.ip || null;
      } catch (e) {
        console.warn('Could not fetch IP address', e);
      }
      // Prepare data for Supabase
      const {
        testimonyTypes,
        expenses,
        exhibitFiles,
        ...rest
      } = data;

      // --- Upload exhibit files to Supabase Storage ---
      const exhibit_file_urls: string[] = [];
      const exhibit_file_names: string[] = [];
      if (Array.isArray(exhibitFiles) && exhibitFiles.length > 0) {
        for (const file of exhibitFiles) {
          // Type guard: only process if file is a File
          if (!(file instanceof File)) continue;
          const filePath = `${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('exhibit-uploads')
            .upload(filePath, file, { upsert: false });
          if (uploadError) {
            alert(`Error uploading file ${file.name}: ${uploadError.message}`);
            return;
          }
          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('exhibit-uploads')
            .getPublicUrl(filePath);
          if (publicUrlData?.publicUrl) {
            // Log the URL for debugging
            console.log('Supabase public URL:', publicUrlData.publicUrl);
            // Fix any accidental missing 'h' in https
            let url = publicUrlData.publicUrl;
            if (url.startsWith('ttps://')) {
              url = 'h' + url;
            }
            exhibit_file_urls.push(url);
            exhibit_file_names.push(file.name);
          }
        }
      }

      // Map camelCase to snake_case for Supabase
      const mappedData = {
        // Job Info
        job_number: rest.jobNumber,
        job_date: rest.jobDate,
        scheduled_start_time: rest.scheduledStartTime,
        actual_start_time: rest.actualStartTime,
        is_remote_proceeding: rest.isRemoteProceeding,
        end_time: rest.endTime,
        report_wait_time: rest.reportWaitTime,
        // Resource Info
        reporter: rest.reporter,
        reporter_email: rest.reporterEmail,
        reporter_cell: rest.reporterCell,
        videographer_quality: rest.videographerQuality,
        // Case Info
        court_number: rest.courtNumber,
        county_district: rest.countyDistrict,
        trial_date: rest.trialDate,
        cause_number: rest.causeNumber,
        style: rest.style,
        // Witness Info
        witness_name: rest.witnessName,
        witness_email: rest.witnessEmail,
        witness_type: rest.witnessType,
        is_no_show: rest.isNoShow,
        is_cna: rest.isCNA,
        has_attorney: rest.hasAttorney,
        is_attorney_present: rest.isAttorneyPresent,
        requires_read_and_sign: rest.requiresReadAndSign,
        witness_attorney_email: rest.witnessAttorneyEmail,
        // Original Transcript Info
        is_rush: rest.isRush,
        due_date: rest.dueDate,
        total_pages: rest.totalPages,
        testimony_regular: testimonyTypes.regular,
        testimony_technical: testimonyTypes.technical,
        testimony_video: testimonyTypes.video,
        testimony_interpreter: testimonyTypes.interpreter,
        testimony_realtime: testimonyTypes.realtime,
        testimony_rough_draft: testimonyTypes.roughDraft,
        testimony_recording_transcription: testimonyTypes.recordingTranscription,
        transcription_listening_hours: rest.transcriptionListeningHours,
        // Original Exhibits Info
        exhibits_marked: rest.exhibitsMarked,
        exhibits_through: rest.exhibitsThrough,
        total_exhibits: rest.totalExhibits,
        received_via: rest.receivedVia,
        attach_to_transcript: rest.attachToTranscript,
        return_to: rest.returnTo,
        // Expense Reimbursement
        expense_parking: expenses.parking,
        expense_travel: expenses.travel,
        expense_mileage: expenses.mileage,
        expense_shipping: expenses.shipping,
        expense_other: expenses.other,
        // Exhibit Upload
        exhibit_file_names,
        exhibit_file_urls,
        // Other Instructions
        special_instructions: rest.specialInstructions,
        // IP Address
        ip_address,
      };

      const { error } = await supabase.from('job_sheet').insert([mappedData]);
      if (error) {
        alert('Error submitting job sheet: ' + error.message);
        setIsSubmitting(false);
      } else {
        // Send data to n8n webhook
        try {
          await fetch('https://lukesandbox.app.n8n.cloud/webhook-test/job-sheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mappedData),
          });
        } catch (e) {
          console.warn('Failed to send data to n8n webhook', e);
        }
        setShowSuccessModal(true);
        setIsSubmitting(false);
      }
    } catch (e) {
      setIsSubmitting(false);
      throw e;
    }
  };

  // Dummy data for testing
  const dummyData: Partial<JobFormData> = {
    jobNumber: 'JOB-12345',
    jobDate: '2024-07-01',
    scheduledStartTime: '09:00',
    actualStartTime: '09:15',
    isRemoteProceeding: true,
    endTime: '11:30',
    reportWaitTime: '10',
    reporter: 'Jane Doe',
    reporterEmail: 'jane.doe@example.com',
    reporterCell: '555-123-4567',
    videographerQuality: true,
    courtNumber: 'C-2024-001',
    countyDistrict: 'Travis',
    trialDate: '2024-07-10',
    causeNumber: 'A123456',
    style: 'State vs. Smith',
    witnessName: 'John Smith',
    witnessEmail: 'john.smith@example.com',
    witnessType: 'Expert',
    isNoShow: false,
    isCNA: false,
    hasAttorney: true,
    isAttorneyPresent: true,
    requiresReadAndSign: false,
    witnessAttorneyEmail: 'attorney@example.com',
    isRush: false,
    dueDate: '2024-07-05',
    totalPages: '120',
    testimonyTypes: {
      regular: true,
      technical: false,
      video: true,
      interpreter: false,
      realtime: false,
      roughDraft: false,
      recordingTranscription: false,
    },
    transcriptionListeningHours: '2',
    exhibitsMarked: '1',
    exhibitsThrough: '5',
    totalExhibits: '5',
    receivedVia: 'Electronic',
    attachToTranscript: true,
    returnTo: 'Clerk',
    expenses: {
      parking: '10',
      travel: '20',
      mileage: '15',
      shipping: '5',
      other: '0',
    },
    specialInstructions: 'N/A',
  };

  // Handler to fill form with dummy data
  const handleTestInterface = () => {
    Object.entries(dummyData).forEach(([key, value]) => {
      setValue(key as keyof JobFormData, value as JobFormData[keyof JobFormData], { shouldValidate: true });
    });
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <main className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm px-4 py-4 mb-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="https://brazilco.com/" target="_blank" rel="noopener noreferrer" aria-label="BrazilCo Home">
            <Image src="/BRAZIL_Logo.webp" alt="BrazilCo Logo" width={160} height={40} priority className="h-10 w-auto" />
          </a>
          {/* Hamburger button for mobile */}
          <button
            className="md:hidden ml-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Open navigation menu"
            aria-expanded={isNavOpen}
            onClick={() => setIsNavOpen((open) => !open)}
          >
            <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Desktop nav */}
          <nav className="hidden md:flex gap-8">
            <a href="https://brazilco.com/services/court-reporting/" className="text-black font-semibold hover:text-primary transition" target="_blank" rel="noopener noreferrer">Services</a>
            <a href="https://brazilco.com/about/" className="text-black font-semibold hover:text-primary transition" target="_blank" rel="noopener noreferrer">About</a>
            <a href="https://brazilco.com/contact/" className="text-black font-semibold hover:text-primary transition" target="_blank" rel="noopener noreferrer">Contact</a>
          </nav>
        </div>
        {/* Mobile nav menu */}
        {isNavOpen && (
          <nav className="md:hidden mt-2 animate-fade-in flex flex-col items-center bg-white rounded shadow-lg py-4 z-50">
            <a href="https://brazilco.com/services/court-reporting/" className="block w-full text-center py-2 text-black font-semibold hover:text-primary transition" target="_blank" rel="noopener noreferrer" onClick={() => setIsNavOpen(false)}>Services</a>
            <a href="https://brazilco.com/about/" className="block w-full text-center py-2 text-black font-semibold hover:text-primary transition" target="_blank" rel="noopener noreferrer" onClick={() => setIsNavOpen(false)}>About</a>
            <a href="https://brazilco.com/contact/" className="block w-full text-center py-2 text-black font-semibold hover:text-primary transition" target="_blank" rel="noopener noreferrer" onClick={() => setIsNavOpen(false)}>Contact</a>
          </nav>
        )}
      </header>
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow">
        <h1 className={`text-3xl font-bold text-black mb-6 text-center tracking-wide ${openSans.className}`}>COURT REPORTER JOB SHEET</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Job Info Section */}
          <section className="form-section">
            <h2 className="form-section-title">Job Information</h2>
            <div className="form-row">
              <FormInput<JobFormData>
                label="Job Number"
                name="jobNumber"
                required
                register={register}
                error={errors.jobNumber?.message}
              />
              <FormInput<JobFormData>
                label="Job Date"
                name="jobDate"
                type="date"
                required
                register={register}
                error={errors.jobDate?.message}
              />
            </div>
            <div className="form-row">
              <FormInput<JobFormData>
                label="Scheduled Start Time"
                name="scheduledStartTime"
                type="time"
                required
                register={register}
                error={errors.scheduledStartTime?.message}
              />
              <FormInput<JobFormData>
                label="Actual Start Time"
                name="actualStartTime"
                type="time"
                register={register}
                error={errors.actualStartTime?.message}
              />
              <FormInput<JobFormData>
                label="End Time"
                name="endTime"
                type="time"
                required
                register={register}
                error={errors.endTime?.message}
              />
            </div>
            <div className="form-row">
              <FormCheckbox<JobFormData>
                label="Remote Proceeding (Zoom)"
                name="isRemoteProceeding"
                register={register}
              />
            </div>
          </section>

          {/* Resource Info Section */}
          <section className="form-section">
            <h2 className="form-section-title">Resource Information</h2>
            <div className="form-row">
              <FormInput<JobFormData>
                label="Reporter Name"
                name="reporter"
                required
                register={register}
                error={errors.reporter?.message}
              />
              <FormInput<JobFormData>
                label="Email"
                name="reporterEmail"
                type="email"
                required
                register={register}
                error={errors.reporterEmail?.message}
              />
              <FormInput<JobFormData>
                label="Cell"
                name="reporterCell"
                required
                register={register}
                error={errors.reporterCell?.message}
              />
            </div>
          </section>

          {/* Case Info Section */}
          <section className="form-section">
            <h2 className="form-section-title">Case Information</h2>
            <div className="form-row">
              <FormInput<JobFormData>
                label="Court Number"
                name="courtNumber"
                required
                register={register}
                error={errors.courtNumber?.message}
              />
              <FormInput<JobFormData>
                label="County / District"
                name="countyDistrict"
                required
                register={register}
                error={errors.countyDistrict?.message}
              />
            </div>
            <div className="form-row">
              <FormInput<JobFormData>
                label="Trial Date"
                name="trialDate"
                type="date"
                register={register}
                error={errors.trialDate?.message}
              />
              <FormInput<JobFormData>
                label="Cause Number"
                name="causeNumber"
                required
                register={register}
                error={errors.causeNumber?.message}
              />
            </div>
            <div className="form-row">
              <FormInput<JobFormData>
                label="Style"
                name="style"
                required
                register={register}
                error={errors.style?.message}
              />
            </div>
          </section>

          {/* Witness Info Section */}
          <section className="form-section">
            <h2 className="form-section-title">Witness Information</h2>
            <div className="form-row">
              <FormInput<JobFormData>
                label="Witness Name"
                name="witnessName"
                required
                register={register}
                error={errors.witnessName?.message}
              />
              <FormInput<JobFormData>
                label="Witness Email"
                name="witnessEmail"
                type="email"
                required
                register={register}
                error={errors.witnessEmail?.message}
              />
            </div>
            <div className="form-row">
              <FormSelect<JobFormData>
                label="Witness Type"
                name="witnessType"
                required
                register={register}
                error={errors.witnessType?.message}
                options={[
                  { value: 'Party', label: 'Party' },
                  { value: 'Fact', label: 'Fact' },
                  { value: 'Expert', label: 'Expert' },
                ]}
              />
            </div>
            <div className="form-checkbox-group mt-4">
              <FormCheckbox<JobFormData>
                label="No Show"
                name="isNoShow"
                register={register}
              />
              <FormCheckbox<JobFormData>
                label="CNA"
                name="isCNA"
                register={register}
              />
              <FormCheckbox<JobFormData>
                label="Witness represented by an attorney"
                name="hasAttorney"
                register={register}
              />
              <FormCheckbox<JobFormData>
                label="Attorney present at proceeding"
                name="isAttorneyPresent"
                register={register}
              />
              <FormCheckbox<JobFormData>
                label="Read and Sign required"
                name="requiresReadAndSign"
                register={register}
              />
            </div>
          </section>

          {/* Original Transcript Info Section */}
          <section className="form-section">
            <h2 className="form-section-title">Original Transcript Information</h2>
            <div className="form-row">
              <FormCheckbox<JobFormData>
                label="Rush"
                name="isRush"
                register={register}
              />
              <FormInput<JobFormData>
                label="Due Date"
                name="dueDate"
                type="date"
                required
                register={register}
                error={errors.dueDate?.message}
              />
              <FormInput<JobFormData>
                label="Total Pages"
                name="totalPages"
                type="number"
                required
                register={register}
                error={errors.totalPages?.message}
              />
            </div>
            <div className="form-section-title mt-4 mb-2">Testimony Types</div>
            <div className="form-checkbox-group grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FormCheckbox<JobFormData>
                label="Regular"
                name="testimonyTypes.regular"
                register={register}
              />
              <FormCheckbox<JobFormData>
                label="Technical"
                name="testimonyTypes.technical"
                register={register}
              />
              <FormCheckbox<JobFormData>
                label="Video"
                name="testimonyTypes.video"
                register={register}
              />
              <FormCheckbox<JobFormData>
                label="Interpreter"
                name="testimonyTypes.interpreter"
                register={register}
              />
              <FormCheckbox<JobFormData>
                label="Realtime"
                name="testimonyTypes.realtime"
                register={register}
              />
              <FormCheckbox<JobFormData>
                label="Rough Draft"
                name="testimonyTypes.roughDraft"
                register={register}
              />
              <FormCheckbox<JobFormData>
                label="Recording Transcription"
                name="testimonyTypes.recordingTranscription"
                register={register}
              />
            </div>
            <div className="mt-4">
              <FormInput<JobFormData>
                label="Transcription Listening Hours"
                name="transcriptionListeningHours"
                type="number"
                register={register}
                error={errors.transcriptionListeningHours?.message}
              />
            </div>
          </section>

          {/* Original Exhibits Info Section */}
          <section className="form-section">
            <h2 className="form-section-title">Original Exhibits Information</h2>
            <div className="form-row">
              <FormInput<JobFormData>
                label="Exhibits Marked"
                name="exhibitsMarked"
                register={register}
                error={errors.exhibitsMarked?.message}
              />
              <FormInput<JobFormData>
                label="Through"
                name="exhibitsThrough"
                register={register}
                error={errors.exhibitsThrough?.message}
              />
              <FormInput<JobFormData>
                label="Total Exhibits"
                name="totalExhibits"
                type="number"
                register={register}
                error={errors.totalExhibits?.message}
              />
            </div>
            <div className="form-row">
              <FormSelect<JobFormData>
                label="Received Via"
                name="receivedVia"
                register={register}
                error={errors.receivedVia?.message}
                options={[
                  { value: 'Paper', label: 'Paper' },
                  { value: 'Electronic', label: 'Electronic' },
                ]}
              />
              <FormInput<JobFormData>
                label="Return To"
                name="returnTo"
                register={register}
                error={errors.returnTo?.message}
              />
            </div>
            <div className="mt-4">
              <FormCheckbox<JobFormData>
                label="Attach to Transcript"
                name="attachToTranscript"
                register={register}
              />
            </div>
          </section>

          {/* Expense Reimbursement Section */}
          <section className="form-section">
            <h2 className="form-section-title">Expense Reimbursement</h2>
            <div className="form-row">
              <FormInput<JobFormData>
                label="Parking"
                name="expenses.parking"
                type="number"
                register={register}
                error={errors.expenses?.parking?.message}
              />
              <FormInput<JobFormData>
                label="Travel"
                name="expenses.travel"
                type="number"
                register={register}
                error={errors.expenses?.travel?.message}
              />
              <FormInput<JobFormData>
                label="Mileage"
                name="expenses.mileage"
                type="number"
                register={register}
                error={errors.expenses?.mileage?.message}
              />
            </div>
            <div className="form-row">
              <FormInput<JobFormData>
                label="Shipping"
                name="expenses.shipping"
                type="number"
                register={register}
                error={errors.expenses?.shipping?.message}
              />
              <FormInput<JobFormData>
                label="Other"
                name="expenses.other"
                type="number"
                register={register}
                error={errors.expenses?.other?.message}
              />
            </div>
          </section>

          {/* Exhibit Upload Section */}
          <section className="form-section">
            <ExhibitUpload
              selectedExhibits={selectedExhibits}
              setSelectedExhibits={setSelectedExhibits}
              setValue={setValue}
              errors={errors}
            />
          </section>

          {/* Special Instructions Section */}
          <section className="form-section">
            <h2 className="form-section-title">Special Instructions</h2>
            <div className="form-group">
              <textarea
                className="form-input min-h-[100px]"
                placeholder="Enter any special instructions or notes..."
                {...register('specialInstructions')}
              />
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <button
              type="submit"
              className="bg-primary text-white font-bold rounded-lg px-6 py-3 shadow flex items-center justify-center hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              aria-live="polite"
            >
              Submit
              {isSubmitting && (
                <span className="ml-2" role="status" aria-live="polite">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                </span>
              )}
            </button>
            {process.env.NODE_ENV !== 'production' && (
              <button
                type="button"
                className="px-6 py-2 rounded bg-gray-400 text-white font-semibold hover:bg-gray-500 transition-colors"
                onClick={handleTestInterface}
              >
                test-interface
              </button>
            )}
          </div>
        </form>
    </div>

      {/* Success Modal */}
      <SuccessModal open={showSuccessModal} onClose={handleCloseModal} />
    </main>
  );
}
