import React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ThemeTokens } from "@/constants/colors";
import type { BulkStyles } from "../bulk.styles";
import { MAX_ROWS, TEMPLATE_HEADERS, type RowError } from "../parseRows";

interface StepProps {
  number: number;
  title: string;
  body: string;
  children?: React.ReactNode;
  styles: BulkStyles;
}

function Step({ number, title, body, children, styles }: StepProps) {
  return (
    <Card bordered elevationLevel="none" style={styles.card}>
      <View style={styles.stepHead}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{number}</Text>
        </View>
        <Text style={styles.stepTitle}>{title}</Text>
      </View>
      <Text style={styles.body}>{body}</Text>
      {children}
    </Card>
  );
}

interface Props {
  sharing: boolean;
  onDownload: () => void;
  reading: boolean;
  onChoose: () => void;
  fileName: string | null;
  sheetError: RowError | null;
  styles: BulkStyles;
  tokens: ThemeTokens;
}

/** Step 1: download the template. Step 2: pick the filled-in sheet. */
export function BulkSteps({ sharing, onDownload, reading, onChoose, fileName, sheetError, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <Step number={1} title={t("bulkUpload.step1Title")} body={t("bulkUpload.step1Body")} styles={styles}>
        <Text style={styles.columns}>{TEMPLATE_HEADERS.join("  ·  ")}</Text>
        <Button
          title={t("bulkUpload.downloadTemplate")}
          variant="secondary"
          onPress={onDownload}
          loading={sharing}
          icon={<Ionicons name="download-outline" size={18} color={tokens.text} />}
          fullWidth
        />
      </Step>
      <Step number={2} title={t("bulkUpload.step2Title")} body={t("bulkUpload.step2Body", { max: MAX_ROWS })} styles={styles}>
        {fileName && sheetError ? <Text style={styles.fileName}>{t("bulkUpload.selectedFile", { name: fileName })}</Text> : null}
        {sheetError ? <Text style={styles.error}>{t(sheetError.key, sheetError.params)}</Text> : null}
        <Button
          title={fileName ? t("bulkUpload.chooseAnother") : t("bulkUpload.chooseFile")}
          variant="secondary"
          onPress={onChoose}
          loading={reading}
          icon={<Ionicons name="document-attach-outline" size={18} color={tokens.text} />}
          fullWidth
        />
      </Step>
    </>
  );
}
