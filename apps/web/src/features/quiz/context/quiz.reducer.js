import { quizStages } from "../../../config/quiz.config.js";

export const initialQuizState = {
  quiz: null,
  stage: quizStages.preparation,
  currentIndex: 0,
  answers: {},
  participantInfo: { age: "", contraception: "", adultConfirmed: false },
  identity: { firstName: "", email: "" },
  consents: {
    spmDataProcessing: false,
    resultEmail: false,
    marketingCommunications: false,
    personalContact: false,
  },
  attemptId: null,
  selectionToken: null,
  candidateProfiles: [],
  result: null,
  resultEmail: null,
  error: null,
};

export function quizReducer(state, action) {
  switch (action.type) {
    case "QUIZ_LOADED":
      return { ...state, quiz: action.quiz, error: null };
    case "PREFILL":
      return {
        ...state,
        participantInfo: {
          age: action.prefill.age,
          contraception: action.prefill.contraception,
          adultConfirmed: false,
        },
        identity: {
          firstName: action.prefill.firstName,
          email: action.prefill.email,
        },
      };
    case "SET_PARTICIPANT":
      return { ...state, participantInfo: { ...state.participantInfo, ...action.value } };
    case "SET_IDENTITY":
      return { ...state, identity: { ...state.identity, ...action.value } };
    case "SET_CONSENT":
      return { ...state, consents: { ...state.consents, [action.name]: action.value } };
    case "ANSWER":
      return { ...state, answers: { ...state.answers, [action.questionId]: action.answerKey } };
    case "GO_TO":
      return { ...state, currentIndex: action.index, stage: quizStages.question, error: null };
    case "STAGE":
      return { ...state, stage: action.stage, error: null };
    case "SUBMITTING":
      return { ...state, stage: quizStages.submitting, error: null };
    case "ACCOUNT_LOGIN":
      return { ...state, stage: quizStages.accountLogin, error: action.error || null };
    case "AWAITING_SELECTION":
      return {
        ...state,
        stage: quizStages.profileSelection,
        attemptId: action.data.attemptId,
        selectionToken: action.data.selectionToken,
        candidateProfiles: action.data.candidateProfiles,
      };
    case "COMPLETED":
      return {
        ...state,
        stage: quizStages.completed,
        result: action.data.result || null,
        resultEmail: action.data.resultDeliveredByEmail,
        selectionToken: null,
      };
    case "ERROR":
      return { ...state, error: action.error, stage: action.stage || state.stage };
    case "RESET":
      return initialQuizState;
    default:
      return state;
  }
}
