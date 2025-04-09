export default () => ({
  buildInfo: {
    buildNumber: process.env.WM_APP_LABEL ?? 'localBuild',
  },
  auth: {
    authInfo: process.env.AUTH_STRING ?? ' ',
  },
  endpointUrls: {
    submitAttachment: process.env.SUBMIT_ATTACHMENT_ENDPOINT ?? ' ',
    caseload: process.env.CASELOAD_ENDPOINT ?? ' ',
    entityDetails: process.env.ENTITY_DETAILS_ENDPOINT ?? ' ',
    getNotes: process.env.GET_NOTES_ENDPOINT ?? ' ',
    submitNotesKKCFS: process.env.SUBMIT_NOTES_KKCFS_ENDPOINT ?? ' ',
    submitNotesVisitz: process.env.SUBMIT_NOTES_VISITZ_ENDPOINT ?? ' ',
    submitSafetyAssessment:
      process.env.SUBMIT_SAFETY_ASSESSMENT_ENDPOINT ?? ' ',
  },
});
