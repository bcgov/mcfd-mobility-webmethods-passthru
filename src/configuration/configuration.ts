export default () => ({
  recordCache: {
    cacheTtlMs: parseInt(process.env.RECORD_CACHE_MS) || 5 * 60 * 1000, // 5 minutes
  },
  buildInfo: {
    buildNumber: process.env.WM_APP_LABEL ?? 'localBuild',
  },
  fileUpload: {
    maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_BYTES) ?? 5242880,
  },
  auth: {
    authInfo: process.env.AUTH_STRING ?? ' ',
    case: {
      endpoint: encodeURI((process.env.CASE_ENDPOINT ?? ' ').trim()),
      workspace: process.env.CASE_WORKSPACE ?? undefined,
      searchspecIdirField: process.env.CASE_SEARCHSPEC_IDIR_FIELD ?? undefined,
      idField: process.env.CASE_ID_FIELDNAME ?? undefined,
    },
    incident: {
      endpoint: encodeURI((process.env.INCIDENT_ENDPOINT ?? ' ').trim()),
      workspace: process.env.INCIDENT_WORKSPACE ?? undefined,
      searchspecIdirField:
        process.env.INCIDENT_SEARCHSPEC_IDIR_FIELD ?? undefined,
      idField: process.env.INCIDENT_ID_FIELDNAME ?? undefined,
    },
    sr: {
      endpoint: encodeURI((process.env.SR_ENDPOINT ?? ' ').trim()),
      workspace: process.env.SR_WORKSPACE ?? undefined,
      searchspecIdirField: process.env.SR_SEARCHSPEC_IDIR_FIELD ?? undefined,
      idField: process.env.SR_ID_FIELDNAME ?? undefined,
    },
    memo: {
      endpoint: encodeURI((process.env.MEMO_ENDPOINT ?? ' ').trim()),
      workspace: process.env.MEMO_WORKSPACE ?? undefined,
      searchspecIdirField: process.env.MEMO_SEARCHSPEC_IDIR_FIELD ?? undefined,
      idField: process.env.MEMO_ID_FIELDNAME ?? undefined,
    },
    employee: {
      endpoint: encodeURI((process.env.EMPLOYEE_ENDPOINT ?? ' ').trim()),
      workspace: process.env.EMPLOYEE_WORKSPACE ?? undefined,
    },
  },
  oauth: {
    accessTokenUrl: process.env.ACCESS_TOKEN_URL ?? ' ',
    clientId: process.env.CLIENT_ID ?? ' ',
    clientSecret: process.env.CLIENT_SECRET ?? ' ',
  },
  endpointUrls: {
    workflowUrl: process.env.WORKFLOW_API_URL ?? ' ',
    dataApiUrl: process.env.DATA_API_URL ?? ' ',
    submitAttachment: process.env.SUBMIT_ATTACHMENT_ENDPOINT ?? ' ',
    caseload: process.env.CASELOAD_ENDPOINT ?? ' ',
    entityDetails: process.env.ENTITY_DETAILS_ENDPOINT ?? ' ',
    getNotes: process.env.GET_NOTES_ENDPOINT ?? ' ',
    submitNotesKKCFS: process.env.SUBMIT_NOTES_KKCFS_ENDPOINT ?? ' ',
    submitNotesVisitz: process.env.SUBMIT_NOTES_VISITZ_ENDPOINT ?? ' ',
    submitSafetyAssessment:
      process.env.SUBMIT_SAFETY_ASSESSMENT_ENDPOINT ?? ' ',
  },
  skipJWTCache:
    process.env.WM_APP_ENV === 'prod'
      ? false
      : process.env.SKIP_JWT_CACHE === 'true',
  clamav: {
    debugMode:
      process.env.CLAM_DEBUG_MODE != undefined
        ? process.env.CLAM_DEBUG_MODE === 'true'
        : false,
    clamdscan: {
      host: process.env.CLAMD_HOST,
      port: parseInt(process.env.CLAMD_PORT),
      timeout: process.env.CLAMD_TIMEOUT
        ? parseInt(process.env.CLAMD_TIMEOUT)
        : 120000,
      configFile:
        process.env.CLAMD_CONFIG_FILE && process.env.CLAMD_CONFIG_FILE != 'null'
          ? process.env.CLAMD_CONFIG_FILE
          : null,
      // Whether or not to use multiple cores when scanning
      multiscan:
        process.env.CLAMD_MULTI_SCAN != undefined
          ? process.env.CLAMD_MULTI_SCAN === 'true'
          : false,
      bypassTest:
        process.env.CLAMD_BYPASS_TEST != undefined
          ? process.env.CLAMD_BYPASS_TEST === 'true'
          : false,
    },
  },
});
