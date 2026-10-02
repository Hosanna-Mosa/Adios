import React from "react";
import { router } from "expo-router";
import { SectionFieldRows } from "../SectionFieldRows";
import { BankSection } from "./BankSection";
import { DocumentsSection } from "./DocumentsSection";
import { PersonalSection } from "./PersonalSection";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { SupportSection } from "./SupportSection";
import { VehicleSection } from "./VehicleSection";

/** Picks the right body for whichever profile section is open. */
export function SectionContent(props: any) {
  const {
    selectedSection, profile, GENDERS,
    isEditing, isSaving, editName, setEditName, editUsername, setEditUsername,
    editEmail, setEditEmail, editPhone, setEditPhone, editGender, handleGenderSelect,
    handleStartEditing, setIsEditing, handleSaveProfile, handleCloseModal,
    showBankForm, setShowBankForm, newBankAccount, setNewBankAccount,
    newBankIfsc, setNewBankIfsc, isSavingBank, handleAddBankAccount,
    showPasswordForm, setShowPasswordForm, currentPassword, setCurrentPassword,
    newPassword, setNewPassword, confirmPassword, setConfirmPassword,
    isSavingPassword, handleChangePassword,
  } = props;

    if (!selectedSection) return null;
    const fields = selectedSection.fields;

    switch (selectedSection.key) {
      case "personal":
        return (
          <PersonalSection
            fields={fields}
            isEditing={isEditing}
            values={{
              name: editName,
              username: editUsername,
              email: editEmail,
              phone: editPhone,
            }}
            onChange={(field, value) => {
              if (field === "name") setEditName(value);
              else if (field === "username") setEditUsername(value);
              else if (field === "email") setEditEmail(value);
              else setEditPhone(value);
            }}
            genders={GENDERS}
            selectedGender={editGender}
            onSelectGender={handleGenderSelect}
            isSaving={isSaving}
            onStartEditing={handleStartEditing}
            onCancel={() => setIsEditing(false)}
            onSave={handleSaveProfile}
            passwordForm={
              <ChangePasswordForm
                showPasswordForm={showPasswordForm}
                currentPassword={currentPassword}
                onCurrentPasswordChange={setCurrentPassword}
                newPassword={newPassword}
                onNewPasswordChange={setNewPassword}
                confirmPassword={confirmPassword}
                onConfirmPasswordChange={setConfirmPassword}
                isSaving={isSavingPassword}
                onOpenForm={() => setShowPasswordForm(true)}
                onCancel={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                onSubmit={handleChangePassword}
              />
            }
          />
        );

      case "documents":
        return (
          <DocumentsSection
            fields={fields}
            hasPan={Boolean(profile?.driver?.panNumber)}
            hasLicense={Boolean(profile?.driver?.dlNumber)}
            onAddPan={() => {
              handleCloseModal();
              router.push("/identity-verify");
            }}
            onAddLicense={() => {
              handleCloseModal();
              router.push("/onboarding");
            }}
          />
        );

      case "vehicle":
        return <VehicleSection fields={fields} />;

      case "bank":
        return (
          <BankSection
            fields={fields}
            accounts={profile?.driver?.bankAccounts || []}
            showForm={showBankForm}
            accountNumber={newBankAccount}
            onAccountNumberChange={(t) => setNewBankAccount(t.replace(/[^0-9]/g, "").slice(0, 18))}
            ifsc={newBankIfsc}
            onIfscChange={(t) => setNewBankIfsc(t.toUpperCase().slice(0, 11))}
            isSaving={isSavingBank}
            onOpenForm={() => setShowBankForm(true)}
            onCancel={() => {
              setShowBankForm(false);
              setNewBankAccount("");
              setNewBankIfsc("");
            }}
            onSubmit={handleAddBankAccount}
          />
        );

      case "support":
        return <SupportSection fields={fields} />;

      default:
        return <SectionFieldRows fields={fields} />;
    }
}
