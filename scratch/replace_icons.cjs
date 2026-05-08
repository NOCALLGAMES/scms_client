const fs = require('fs');
const path = require('path');

const files = [
  'src/shared/components/layout/Sidebar.jsx',
  'src/shared/components/common/UserFinancialsModal.jsx',
  'src/shared/components/common/CommandPalette.jsx',
  'src/features/superadmin/pages/SuperAdminDashboard.jsx',
  'src/features/superadmin/pages/InstitutionDetail.jsx',
  'src/features/savings/pages/WithdrawalRequest.jsx',
  'src/features/savings/pages/SavingsProducts.jsx',
  'src/features/savings/components/SubscribeModal.jsx',
  'src/features/savings/components/BuySharesModal.jsx',
  'src/features/loans/pages/LoanReview.jsx',
  'src/features/loans/pages/LoanRepaymentLedger.jsx',
  'src/features/auth/pages/Onboarding.jsx',
  'src/features/accounts/pages/FundAccount.jsx',
  'src/features/admin/pages/InstitutionTreasury.jsx',
  'src/features/admin/pages/ShareManagement.jsx',
  'src/features/admin/pages/WithdrawalQueue.jsx',
  'src/features/admin/pages/LoanDisbursement.jsx',
  'src/features/admin/pages/InstitutionProfile.jsx',
  'src/features/admin/pages/AdminSettings.jsx'
];

const rootDir = 'c:/Users/USER/Desktop/mine/scms/scms-client';

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace usage
  content = content.replace(/<FiDollarSign/g, '<FaNairaSign');
  content = content.replace(/FiDollarSign/g, 'FaNairaSign');

  // Handle imports
  if (content.includes('FaNairaSign') && !content.includes('react-icons/fa6')) {
    // If it's already importing from fi, add fa6 import
    if (content.includes('react-icons/fi')) {
        content = "import { FaNairaSign } from \"react-icons/fa6\";\n" + content;
    }
  } else if (content.includes('FaNairaSign') && content.includes('react-icons/fa6')) {
      // Ensure FaNairaSign is in the list
      if (!content.includes('FaNairaSign') || !content.match(/import {[^}]*FaNairaSign[^}]*} from ["']react-icons\/fa6["']/)) {
          content = content.replace(/import {([^}]*)} from ["']react-icons\/fa6["']/, (match, p1) => {
              if (p1.includes('FaNairaSign')) return match;
              return `import { ${p1.trim()}, FaNairaSign } from "react-icons/fa6"`;
          });
      }
  }

  // Clean up FiDollarSign from imports
  content = content.replace(/FiDollarSign,\s*/g, '');
  content = content.replace(/,\s*FiDollarSign/g, '');
  content = content.replace(/{\s*FiDollarSign\s*}/g, '{}'); // Should clean up empty imports later if needed

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
