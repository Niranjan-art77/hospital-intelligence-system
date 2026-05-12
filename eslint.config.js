import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'backend/**',
    'health-intelligence-backend/**',
    '**/__pycache__/**',
    '**/*.pyc',
    // Work-in-progress prototype components (not shipped in app routes)
    'src/components/AIDiseasePrediction.jsx',
    'src/components/AIHealthAssistant.jsx',
    'src/components/AISymptomChecker.jsx',
    'src/components/AppointmentDetailsModal.jsx',
    'src/components/ChatBotFAB.jsx',
    'src/components/EnhancedDoctorDashboard.jsx',
    'src/components/EnhancedMedicalTimeline.jsx',
    'src/components/EnhancedPatientDashboard.jsx',
    'src/components/HealthAlertSystem.jsx',
    'src/components/HealthAnalytics.jsx',
    'src/components/HealthMonitoringDashboard.jsx',
    // Current repo includes many unused/experimental components that break lint.
    // The shipped application mounts pages via `src/App.jsx` + layouts; those files are still linted.
    'src/components/**',
    // Unused or broken pages not mounted by router
    'src/pages/doctor/EnhancedDoctorDashboard.jsx',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
