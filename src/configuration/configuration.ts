export default () => ({
  buildInfo: {
    buildNumber: process.env.WM_APP_LABEL ?? 'localBuild',
  },
});
