'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { JobFormData, jobFormSchema } from '@/lib/schema';
import { FormInput, FormCheckbox, FormSelect } from '@/components/FormInput';
import { useEffect, useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { Open_Sans } from 'next/font/google';
import { supabase } from '@/lib/supabaseClient';

// Initialize Open Sans font
const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['700'], // Assuming the title is bold, adjust if needed
});

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [selectedExhibits, setSelectedExhibits] = useState<File[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');
      
      const combinedFiles = [...selectedExhibits, ...pdfFiles];
      const limitedFiles = combinedFiles.slice(0, 50);

      setSelectedExhibits(limitedFiles);
      setValue('exhibitFiles', limitedFiles, { shouldValidate: true });
      
      event.target.value = ''; 
    }
  };

  const handleRemoveFile = (fileName: string) => {
    const updatedFiles = selectedExhibits.filter(file => file.name !== fileName);
    setSelectedExhibits(updatedFiles);
    setValue('exhibitFiles', updatedFiles, { shouldValidate: true });
  };

  console.log('Form errors:', errors);

  const onSubmit = async (data: JobFormData) => {
    console.log('Submitting form', data);
    // Prepare data for Supabase
    const {
      testimonyTypes,
      expenses,
      exhibitFiles,
      ...rest
    } = data;

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
      exhibit_file_names: Array.isArray(exhibitFiles) ? exhibitFiles.map(f => (f as File).name) : [],
      exhibit_file_urls: Array.isArray(exhibitFiles) ? exhibitFiles.map(f => '') : [], // Placeholder for now
      // Other Instructions
      special_instructions: rest.specialInstructions,
    };

    const { error } = await supabase.from('job_sheet').insert([mappedData]);
    if (error) {
      alert('Error submitting job sheet: ' + error.message);
    } else {
      alert('Job sheet submitted successfully!');
    }
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <main className="min-h-screen bg-[#f0f0f0] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-center mb-8">
          <Image
            src="/BRAZIL_Logo.webp"
            alt="Brazil Co Litigation Services Logo"
            width={300}
            height={75}
            priority
          />
        </div>
        <h1 className={`text-2xl font-bold text-gray-800 mb-6 text-center ${openSans.className}`}>COURT REPORTER JOB SHEET</h1>
        
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
            <h2 className="form-section-title">Exhibit Upload</h2>
            <div className="form-group">
              <label htmlFor="exhibitFilesInput" className="form-label">
                Upload Exhibits (PDF only, up to 50 files)
              </label>
              <input
                type="file"
                id="exhibitFilesInput"
                multiple
                accept=".pdf"
                className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-[#A30F27] mb-2"
                onChange={handleFileChange}
              />
              {selectedExhibits.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected files:</p>
                  <ul className="list-disc list-inside pl-2 space-y-1">
                    {selectedExhibits.map(file => (
                      <li key={file.name} className="text-sm text-gray-600 flex justify-between items-center">
                        <span>{file.name} ({Math.round(file.size / 1024)} KB)</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.name)}
                          className="ml-2 text-xs text-red-500 hover:text-red-700 font-semibold"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {errors.exhibitFiles && (
                <p className="form-error">{errors.exhibitFiles.message?.toString() || 'Invalid file(s)'}</p>
              )}
            </div>
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
          <div className="flex justify-end space-x-4">
            <button type="submit" className="primary-button">
              Submit
            </button>
          </div>
        </form>
    </div>
    </main>
  );
}
