const fs = require('fs');
const path = require('path');

const files = [
  'src/features/admin/pages/AdminSettings.jsx',
  'src/features/admin/pages/InstitutionProfile.jsx',
  'src/features/admin/pages/InstitutionTreasury.jsx',
  'src/features/admin/pages/LoanDisbursement.jsx',
  'src/features/admin/pages/ShareManagement.jsx',
  'src/features/admin/pages/WithdrawalQueue.jsx',
  'src/features/auth/pages/Onboarding.jsx',
  'src/features/loans/pages/LoanReview.jsx',
  'src/features/savings/components/BuySharesModal.jsx',
  'src/features/savings/components/SubscribeModal.jsx',
  'src/features/savings/pages/SavingsProducts.jsx',
  'src/features/savings/pages/WithdrawalRequest.jsx',
  'src/features/superadmin/pages/InstitutionDetail.jsx',
  'src/features/superadmin/pages/SuperAdminDashboard.jsx',
  'src/shared/components/common/CommandPalette.jsx',
  'src/shared/components/common/UserFinancialsModal.jsx',
  'src/shared/components/layout/Sidebar.jsx'
];

const rootDir = 'c:/Users/USER/Desktop/mine/scms/scms-client';

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove FaNairaSign from react-icons/fi
  content = content.replace(/import {([^}]*FaNairaSign[^}]*)} from ["']react-icons\/fi["']/g, (match, p1) => {
      let cleaned = p1.replace(/FaNairaSign,?\s*/g, '').trim();
      if (cleaned.endsWith(',')) cleaned = cleaned.slice(0, -1);
      if (cleaned === '') return ''; // Remove empty import
      return `import { ${cleaned} } from "react-icons/fi"`;
  });

  // 2. Ensure FaNairaSign is imported from react-icons/fa6 exactly once
  // First, remove all existing FaNairaSign from fa6
  content = content.replace(/import {([^}]*FaNairaSign[^}]*)} from ["']react-icons\/fa6["']/g, (match, p1) => {
      let cleaned = p1.replace(/FaNairaSign,?\s*/g, '').trim();
      if (cleaned.endsWith(',')) cleaned = cleaned.slice(0, -1);
      if (cleaned === '') return '';
      return `import { ${cleaned} } from "react-icons/fa6"`;
  });
  // Also handle single line imports like import { FaNairaSign } from "react-icons/fa6";
  content = content.replace(/import { FaNairaSign } from ["']react-icons\/fa6["'];?\s*/g, '');

  // 3. Add it back once at the top
  content = `import { FaNairaSign } from "react-icons/fa6";\n` + content;

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
});
