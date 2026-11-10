import { Component, ErrorInfo, lazy, ReactNode, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "./routes/__root";
import { RouteLoadingFallback } from "@/components/motion/RouteLoadingFallback";
import { AppDialogHost } from "@/components/shared/AppDialogHost";

const Home = lazy(() => import("./routes/index"));
const LegalPage = lazy(() => import("./routes/legal"));
const PartnerOnboarding = lazy(() => import("./routes/partner-onboarding"));
const PartnerResubmit = lazy(() => import("./routes/partner-resubmit"));
const RestaurantMenuFront = lazy(() => import("./routes/restaurant-menu"));

function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {t("notFound.title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("notFound.description")}
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("notFound.goHome")}
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  console.error(error);
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t("errorFallback.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("errorFallback.description")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => resetError()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("errorFallback.tryAgain")}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("notFound.goHome")}
          </a>
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppDialogHost />
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="legal/:type" element={<LegalPage />} />
          </Route>
          {/* The partner pitch now lives on the home page; keep old links working. */}
          <Route path="partner" element={<Navigate to="/#partner" replace />} />
          {/* Short links to the legal pages */}
          <Route
            path="terms"
            element={<Navigate to="/legal/terms" replace />}
          />
          <Route
            path="privacy"
            element={<Navigate to="/legal/privacy" replace />}
          />
          <Route
            path="cookies"
            element={<Navigate to="/legal/cookies" replace />}
          />
          <Route path="partner/onboarding" element={<PartnerOnboarding />} />
          <Route path="partner/resubmit" element={<PartnerResubmit />} />
          <Route path="restaurant-menu/:id" element={<RestaurantMenuFront />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
