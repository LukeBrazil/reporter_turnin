'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { JobFormData, jobFormSchema } from '@/lib/schema';
import { FormInput, FormCheckbox, FormSelect } from '@/components/FormInput';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Open_Sans } from 'next/font/google';

// Initialize Open Sans font
const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['700'], // Assuming the title is bold, adjust if needed
});

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
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
    },
  });

  const onSubmit = (data: JobFormData) => {
    console.log(data);
    // Handle form submission
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
        <h1 className={`text-2xl font-bold text-gray-800 mb-6 text-center ${openSans.className}`}>Court Reporter Job Sheet</h1>
        
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
                required
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
            <button type="button" className="secondary-button">
              Save Draft
            </button>
            <button type="submit" className="primary-button">
              Submit
            </button>
          </div>
        </form>
    </div>
    </main>
  );
}
