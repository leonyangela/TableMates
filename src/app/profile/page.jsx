"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ProfileField from "@/components/profile/profile-field.component";
import Button from "@/components/button/button.component";
import WrapperComponent from "@/components/wrapper/wrapper.component";
import ReauthModal from "@/components/profile/reauth-modal.component";
import Header from "@/components/header/header.component";

import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUpdateEmail } from "@/hooks/useUpdateEmail";
import AdminTools from "@/components/admin/admin-tools.component";
import Avatar from "@/components/profile/avatar.component";
import ProfileStats from "@/components/profile/profile-stats.component";
import EmailVerificationNotice from "@/components/profile/email-verification-notice.component";
import { useDiningRecord } from "@/hooks/useDiningRecord";
import {
  DIETARY_OPTIONS,
  PROFILE_LIMITS,
} from "@/lib/constants/social.constants";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  photoURL: "",
  bio: "",
  interests: "",
  dietary: [],
};

function toForm(profile) {
  return {
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    photoURL: profile?.photoURL || "",
    bio: profile?.bio || "",
    // Edited as one comma-separated line, stored as a list.
    interests: (profile?.interests ?? []).join(", "),
    dietary: profile?.dietary ?? [],
  };
}

function parseInterests(text) {
  return [
    ...new Set(
      String(text ?? "")
        .split(",")
        .map((interest) => interest.trim())
        .filter(Boolean),
    ),
  ];
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    profile,
    isLoading,
    fetchError,
    fetchProfile,
    isSaving,
    saveError,
    updateProfile,
  } = useUserProfile();
  const {
    isUpdating: isUpdatingEmail,
    error: emailError,
    needsReauth,
    attemptChange,
    confirmReauthAndRetry,
    cancelReauth,
  } = useUpdateEmail();

  const {
    record,
    loading: recordLoading,
    error: recordError,
  } = useDiningRecord(user?.uid ?? null);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/profile");
    }
  }, [authLoading, user, router]);

  const startEditing = () => {
    setForm(toForm(profile));
    setIsEditing(true);
  };

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Saves the non-email fields to Firestore. Split out so it can be called
  // either immediately (email unchanged) or after a successful email change.
  const saveProfileFields = async ({ email }) => {
    const success = await updateProfile({
      ...form,
      interests: parseInterests(form.interests),
      email,
    });
    if (success) setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const emailChanged = form?.email !== user?.email;

    if (!emailChanged) {
      await saveProfileFields({ email: user?.email });
      return;
    }

    const success = await attemptChange(form.email);
    // If `needsReauth` got set instead, the modal below takes over —
    // we don't save Firestore yet since the email hasn't actually changed.
    if (success) {
      await saveProfileFields({ email: form.email });
    }
  };

  const handleReauthConfirm = async (password) => {
    const success = await confirmReauthAndRetry(password);
    if (success) {
      await saveProfileFields({ email: form.email });
    }
  };

  const handleCancel = () => setIsEditing(false);

  if (authLoading) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">
          You need to be logged in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <WrapperComponent paddingX="lg" className="pt-12">
      <Header
        eyebrow="your profile"
        title="Your account"
        description="View and update your details."
      />
      <AdminTools />

      <div className="mt-8 max-w-3xl">
        {isLoading && !profile ? (
          <div className="py-16 text-center">
            <p className="text-gray-500">Loading your profile...</p>
          </div>
        ) : fetchError ? (
          <div className="py-16 text-center border border-gray-200 rounded-2xl">
            <h2 className="font-semibold text-lg">Something went wrong</h2>
            <p className="text-gray-500 mt-1">{fetchError}</p>
            <Button
              onClick={fetchProfile}
              variant="try-again"
            >
              Try again
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                {/* Plain <img> (Avatar): photo URLs can be any host, which
                    next/image would reject. */}
                <Avatar
                  name={profile?.name || profile?.email}
                  photoURL={profile?.photoURL}
                  size="lg"
                />
                <div>
                  <h2 className="text-xl font-semibold">
                    {profile?.name || "Add your name"}
                  </h2>
                  <p className="text-sm text-gray-500">{profile?.email}</p>
                  <EmailVerificationNotice />
                </div>
              </div>

              {!isEditing && (
                <Button variant="tertiary" onClick={startEditing}>
                  Edit profile
                </Button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={handleChange("name")}
                      placeholder="Jane Doe"
                      className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="jane@example.com"
                      className="w-full border rounded-lg px-3 py-2 text-sm outline-none bg-gray-200 text-gray-500"
                      disabled
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Please contact support if you want to updates your email.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={handleChange("phone")}
                      placeholder="+1 234 567 8900"
                      className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    value={form.photoURL}
                    onChange={handleChange("photoURL")}
                    placeholder="https://..."
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Paste a link to an image — direct photo upload isn&apos;t
                    set up yet.
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    About you (optional)
                  </label>
                  <textarea
                    rows={3}
                    maxLength={PROFILE_LIMITS.bio}
                    value={form.bio}
                    onChange={handleChange("bio")}
                    placeholder="Tell fellow diners a bit about yourself..."
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none resize-none"
                  />
                  <p className="text-right text-xs text-gray-400">
                    {form.bio.length}/{PROFILE_LIMITS.bio}
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Interests (optional)
                  </label>
                  <input
                    type="text"
                    value={form.interests}
                    onChange={handleChange("interests")}
                    placeholder="e.g. Ramen, Wine, Board games, Hiking"
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Separate with commas — up to {PROFILE_LIMITS.interests}.
                  </p>
                </div>

                <fieldset>
                  <legend className="block text-xs text-gray-500 mb-1.5">
                    Dietary preferences (optional)
                  </legend>
                  <div className="flex flex-wrap gap-1.5">
                    {DIETARY_OPTIONS.map((option) => {
                      const isActive = form.dietary.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              dietary: isActive
                                ? prev.dietary.filter((item) => item !== option)
                                : [...prev.dietary, option],
                            }))
                          }
                          className={`rounded-full border px-3 py-1 text-xs transition ${
                            isActive
                              ? "border-black bg-black text-white"
                              : "border-gray-300 text-gray-600 hover:border-gray-400"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <p className="text-xs text-gray-400">
                  Your name, photo, about, interests and dietary preferences
                  are shown to diners you share a table with. Your phone and
                  email are never shown.
                </p>

                {(saveError || emailError) && (
                  <p className="text-sm text-red-600">
                    {saveError || emailError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUpdatingEmail}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                  >
                    {isSaving || isUpdatingEmail ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <ProfileField label="Full name" value={profile?.name} />
                <ProfileField label="Phone" value={profile?.phone} />
                <ProfileField label="Email" value={profile?.email} />
                <ProfileField label="About you" value={profile?.bio} />
                <ProfileField
                  label="Interests"
                  value={(profile?.interests ?? []).join(", ")}
                />
                <ProfileField
                  label="Dietary preferences"
                  value={(profile?.dietary ?? []).join(", ")}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <section className="mt-6 mb-12 max-w-3xl rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Your dining record</h2>
        <p className="mt-1 text-sm text-gray-500">
          This is what other diners see on your profile — except your join
          requests, which only you can see.
        </p>

        <div className="mt-5">
          {recordLoading ? (
            <p className="text-sm text-gray-500">Loading your record...</p>
          ) : recordError ? (
            <p className="text-sm text-red-600">{recordError}</p>
          ) : record ? (
            <ProfileStats
              profile={record.profile}
              stats={record.stats}
              requestStats={record.requestStats}
            />
          ) : null}
        </div>
      </section>

      <ReauthModal
        isOpen={needsReauth}
        isSubmitting={isUpdatingEmail}
        error={emailError}
        onConfirm={handleReauthConfirm}
        onCancel={cancelReauth}
      />
    </WrapperComponent>
  );
}
