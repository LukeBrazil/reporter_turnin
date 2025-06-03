'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { JobFormData, jobFormSchema } from '@/lib/schema';
import { FormInput, FormCheckbox, FormSelect } from '@/components/FormInput';
import { useEffect, useState, ChangeEvent, useMemo } from 'react';
import Image from 'next/image';
import { Open_Sans } from 'next/font/google';
import { supabase } from '@/lib/supabaseClient';
import { useDropzone } from 'react-dropzone';

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

  const onDrop = (acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    const combinedFiles = [...selectedExhibits, ...pdfFiles];
    const limitedFiles = combinedFiles.slice(0, 50);
    setSelectedExhibits(limitedFiles);
    setValue('exhibitFiles', limitedFiles, { shouldValidate: true });
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    maxFiles: 50,
  });

  // Helper to generate previews for accepted files
  const filePreviews = useMemo(() => selectedExhibits.slice(0, 10).map(file => {
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    let previewUrl = '';
    if (isImage) {
      previewUrl = URL.createObjectURL(file);
    }
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl,
      isImage,
      isPDF,
    };
  }), [selectedExhibits]);

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
              <div className="flex items-center justify-center w-full">
                <div {...getRootProps()} className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-[#f0f0f0] dark:bg-[#f0f0f0] hover:bg-gray-100 dark:hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 transition-colors">
                  <input {...getInputProps()} id="dropzone-file" className="hidden" />
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF only (up to 50 files)</p>
                  </div>
                </div>
              </div>
              {/* Accepted Files Preview */}
              {selectedExhibits.length > 0 && (
                <div className="mt-6 border rounded-lg p-4 bg-white">
                  <h3 className="text-lg font-semibold mb-2">Accepted Files</h3>
                  <hr className="mb-4" />
                  <div className="flex flex-wrap gap-6">
                    {filePreviews.map((file, idx) => (
                      <div key={file.name} className="relative flex flex-col items-center w-32">
                        <div className="w-28 h-28 flex items-center justify-center bg-gray-100 border rounded-lg overflow-hidden">
                          {file.isImage ? (
                            <img src={file.previewUrl} alt={file.name} className="object-contain w-full h-full" />
                          ) : file.isPDF ? (
                            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.name)}
                          className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <span className="mt-2 text-xs text-gray-700 text-center break-all w-full">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {errors.exhibitFiles && (
                <p className="form-error">{errors.exhibitFiles.message?.toString() || 'Invalid file(s)'} </p>
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
