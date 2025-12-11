import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StripeProvider from "./components/StripeProvider";
import { Toaster } from "react-hot-toast";

// Auth Provider
import { AuthProvider } from "./contexts/AuthContext";
import { YouTubeProvider } from "./contexts/YouTubeContext";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Components
import OfflineDetector from "./components/OfflineDetector";
import NetworkStatus from "./components/NetworkStatus";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Lazy load all pages for better performance
const Checkout = React.lazy(() => import("./pages/Subscription/Checkout"));
const UpiVerify = React.lazy(() => import("./pages/Subscription/UpiVerify"));

// Auth Pages
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));
const ForgotPassword = React.lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/auth/ResetPassword"));

// Main Pages
const LandingPage = React.lazy(() => import("./pages/Landing"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Offline = React.lazy(() => import("./pages/Offline"));

// Video Pages
const VideoList = React.lazy(() => import("./pages/videos/VideoList"));
const VideoUpload = React.lazy(() => import("./pages/videos/VideoUpload"));
const VideoDetail = React.lazy(() => import("./pages/videos/VideoDetail"));
const VideoEdit = React.lazy(() => import("./pages/videos/VideoEdit"));

// Bundle Pages
const BundleList = React.lazy(() => import("./pages/bundles/BundleList"));
const BundleDetail = React.lazy(() => import("./pages/bundles/BundleDetail"));
const CreateBundle = React.lazy(() => import("./pages/bundles/CreateBundle"));
const EditBundle = React.lazy(() => import("./pages/bundles/EditBundle"));

// Schedule Pages
const ScheduleList = React.lazy(() => import("./pages/schedules/ScheduleList"));
const ScheduleDetail = React.lazy(() => import("./pages/schedules/ScheduleDetail"));
const CreateSchedule = React.lazy(() => import("./pages/schedules/CreateSchedule"));
const EditSchedule = React.lazy(() => import("./pages/schedules/EditSchedule"));
const YouTubeCallback = React.lazy(() => import("./pages/YouTubeCallback"));

// Subscription Pages
const Subscription = React.lazy(() => import("./pages/Subscription/SubscriptionPage"));
const SubscriptionDetails = React.lazy(() => import("./pages/Subscription/SubscriptionDetails"));
const SubscriptionSuccess = React.lazy(() => import("./pages/Subscription/SubscriptionSuccess"));

// Other Pages
const MockGoogleAuth = React.lazy(() => import("./pages/MockGoogleAuth"));
const YouTubeSettings = React.lazy(() => import("./pages/YouTubeSettings"));
const AIGenerate = React.lazy(() => import("./pages/AIGenerate"));
const PrivacyPolicy = React.lazy(() => import("./pages/PolicyPage"));
const Terms = React.lazy(() => import("./pages/Terms"));
const CookiePolicy = React.lazy(() => import("./pages/CookiePolicyPage"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Contact = React.lazy(() => import("./pages/Contact"));
const AboutUs = React.lazy(() => import("./pages/AboutUs"));
const DataDeletion = React.lazy(() => import("./pages/DataDeletion"));
const FeedbackSupportPage = React.lazy(() => import("./pages/FeedbackSupportPage"));
const TeamManagement = React.lazy(() => import("./pages/TeamMember/TeamManagement"));
const TeamInvitationAccept = React.lazy(() => import("./pages/TeamMember/TeamInvitationAccept"));
const TeamMemberWorkflow = React.lazy(() => import("./pages/TeamMember/TeamMemberWorkflow"));
const AdminPanelRoutes = React.lazy(() => import('./pages/admin'));
const ContentPage = React.lazy(() => import("./pages/ContentPage"));
const Profile = React.lazy(() => import("./pages/Profile"));

// Context
import { InstagramProvider } from "./contexts/InstagramContext";
import RateLimitExceeded from "./pages/RateLimitExceeded";

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <LoadingSpinner />
  </div>
);

function App() {
  return (
    <>
      <NetworkStatus />
      <Router>
        <AuthProvider>
          <YouTubeProvider>
            <InstagramProvider>
              <OfflineDetector />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Landing Page */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="terms" element={<Terms />} />
                  <Route path="cookies" element={<CookiePolicy />} />
                  <Route path="contact" element={<Contact />} />
                  <Route
                    path="feedback-support"
                    element={<FeedbackSupportPage />}
                  />
                  <Route path="about" element={<AboutUs />} />
                  <Route path="data-deletion" element={<DataDeletion />} />
                  <Route path="mock-google-auth" element={<MockGoogleAuth />} />
                  <Route path="youtube-callback" element={<YouTubeCallback />} />
                  <Route path="/offline" element={<Offline />} />

                  {/* Auth Routes */}
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                  </Route>

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/admin/*" element={<AdminPanelRoutes />} />
                    <Route path="/" element={<MainLayout />}>
                      <Route path="dashboard" element={<Dashboard />} />

                      {/* Video Routes */}
                      <Route path="videos" element={<VideoList />} />
                      <Route
                        path="videos/upload"
                        element={
                          <VideoUpload
                            onUploadComplete={() => {}}
                            data={() => {}}
                          />
                        }
                      />
                      <Route path="videos/:id" element={<VideoDetail />} />
                      <Route path="videos/:id/edit" element={<VideoEdit />} />

                      {/* Bundle Routes */}
                      <Route path="bundles" element={<BundleList />} />
                      <Route path="bundles/create" element={<CreateBundle />} />
                      <Route path="bundles/:id" element={<BundleDetail />} />
                      <Route path="bundles/:id/edit" element={<EditBundle />} />

                      {/* Schedule Routes */}
                      <Route path="schedules" element={<ScheduleList />} />
                      <Route
                        path="schedules/create"
                        element={<CreateSchedule />}
                      />
                      <Route path="schedules/:id" element={<ScheduleDetail />} />
                      <Route
                        path="schedules/:id/edit"
                        element={<EditSchedule />}
                      />

                      {/* Subscription Routes */}
                      <Route path="subscription" element={<Subscription />} />
                      <Route
                        path="subscription/checkout/:planId"
                        element={
                          <StripeProvider>
                            <Checkout />
                          </StripeProvider>
                        }
                      />
                      <Route
                        path="subscription/details"
                        element={<SubscriptionDetails />}
                      />
                      <Route
                        path="subscription/success"
                        element={<SubscriptionSuccess />}
                      />
                      <Route
                        path="subscription/upi-verify"
                        element={<UpiVerify />}
                      />
                      <Route
                        path="subscription/billing-history"
                        element={<SubscriptionDetails />}
                      />
                      <Route
                        path="subscription/cancel"
                        element={<SubscriptionDetails />}
                      />
                      <Route
                        path="subscription/reactivate"
                        element={<SubscriptionDetails />}
                      />

                      {/* Team Management Route */}
                      <Route
                        path="team-management"
                        element={<TeamManagement />}
                      />
                      <Route
                        path="/team-member-workflow"
                        element={<TeamMemberWorkflow />}
                      />

                      {/* Profile Route */}
                      <Route path="profile" element={<Profile />} />

                      {/* YouTube Settings Route */}
                      <Route
                        path="youtube-settings"
                        element={<YouTubeSettings />}
                      />

                      {/* AI Generation Route */}
                      <Route path="AI-generate" element={<AIGenerate />} />

                      {/* Analytics Route */}
                      <Route path="analytics" element={<Analytics />} />

                      {/* Team Invitation Accept Route */}
                      <Route
                        path="/team-invitations/accept/:teamMemberId"
                        element={<TeamInvitationAccept />}
                      />

                      {/* Content Page */}
                      <Route path="/content" element={<ContentPage />} />
                    </Route>
                  </Route>

                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />

                  {/* Rate Limit Exceeded */}
                  <Route path="/rate-limit-exceeded" element={<RateLimitExceeded />} />
                </Routes>
              </Suspense>
              <Toaster position="top-right" />
            </InstagramProvider>
          </YouTubeProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
