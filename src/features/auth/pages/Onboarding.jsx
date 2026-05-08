import { FaNairaSign } from "react-icons/fa6";
;
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiLoader,
  FiPhone,
  FiCreditCard,
  FiUpload,
  FiUser } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import api from "../../../lib/api";
import { NIGERIAN_BANKS } from "../../../shared/constants/banks";

const Onboarding = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const navigate = useNavigate();

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) fieldsToValidate = ["phone", "dob", "gender"];
    if (step === 2) fieldsToValidate = ["address", "state", "lga"];
    if (step === 3)
      fieldsToValidate = [
        "occupation",
        "employer",
        "nokName",
        "nokPhone",
        "nokRelationship",
      ];
    if (step === 4) fieldsToValidate = ["idType", "idNumber", "idImage"];
    if (step === 5)
      fieldsToValidate = ["bankName", "bankCode", "accountNumber"];

    const isValidStep = await trigger(fieldsToValidate);
    if (isValidStep) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append all text fields
      Object.keys(data).forEach((key) => {
        if (key !== "idImage") {
          formData.append(key, data[key]);
        }
      });

      // Append files if they exist
      if (data.idImage && data.idImage[0]) {
        formData.append("idImage", data.idImage[0]);
      }
      if (data.profilePicture && data.profilePicture[0]) {
        formData.append("profilePicture", data.profilePicture[0]);
      }

      await api.patch("/auth/submit-onboarding", formData);

      toast.success("Membership details submitted successfully!");
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit onboarding details.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We need a few more details to process your membership application.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 relative px-4">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded"></div>
          <div
            className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 rounded transition-all duration-300"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          ></div>

          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-4 ${
                step >= s
                  ? "bg-blue-600 text-white border-blue-100"
                  : "bg-white text-gray-400 border-gray-100"
              }`}
            >
              {step > s ? <FiCheck /> : s}
            </div>
          ))}
        </div>

        <form
          className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
              <h3 className="font-bold text-xl text-gray-800 border-b pb-2 mb-4 flex items-center">
                <FiUsers className="mr-2 text-blue-600" /> Personal Details
              </h3>

              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-300 border-2 border-dashed border-blue-200 overflow-hidden">
                    {watch("profilePicture") && watch("profilePicture")[0] ? (
                      <img
                        src={URL.createObjectURL(watch("profilePicture")[0])}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser size={40} />
                    )}
                  </div>
                  <label
                    htmlFor="profile-upload"
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-all shadow-md"
                  >
                    <FiUpload size={14} />
                    <input
                      id="profile-upload"
                      type="file"
                      className="sr-only"
                      {...register("profilePicture")}
                      accept="image/*"
                    />
                  </label>
                </div>
                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                  Profile Picture
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    {...register("phone", {
                      required: "Phone number is required",
                    })}
                    type="tel"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-blue-500 outline-none ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                    placeholder="+234..."
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="date"
                      {...register("dob", {
                        required: "Date of birth is required",
                      })}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-blue-500 outline-none ${errors.dob ? "border-red-500" : "border-gray-300"}`}
                    />
                  </div>
                  {errors.dob && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.dob.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    {...register("gender", { required: "Gender is required" })}
                    className={`block w-full px-3 py-3 border rounded-lg focus:ring-blue-500 outline-none bg-white ${errors.gender ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
              <h3 className="font-bold text-xl text-gray-800 border-b pb-2 mb-4 flex items-center">
                <FiMapPin className="mr-2 text-blue-600" /> Residential Address
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address
                </label>
                <textarea
                  {...register("address", { required: "Address is required" })}
                  rows="3"
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-blue-500 outline-none resize-none ${errors.address ? "border-red-500" : "border-gray-300"}`}
                  placeholder="House Number, Street Name, City..."
                ></textarea>
                {errors.address && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    {...register("state", { required: "State is required" })}
                    className={`block w-full px-4 py-3 border rounded-lg focus:ring-blue-500 outline-none ${errors.state ? "border-red-500" : "border-gray-300"}`}
                    placeholder="State"
                  />
                  {errors.state && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.state.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LGA
                  </label>
                  <input
                    {...register("lga", { required: "LGA is required" })}
                    className={`block w-full px-4 py-3 border rounded-lg focus:ring-blue-500 outline-none ${errors.lga ? "border-red-500" : "border-gray-300"}`}
                    placeholder="LGA"
                  />
                  {errors.lga && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.lga.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Employment & NOK */}
          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
              <h3 className="font-bold text-xl text-gray-800 border-b pb-2 mb-4 flex items-center">
                <FiBriefcase className="mr-2 text-blue-600" /> Work & Next of
                Kin
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation
                  </label>
                  <input
                    {...register("occupation", {
                      required: "Occupation is required",
                    })}
                    className={`block w-full px-4 py-3 border rounded-lg focus:ring-blue-500 outline-none ${errors.occupation ? "border-red-500" : "border-gray-300"}`}
                    placeholder="e.g. Software Engineer"
                  />
                  {errors.occupation && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.occupation.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employer
                  </label>
                  <input
                    {...register("employer", {
                      required: "Employer is required",
                    })}
                    className={`block w-full px-4 py-3 border rounded-lg focus:ring-blue-500 outline-none ${errors.employer ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Company Name"
                  />
                  {errors.employer && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.employer.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-gray-600 mb-3">
                  Next of Kin Details
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      {...register("nokName", {
                        required: "Next of kin name is required",
                      })}
                      className={`block w-full px-4 py-3 border rounded-lg ${errors.nokName ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Full Name"
                    />
                    {errors.nokName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.nokName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      {...register("nokPhone", {
                        required: "Next of kin phone is required",
                      })}
                      className={`block w-full px-4 py-3 border rounded-lg ${errors.nokPhone ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Phone Number"
                    />
                    {errors.nokPhone && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.nokPhone.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    {...register("nokRelationship", {
                      required: "Relationship is required",
                    })}
                    className={`block w-full px-4 py-3 border rounded-lg focus:ring-blue-500 outline-none ${errors.nokRelationship ? "border-red-500" : "border-gray-300"}`}
                    placeholder="e.g. Spouse, Brother, Sister..."
                  />
                  {errors.nokRelationship && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.nokRelationship.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Identification */}
          {step === 4 && (
            <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
              <h3 className="font-bold text-xl text-gray-800 border-b pb-2 mb-4 flex items-center">
                <FiCreditCard className="mr-2 text-blue-600" /> Identification
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Type
                  </label>
                  <select
                    {...register("idType", {
                      required: "Identification type is required",
                    })}
                    className={`block w-full px-3 py-3 border rounded-lg focus:ring-blue-500 outline-none bg-white ${errors.idType ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Select ID Type</option>
                    <option value="NIN">
                      National Identification Number (NIN)
                    </option>
                    <option value="VotersCard">Voter's Card</option>
                    <option value="DriversLicense">Driver's License</option>
                    <option value="InternationalPassport">
                      International Passport
                    </option>
                  </select>
                  {errors.idType && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.idType.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number
                  </label>
                  <input
                    {...register("idNumber", {
                      required: "ID number is required",
                    })}
                    className={`block w-full px-4 py-3 border rounded-lg focus:ring-blue-500 outline-none ${errors.idNumber ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Enter ID number"
                  />
                  {errors.idNumber && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.idNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Document Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="id-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="id-upload"
                          type="file"
                          className="sr-only"
                          {...register("idImage", {
                            required: "Identification document is required",
                          })}
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    {errors.idImage && (
                      <p className="mt-1 text-xs text-red-500 font-semibold">
                        {errors.idImage.message}
                      </p>
                    )}
                    {watch("idImage") && watch("idImage")[0] && (
                      <p className="text-sm text-green-600 font-semibold mt-2">
                        Selected: {watch("idImage")[0].name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Bank Details */}
          {step === 5 && (
            <div className="space-y-4 animate-in slide-in-from-right fade-in duration-300">
              <h3 className="font-bold text-xl text-gray-800 border-b pb-2 mb-4 flex items-center">
                <FaNairaSign className="mr-2 text-blue-600" /> Bank Details
                (for Payouts)
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Your Bank
                </label>
                <select
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-blue-500 outline-none bg-white ${errors.bankName ? "border-red-500" : "border-gray-300"}`}
                  onChange={(e) => {
                    const bank = NIGERIAN_BANKS.find(b => b.code === e.target.value);
                    if (bank) {
                      setValue("bankName", bank.name);
                      setValue("bankCode", bank.code);
                    }
                  }}
                  defaultValue={watch("bankCode")}
                >
                  <option value="">Choose a bank...</option>
                  {NIGERIAN_BANKS.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
                {/* Hidden inputs to keep react-hook-form in sync */}
                <input type="hidden" {...register("bankName", { required: "Bank is required" })} />
                <input type="hidden" {...register("bankCode", { required: "Bank code is required" })} />
                
                {errors.bankName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.bankName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  {...register("accountNumber", {
                    required: "Account number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Must be 10 digits",
                    },
                  })}
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-blue-500 outline-none ${errors.accountNumber ? "border-red-500" : "border-gray-300"}`}
                  placeholder="10-digit number"
                />
                {errors.accountNumber && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.accountNumber.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                <FiArrowLeft className="mr-2" /> Previous
              </button>
            ) : (
              <div></div>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-200"
              >
                Next Step <FiArrowRight className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold transition-all shadow-lg shadow-green-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  <>
                    Submit Application <FiCheck className="ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
