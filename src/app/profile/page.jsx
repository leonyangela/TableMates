"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ProfileField from "@/components/profile/profile-field.component";
import Button from "@/components/button/button.component";
import WrapperComponent from "@/components/wrapper/wrapper.component";
import MetaLabel from "@/components/ui/meta-label.component";
import Section from "@/components/ui/section.component";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states.component";
import { DISPLAY, FIELD } from "@/components/ui/styles";
import ReauthModal from "@/components/profile/reauth-modal.component";

import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUpdateEmail } from "@/hooks/useUpdateEmail";
import AdminTools from "@/components/admin/admin-tools.component";
import Avatar from "@/components/profile/avatar.component";
import ProfileStats from "@/components/profile/profile-stats.component";
import EmailVerificationNotice from "@/components/profile/email-verification-notice.component";
import { useDiningRecord } from "@/hooks/useDiningRecord";
import { parseInterests } from "@/lib/utils/validators.utils";
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
      <WrapperComponent>
        <p className="px-5 py-24 font-meta text-[11px] uppercase tracking-[0.14em] text-paper/55 md:px-10">
          Loading…
        </p>
      </WrapperComponent>
    );
  }

  if (!user) {
    return (
      <WrapperComponent>
        <div className="px-5 py-24 md:px-10">
          <EmptyState
            label="Members only"
            title="Log in to view your profile."
            action={<Button arrow href="/login?redirect=/profile">Log in</Button>}
          />
        </div>
      </WrapperComponent>
    );
  }

  const displayName = profile?.name || "Add your name";

  return (
    <WrapperComponent>
      {/* Opening: the portrait cropped tall, the name at poster scale. */}
      <header className="grid gap-10 px-5 pb-16 pt-10 md:grid-cols-12 md:px-10 md:pt-16">
        <div className="md:col-span-3">
          <MetaLabel>Your account</MetaLabel>
          {/* Plain <img> (Avatar): photo URLs can be any host, which
              next/image would reject. */}
          <Avatar
            name={profile?.name || profile?.email}
            photoURL={profile?.photoURL}
            size="portrait"
            className="mt-8"
          />
        </div>

        <div className="md:col-span-9 md:self-end">
          <h1 className={`${DISPLAY.page} break-words`}>
            {displayName}
            <span className="text-coffee-bean-400">.</span>
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <MetaLabel>{profile?.email}</MetaLabel>
            <EmailVerificationNotice />
            {!isEditing && profile && (
              <Button variant="ghost" onClick={startEditing}>
                Edit profile
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-20 px-5 pb-20 md:px-10">
        <AdminTools />

        <Section
          label="Details"
          note="Your name, photo, about, interests and dietary preferences are shown to diners you share a table with. Your phone and email never are."
        >
          {isLoading && !profile ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ) : fetchError ? (
            <ErrorState title="Couldn't load your profile." text={fetchError} onRetry={fetchProfile} />
          ) : isEditing ? (
            <form onSubmit={handleSave} className="grid gap-x-10 gap-y-10 md:grid-cols-2">
              <div>
                <label htmlFor="profile-name" className={FIELD.label}>Full name</label>
                <input
                  id="profile-name"
                  type="text"
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="Your name"
                  className={FIELD.input}
                />
              </div>
              <div>
                <label htmlFor="profile-email" className={FIELD.label}>Email</label>
                <input
                  id="profile-email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  className={`${FIELD.input} text-paper/50`}
                  disabled
                />
                <p className={FIELD.hint}>
                  Contact support if you want to update your email.
                </p>
              </div>
              <div>
                <label htmlFor="profile-phone" className={FIELD.label}>Phone</label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="+61 400 000 000"
                  className={FIELD.input}
                />
              </div>
              <div>
                <label htmlFor="profile-photo" className={FIELD.label}>Photo URL</label>
                <input
                  id="profile-photo"
                  type="url"
                  value={form.photoURL}
                  onChange={handleChange("photoURL")}
                  placeholder="https://..."
                  className={FIELD.input}
                />
                <p className={FIELD.hint}>
                  Paste a link to an image. Direct photo upload isn&apos;t set up yet.
                </p>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="profile-bio" className={FIELD.label}>About you (optional)</label>
                <textarea
                  id="profile-bio"
                  rows={3}
                  maxLength={PROFILE_LIMITS.bio}
                  value={form.bio}
                  onChange={handleChange("bio")}
                  placeholder="Tell fellow diners a bit about yourself"
                  className={`${FIELD.input} h-auto resize-none py-3`}
                />
                <p className={`${FIELD.hint} text-right`}>
                  {form.bio.length}/{PROFILE_LIMITS.bio}
                </p>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="profile-interests" className={FIELD.label}>Interests (optional)</label>
                <input
                  id="profile-interests"
                  type="text"
                  value={form.interests}
                  onChange={handleChange("interests")}
                  placeholder="Ramen, wine, board games, hiking"
                  className={FIELD.input}
                />
                <p className={FIELD.hint}>
                  Separate with commas, up to {PROFILE_LIMITS.interests}.
                </p>
              </div>

              <fieldset className="md:col-span-2">
                <legend className={FIELD.label}>Dietary preferences (optional)</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((option) => {
                    const isActive = form.dietary.includes(option);
                    return (
                      <Button
                        key={option}
                        variant="chip"
                        active={isActive}
                        aria-pressed={isActive}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            dietary: isActive
                              ? prev.dietary.filter((item) => item !== option)
                              : [...prev.dietary, option],
                          }))
                        }
                      >
                        {option}
                      </Button>
                    );
                  })}
                </div>
              </fieldset>

              {(saveError || emailError) && (
                <p role="alert" className="border-l-2 border-coffee-bean-400 pl-4 text-sm text-coffee-bean-200 md:col-span-2">
                  {saveError || emailError}
                </p>
              )}

              <div className="flex gap-3 md:col-span-2">
                <Button type="submit" disabled={isSaving || isUpdatingEmail}>
                  {isSaving || isUpdatingEmail ? "Saving…" : "Save changes"}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <dl className="grid gap-x-10 md:grid-cols-2">
              <ProfileField label="Full name" value={profile?.name} />
              <ProfileField label="Phone" value={profile?.phone} />
              <ProfileField label="Email" value={profile?.email} />
              <ProfileField label="Interests" value={(profile?.interests ?? []).join(", ")} />
              <ProfileField label="Dietary preferences" value={(profile?.dietary ?? []).join(", ")} />
              <ProfileField label="About you" value={profile?.bio} wide />
            </dl>
          )}
        </Section>

        <Section
          label="Your dining record"
          note="What other diners see on your profile, except your join requests, which only you can see."
        >
          {recordLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : recordError ? (
            <ErrorState title="Couldn't load your record." text={recordError} />
          ) : record ? (
            <ProfileStats
              profile={record.profile}
              stats={record.stats}
              requestStats={record.requestStats}
            />
          ) : null}
        </Section>
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
