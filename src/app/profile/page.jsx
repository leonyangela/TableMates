"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import ProfileField from "@/components/profile/profile-field.component";
import Button from "@/components/button/button.component";
import WrapperComponent from "@/components/wrapper/wrapper.component";
import ReauthModal from "@/components/profile/reauth-modal.component";
import Header from "@/components/header/header.component";

import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUpdateEmail } from "@/hooks/useUpdateEmail";

const EMPTY_FORM = { name: "", email: "", phone: "", photoURL: "", bio: "" };

function toForm(profile) {
  return {
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    photoURL: profile?.photoURL || "",
    bio: profile?.bio || "",
  };
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

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
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
    const success = await updateProfile({ ...form, email });
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

      <div className="mt-8 max-w-3xl">
        {isLoading && !profile ? (
          <div className="py-16 text-center">
            <p className="text-gray-500">Loading your profile...</p>
          </div>
        ) : fetchError ? (
          <div className="py-16 text-center border border-gray-200 rounded-2xl">
            <h2 className="font-semibold text-lg">Something went wrong</h2>
            <p className="text-gray-500 mt-1">{fetchError}</p>
            <button
              onClick={fetchProfile}
              className="mt-5 px-5 py-2.5 rounded-lg bg-black text-white text-sm font-medium"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden shrink-0">
                  {profile?.photoURL ? (
                    <Image
                      src={profile.photoURL}
                      alt={profile.name || "Profile"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-semibold">
                      {(profile?.name || profile?.email || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {profile?.name || "Add your name"}
                  </h2>
                  <p className="text-sm text-gray-500">{profile?.email}</p>
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
                    value={form.bio}
                    onChange={handleChange("bio")}
                    placeholder="Tell fellow diners a bit about yourself..."
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none resize-none"
                  />
                </div>

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
              </div>
            )}
          </div>
        )}
      </div>

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
