import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";

import { roles } from "../config/roles.config.js";
import { routes } from "../config/routes.config.js";
import RequireAuth from "../features/auth/components/RequireAuth.jsx";
import RequireRole from "../features/auth/components/RequireRole.jsx";
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import MagicLoginPage from "../features/auth/pages/MagicLoginPage.jsx";
import ConfirmEmailChangePage from "../features/auth/pages/ConfirmEmailChangePage.jsx";
import AccountSettingsPage from "../features/auth/pages/AccountSettingsPage.jsx";
import RegistrationConfirmationPage from "../features/auth/pages/RegistrationConfirmationPage.jsx";
import RegistrationPage from "../features/auth/pages/RegistrationPage.jsx";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage.jsx";
import AdminAccountsPage from "../features/accounts/pages/AdminAccountsPage.jsx";
import AdminAccountDetailPage from "../features/accounts/pages/AdminAccountDetailPage.jsx";
import AdminCommunicationsPage from "../features/communications/pages/AdminCommunicationsPage.jsx";
import AdminCommunicationDetailPage from "../features/communications/pages/AdminCommunicationDetailPage.jsx";
import AdminCommunicationEditorPage from "../features/communications/pages/AdminCommunicationEditorPage.jsx";
import AdminContactDetailPage from "../features/crm/pages/AdminContactDetailPage.jsx";
import AdminContactEditorPage from "../features/crm/pages/AdminContactEditorPage.jsx";
import AdminContactsPage from "../features/crm/pages/AdminContactsPage.jsx";
import AdminCrmPage from "../features/crm/pages/AdminCrmPage.jsx";
import AdminCrmSegmentsPage from "../features/crm/pages/AdminCrmSegmentsPage.jsx";
import AdminCrmTagsPage from "../features/crm/pages/AdminCrmTagsPage.jsx";
import AdminActivityPage from "../features/dashboard/pages/AdminActivityPage.jsx";
import AdminAnalysesPage from "../features/dashboard/pages/AdminAnalysesPage.jsx";
import AdminTasksPage from "../features/dashboard/pages/AdminTasksPage.jsx";
import AdminExportDetailPage from "../features/exports/pages/AdminExportDetailPage.jsx";
import AdminExportEditorPage from "../features/exports/pages/AdminExportEditorPage.jsx";
import AdminExportsPage from "../features/exports/pages/AdminExportsPage.jsx";
import AdminQuizAttemptPage from "../features/quiz/admin/AdminQuizAttemptPage.jsx";
import AdminQuizPage from "../features/quiz/admin/AdminQuizPage.jsx";
import AdminQuizParticipantPage from "../features/quiz/admin/AdminQuizParticipantPage.jsx";
import { QuizProvider } from "../features/quiz/context/QuizContext.jsx";
import MemberQuizHistoryPage from "../features/quiz/pages/MemberQuizHistoryPage.jsx";
import MemberQuizResultPage from "../features/quiz/pages/MemberQuizResultPage.jsx";
import QuizProfileSelectionPage from "../features/quiz/pages/QuizProfileSelectionPage.jsx";
import QuizQuestionsPage from "../features/quiz/pages/QuizQuestionsPage.jsx";
import QuizResultSentPage from "../features/quiz/pages/QuizResultSentPage.jsx";
import AdminResourceRequestsPage from "../features/resources/pages/AdminResourceRequestsPage.jsx";
import AdminResourceReviewsPage from "../features/resources/pages/AdminResourceReviewsPage.jsx";
import ResourceEditorPage from "../features/resources/pages/ResourceEditorPage.jsx";
import ResourceHistoryPage from "../features/resources/pages/ResourceHistoryPage.jsx";
import ResourceManagementPage from "../features/resources/pages/ResourceManagementPage.jsx";
import ResourceModerationPage from "../features/resources/pages/ResourceModerationPage.jsx";
import AdminSystemPage from "../features/system/pages/AdminSystemPage.jsx";
import AdminSafePlaceCategoriesPage from "../features/safe-place/pages/AdminSafePlaceCategoriesPage.jsx";
import AdminSafePlaceModerationPage from "../features/safe-place/pages/AdminSafePlaceModerationPage.jsx";
import AdminSafePlacePage from "../features/safe-place/pages/AdminSafePlacePage.jsx";
import AdminSafePlaceReportPage from "../features/safe-place/pages/AdminSafePlaceReportPage.jsx";
import AdminSafePlaceSuspensionsPage from "../features/safe-place/pages/AdminSafePlaceSuspensionsPage.jsx";
import SafePlaceCategoryPage from "../features/safe-place/pages/SafePlaceCategoryPage.jsx";
import SafePlaceCharterPage from "../features/safe-place/pages/SafePlaceCharterPage.jsx";
import SafePlaceComposerPage from "../features/safe-place/pages/SafePlaceComposerPage.jsx";
import SafePlaceDiscussionPage from "../features/safe-place/pages/SafePlaceDiscussionPage.jsx";
import SafePlaceLandingPage from "../features/safe-place/pages/SafePlaceLandingPage.jsx";
import SafePlaceMyContentPage from "../features/safe-place/pages/SafePlaceMyContentPage.jsx";
import SafePlaceMyReportsPage from "../features/safe-place/pages/SafePlaceMyReportsPage.jsx";
import SafePlacePreferencesPage from "../features/safe-place/pages/SafePlacePreferencesPage.jsx";
import NotificationPreferencesPage from "../features/notifications/pages/NotificationPreferencesPage.jsx";
import NotificationsPage from "../features/notifications/pages/NotificationsPage.jsx";
import MyWebinarsPage from "../features/webinars/pages/account/MyWebinarsPage.jsx";
import WebinarConfirmationPage from "../features/webinars/pages/account/WebinarConfirmationPage.jsx";
import WebinarEvaluationPage from "../features/webinars/pages/account/WebinarEvaluationPage.jsx";
import WebinarReplayPage from "../features/webinars/pages/account/WebinarReplayPage.jsx";
import AdminWebinarDetailPage from "../features/webinars/pages/admin/AdminWebinarDetailPage.jsx";
import AdminWebinarEditorPage from "../features/webinars/pages/admin/AdminWebinarEditorPage.jsx";
import AdminWebinarParticipantsPage from "../features/webinars/pages/admin/AdminWebinarParticipantsPage.jsx";
import AdminWebinarQuestionsPage from "../features/webinars/pages/admin/AdminWebinarQuestionsPage.jsx";
import AdminWebinarsPage from "../features/webinars/pages/admin/AdminWebinarsPage.jsx";
import AdminWebinarStatsPage from "../features/webinars/pages/admin/AdminWebinarStatsPage.jsx";
import WebinarCataloguePage from "../features/webinars/pages/public/WebinarCataloguePage.jsx";
import WebinarDetailPage from "../features/webinars/pages/public/WebinarDetailPage.jsx";
import LeaveIntervenantRolePage from "../features/intervenants/pages/account/LeaveIntervenantRolePage.jsx";
import ProfessionalProfilePage from "../features/intervenants/pages/account/ProfessionalProfilePage.jsx";
import AdminApplicationDetailPage from "../features/intervenants/pages/admin/AdminApplicationDetailPage.jsx";
import AdminApplicationsPage from "../features/intervenants/pages/admin/AdminApplicationsPage.jsx";
import AdminIntervenantExitPage from "../features/intervenants/pages/admin/AdminIntervenantExitPage.jsx";
import AdminIntervenantsPage from "../features/intervenants/pages/admin/AdminIntervenantsPage.jsx";
import AdminProfessionalProfileDetailPage from "../features/intervenants/pages/admin/AdminProfessionalProfileDetailPage.jsx";
import AdminProfessionalProfilesPage from "../features/intervenants/pages/admin/AdminProfessionalProfilesPage.jsx";
import IntervenantApplicationPage from "../features/intervenants/pages/member/IntervenantApplicationPage.jsx";
import IntervenantApplicationStatusPage from "../features/intervenants/pages/member/IntervenantApplicationStatusPage.jsx";
import BecomeIntervenantPage from "../features/intervenants/pages/public/BecomeIntervenantPage.jsx";
import ProfessionalDetailPage from "../features/intervenants/pages/public/ProfessionalDetailPage.jsx";
import ProfessionalsPage from "../features/intervenants/pages/public/ProfessionalsPage.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import IntervenantLayout from "../layouts/IntervenantLayout.jsx";
import MemberLayout from "../layouts/MemberLayout.jsx";
import PublicLayout from "../layouts/PublicLayout.jsx";
import ScrollToTop from "../layouts/ScrollToTop.jsx";
import SectionBackButton from "../components/navigation/SectionBackButton.jsx";
import AccessDenied from "../pages/AccessDenied.jsx";
import AccompanimentDetailPage from "../pages/AccompanimentDetailPage.jsx";
import AccountSuspended from "../pages/AccountSuspended.jsx";
import Accompaniments from "../pages/Accompaniments.jsx";
import ClairierePage from "../pages/ClairierePage.jsx";
import AdminHome from "../pages/AdminHome.jsx";
import Contact from "../pages/Contact.jsx";
import Home from "../pages/Home.jsx";
import IntervenantHome from "../pages/IntervenantHome.jsx";
import MemberHome from "../pages/MemberHome.jsx";
import NotFound from "../pages/NotFound.jsx";
import LegalEditorialPage from "../pages/LegalEditorialPage.jsx";
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage.jsx";
import Quiz from "../pages/Quiz.jsx";
import ResourceDetail from "../pages/ResourceDetail.jsx";
import Resources from "../pages/Ressources.jsx";
import TermsPage from "../pages/TermsPage.jsx";
import Vision from "../pages/Vision.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <QuizProvider>
        <ScrollToTop />
        <SectionBackButton />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path={routes.home} element={<Home />} />
            <Route path={routes.platform} element={<ClairierePage />} />
            <Route path={routes.contact} element={<Contact />} />
            <Route path={routes.resources} element={<Resources />} />
            <Route path={routes.resourceDetail} element={<ResourceDetail />} />
            <Route path={routes.quiz} element={<Quiz />} />
            <Route path="/quiz" element={<Navigate to={routes.quiz} replace />} />
            <Route path={routes.webinars} element={<WebinarCataloguePage />} />
            <Route path={routes.webinarDetail} element={<WebinarDetailPage />} />
            <Route path={routes.accompaniments} element={<Accompaniments />} />
            <Route
              path={routes.accompanimentCoaching}
              element={<AccompanimentDetailPage offerId="coaching" />}
            />
            <Route
              path={routes.accompanimentAine}
              element={<AccompanimentDetailPage offerId="aine" />}
            />
            <Route
              path={routes.accompanimentSymptothermy}
              element={<AccompanimentDetailPage offerId="symptothermy" />}
            />
            <Route path={routes.vision} element={<Vision />} />
            <Route path={routes.becomeIntervenant} element={<BecomeIntervenantPage />} />
            <Route path={routes.professionals} element={<ProfessionalsPage />} />
            <Route path={routes.professionalDetail} element={<ProfessionalDetailPage />} />
            <Route path={routes.community} element={<SafePlaceLandingPage />} />
            <Route path={routes.communityCharter} element={<SafePlaceCharterPage />} />
            <Route element={<RequireAuth />}>
              <Route path={routes.myWebinars} element={<MyWebinarsPage />} />
              <Route path={routes.webinarConfirmation} element={<WebinarConfirmationPage />} />
              <Route path={routes.webinarReplay} element={<WebinarReplayPage />} />
              <Route path={routes.webinarEvaluation} element={<WebinarEvaluationPage />} />
              <Route path={routes.notifications} element={<NotificationsPage />} />
              <Route
                path={routes.notificationPreferences}
                element={<NotificationPreferencesPage />}
              />
              <Route element={<RequireRole allowedRoles={[roles.member, roles.admin]} />}>
                <Route path={routes.communityCategory} element={<SafePlaceCategoryPage />} />
                <Route path={routes.communityDiscussion} element={<SafePlaceDiscussionPage />} />
                <Route path={routes.communityNewDiscussion} element={<SafePlaceComposerPage />} />
                <Route path={routes.communityEditDiscussion} element={<SafePlaceComposerPage />} />
                <Route path={routes.communityMyContent} element={<SafePlaceMyContentPage />} />
                <Route path={routes.communityMyReports} element={<SafePlaceMyReportsPage />} />
                <Route path={routes.communityPreferences} element={<SafePlacePreferencesPage />} />
              </Route>
            </Route>
            <Route path={routes.accessDenied} element={<AccessDenied />} />
            <Route path={routes.accountSuspended} element={<AccountSuspended />} />
            <Route path={routes.terms} element={<TermsPage />} />
            <Route path={routes.privacyPolicy} element={<PrivacyPolicyPage />} />
            <Route path={routes.legalNotice} element={<LegalEditorialPage page="notice" />} />
            <Route path={routes.cookiesPolicy} element={<LegalEditorialPage page="cookies" />} />
            <Route
              path={routes.accessibility}
              element={<LegalEditorialPage page="accessibility" />}
            />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path={routes.login} element={<LoginPage />} />
            <Route path={routes.loginLink} element={<MagicLoginPage />} />
            <Route path={routes.registration} element={<RegistrationPage />} />
            <Route
              path={routes.registrationConfirmation}
              element={<RegistrationConfirmationPage />}
            />
            <Route path={routes.verifyEmail} element={<VerifyEmailPage />} />
            <Route path={routes.confirmEmailChange} element={<ConfirmEmailChangePage />} />
            <Route path={routes.quizQuestions} element={<QuizQuestionsPage />} />
            <Route path={routes.quizProfileSelection} element={<QuizProfileSelectionPage />} />
            <Route path={routes.quizResultSent} element={<QuizResultSentPage />} />
            <Route
              path="/quiz/questions"
              element={<Navigate to={routes.quizQuestions} replace />}
            />
            <Route
              path="/quiz/choisir-profil"
              element={<Navigate to={routes.quizProfileSelection} replace />}
            />
            <Route
              path="/quiz/resultat-envoye"
              element={<Navigate to={routes.quizResultSent} replace />}
            />
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<PublicLayout />}>
              <Route path={routes.accountSettings} element={<AccountSettingsPage />} />
            </Route>
            <Route element={<RequireRole allowedRoles={[roles.member]} />}>
              <Route element={<MemberLayout />}>
                <Route path={routes.memberHome} element={<MemberHome />} />
                <Route
                  path={routes.memberIntervenantApplication}
                  element={<IntervenantApplicationPage />}
                />
                <Route
                  path={routes.memberIntervenantApplicationStatus}
                  element={<IntervenantApplicationStatusPage />}
                />
                <Route path={routes.memberQuizResult} element={<MemberQuizResultPage />} />
                <Route path={routes.memberQuizHistory} element={<MemberQuizHistoryPage />} />
              </Route>
            </Route>

            <Route element={<RequireRole allowedRoles={[roles.intervenant]} />}>
              <Route element={<IntervenantLayout />}>
                <Route path={routes.intervenantHome} element={<IntervenantHome />} />
                <Route path={routes.intervenantProfile} element={<ProfessionalProfilePage />} />
                <Route path={routes.intervenantExit} element={<LeaveIntervenantRolePage />} />
                <Route path={routes.intervenantResources} element={<ResourceManagementPage />} />
                <Route path={routes.intervenantResourceNew} element={<ResourceEditorPage />} />
                <Route path={routes.intervenantResourceDetail} element={<ResourceEditorPage />} />
                <Route path={routes.intervenantResourceEdit} element={<ResourceEditorPage />} />
                <Route path={routes.intervenantResourceHistory} element={<ResourceHistoryPage />} />
              </Route>
            </Route>

            <Route element={<RequireRole allowedRoles={[roles.admin]} />}>
              <Route element={<AdminLayout />}>
                <Route path={routes.adminHome} element={<AdminHome />} />
                <Route path={routes.adminActivity} element={<AdminActivityPage />} />
                <Route path={routes.adminTasks} element={<AdminTasksPage />} />
                <Route path={routes.adminAnalyses} element={<AdminAnalysesPage />} />
                <Route path={routes.adminCrm} element={<AdminCrmPage />} />
                <Route path={routes.adminCrmContacts} element={<AdminContactsPage />} />
                <Route path={routes.adminCrmContactNew} element={<AdminContactEditorPage />} />
                <Route path={routes.adminCrmContact} element={<AdminContactDetailPage />} />
                <Route path={routes.adminCrmTasks} element={<AdminTasksPage />} />
                <Route path={routes.adminCrmTags} element={<AdminCrmTagsPage />} />
                <Route path={routes.adminCrmSegments} element={<AdminCrmSegmentsPage />} />
                <Route path={routes.adminAccounts} element={<AdminAccountsPage />} />
                <Route path={routes.adminAccount} element={<AdminAccountDetailPage />} />
                <Route path={routes.adminCommunications} element={<AdminCommunicationsPage />} />
                <Route
                  path={routes.adminCommunicationNew}
                  element={<AdminCommunicationEditorPage />}
                />
                <Route
                  path={routes.adminCommunication}
                  element={<AdminCommunicationDetailPage />}
                />
                <Route
                  path={routes.adminCommunicationEdit}
                  element={<AdminCommunicationEditorPage />}
                />
                <Route path={routes.adminExports} element={<AdminExportsPage />} />
                <Route path={routes.adminExportNew} element={<AdminExportEditorPage />} />
                <Route path={routes.adminExport} element={<AdminExportDetailPage />} />
                <Route path={routes.adminSystem} element={<AdminSystemPage />} />
                <Route path={routes.adminQuiz} element={<AdminQuizPage />} />
                <Route path={routes.adminQuizParticipant} element={<AdminQuizParticipantPage />} />
                <Route path={routes.adminQuizAttempt} element={<AdminQuizAttemptPage />} />
                <Route path={routes.adminResources} element={<ResourceManagementPage />} />
                <Route path={routes.adminResourceNew} element={<ResourceEditorPage />} />
                <Route path={routes.adminResourceReviews} element={<AdminResourceReviewsPage />} />
                <Route
                  path={routes.adminResourceRequests}
                  element={<AdminResourceRequestsPage />}
                />
                <Route path={routes.adminResourceModeration} element={<ResourceModerationPage />} />
                <Route path={routes.adminResourceDetail} element={<ResourceEditorPage />} />
                <Route path={routes.adminResourceEdit} element={<ResourceEditorPage />} />
                <Route path={routes.adminResourceHistory} element={<ResourceHistoryPage />} />
                <Route path={routes.adminCommunity} element={<AdminSafePlacePage />} />
                <Route
                  path={routes.adminCommunityCategories}
                  element={<AdminSafePlaceCategoriesPage />}
                />
                <Route
                  path={routes.adminCommunityModeration}
                  element={<AdminSafePlaceModerationPage />}
                />
                <Route path={routes.adminCommunityReport} element={<AdminSafePlaceReportPage />} />
                <Route
                  path={routes.adminCommunitySuspensions}
                  element={<AdminSafePlaceSuspensionsPage />}
                />
                <Route path={routes.adminWebinars} element={<AdminWebinarsPage />} />
                <Route path={routes.adminWebinarNew} element={<AdminWebinarEditorPage />} />
                <Route path={routes.adminWebinarDetail} element={<AdminWebinarDetailPage />} />
                <Route path={routes.adminWebinarEdit} element={<AdminWebinarEditorPage />} />
                <Route
                  path={routes.adminWebinarParticipants}
                  element={<AdminWebinarParticipantsPage />}
                />
                <Route
                  path={routes.adminWebinarQuestions}
                  element={<AdminWebinarQuestionsPage />}
                />
                <Route path={routes.adminWebinarStats} element={<AdminWebinarStatsPage />} />
                <Route path={routes.adminIntervenants} element={<AdminIntervenantsPage />} />
                <Route
                  path={routes.adminIntervenantApplications}
                  element={<AdminApplicationsPage />}
                />
                <Route
                  path={routes.adminIntervenantApplication}
                  element={<AdminApplicationDetailPage />}
                />
                <Route
                  path={routes.adminProfessionalProfiles}
                  element={<AdminProfessionalProfilesPage />}
                />
                <Route
                  path={routes.adminProfessionalProfile}
                  element={<AdminProfessionalProfileDetailPage />}
                />
                <Route path={routes.adminIntervenantExits} element={<AdminIntervenantExitPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/resources" element={<Navigate to={routes.resources} replace />} />
          <Route path="/resources/:slug" element={<LegacyResourceRedirect />} />
          <Route path="/gynece" element={<Navigate to={routes.community} replace />} />
          <Route path="/vision" element={<Navigate to={routes.vision} replace />} />
          <Route path="/espace-communaute/*" element={<LegacyCommunityRedirect />} />
          <Route path="/webinars/:webinarId" element={<LegacyWebinarRedirect />} />
          <Route
            path="/webinars/registrations/:registrationId/confirm"
            element={<LegacyWebinarConfirmationRedirect />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </QuizProvider>
    </BrowserRouter>
  );
}

function LegacyWebinarRedirect() {
  const { webinarId } = useParams();
  return <Navigate to={`/webinaires/${webinarId}`} replace />;
}

function LegacyWebinarConfirmationRedirect() {
  const { registrationId } = useParams();
  return <Navigate to={`/webinaires/inscriptions/${registrationId}/confirmer`} replace />;
}

function LegacyResourceRedirect() {
  const { slug } = useParams();
  return <Navigate to={`${routes.resources}/${slug}`} replace />;
}

function LegacyCommunityRedirect() {
  const legacyPath = window.location.pathname.replace(/^\/espace-communaute/, routes.community);
  return <Navigate to={`${legacyPath}${window.location.search}`} replace />;
}
