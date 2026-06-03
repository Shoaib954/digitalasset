const express = require('express');
const Asset = require('../models/Asset');
const Beneficiary = require('../models/Beneficiary');
const Document = require('../models/Document');
const Will = require('../models/Will');
const InheritancePlan = require('../models/InheritancePlan');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// POST /api/ai/advisor — Estate analysis with mock AI advice
router.post('/advisor', async (req, res) => {
  try {
    const userId = req.user._id;

    // Gather user's data for analysis
    const assets = await Asset.find({ userId });
    const beneficiaries = await Beneficiary.find({ userId });
    const documents = await Document.find({ userId });
    const will = await Will.findOne({ userId }).sort({ version: -1 });
    const plans = await InheritancePlan.find({ userId });

    const totalValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);
    const categories = [...new Set(assets.map((a) => a.category))];
    const hasWill = !!will;
    const hasActivePlan = plans.some((p) => p.status === 'active');
    const unassignedAssets = assets.filter((a) => !a.beneficiaries || a.beneficiaries.length === 0);

    // Generate specific recommendations based on user's data
    const recommendations = [];

    // Asset recommendations
    if (assets.length === 0) {
      recommendations.push({
        priority: 'high',
        category: 'assets',
        title: 'Add Your Digital Assets',
        description: 'Start by documenting your digital assets — bank accounts, crypto wallets, email accounts, and more. This is the foundation of your estate plan.',
      });
    } else if (unassignedAssets.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'assets',
        title: `Assign Beneficiaries to ${unassignedAssets.length} Asset(s)`,
        description: `You have ${unassignedAssets.length} asset(s) without assigned beneficiaries: ${unassignedAssets.slice(0, 3).map((a) => a.name).join(', ')}. Assign beneficiaries to ensure proper inheritance.`,
      });
    }

    if (!categories.includes('crypto') && totalValue > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'assets',
        title: 'Consider Documenting Crypto Assets',
        description: 'If you hold any cryptocurrency, make sure to document wallet addresses and recovery phrases securely within DigiAsset.',
      });
    }

    // Beneficiary recommendations
    if (beneficiaries.length === 0) {
      recommendations.push({
        priority: 'high',
        category: 'beneficiaries',
        title: 'Add Beneficiaries',
        description: 'You haven\'t added any beneficiaries yet. Add family members, friends, or organizations who should inherit your digital assets.',
      });
    } else {
      const unverified = beneficiaries.filter((b) => !b.verified);
      if (unverified.length > 0) {
        recommendations.push({
          priority: 'medium',
          category: 'beneficiaries',
          title: `Verify ${unverified.length} Beneficiary(ies)`,
          description: 'Some beneficiaries are unverified. Verify their identity to strengthen your estate plan.',
        });
      }
    }

    // Document recommendations
    if (documents.length === 0) {
      recommendations.push({
        priority: 'medium',
        category: 'documents',
        title: 'Upload Important Documents',
        description: 'Upload your will, passport, property deeds, insurance policies, and other critical documents for safekeeping.',
      });
    } else {
      const hasIdentity = documents.some((d) => d.category === 'identity' || d.category === 'passport');
      if (!hasIdentity) {
        recommendations.push({
          priority: 'low',
          category: 'documents',
          title: 'Add Identity Documents',
          description: 'Consider uploading identity documents (passport, ID) for verification purposes.',
        });
      }
    }

    // Will recommendations
    if (!hasWill) {
      recommendations.push({
        priority: 'high',
        category: 'will',
        title: 'Create Your Digital Will',
        description: 'A digital will ensures your wishes are clearly documented. Use our will builder to create one now.',
      });
    } else if (will.status === 'draft') {
      recommendations.push({
        priority: 'medium',
        category: 'will',
        title: 'Finalize Your Will',
        description: 'Your will is still in draft status. Review and finalize it to make it official.',
      });
    }

    // Inheritance plan recommendations
    if (!hasActivePlan) {
      recommendations.push({
        priority: 'high',
        category: 'inheritance',
        title: 'Set Up an Inheritance Plan',
        description: 'Create an inheritance plan to define how and when your assets should be transferred to beneficiaries.',
      });
    }

    // General advice
    if (totalValue > 100000) {
      recommendations.push({
        priority: 'medium',
        category: 'general',
        title: 'Consider Professional Legal Review',
        description: `Your estate is valued at $${totalValue.toLocaleString()}. Consider having a legal professional review your digital estate plan.`,
      });
    }

    recommendations.push({
      priority: 'low',
      category: 'security',
      title: 'Enable Two-Factor Authentication',
      description: 'Protect your DigiAsset account with MFA for an extra layer of security.',
    });

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    res.json({
      summary: {
        totalAssets: assets.length,
        totalValue,
        totalBeneficiaries: beneficiaries.length,
        totalDocuments: documents.length,
        hasWill,
        hasActivePlan,
        categories,
      },
      recommendations,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI advisor error:', error.message);
    res.status(500).json({ message: 'Error generating advice', error: error.message });
  }
});

// POST /api/ai/chat — Chat endpoint with intelligent mock responses
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const lowerMessage = message.toLowerCase();
    let response = '';

    // Keyword-based intelligent responses for estate planning questions
    if (lowerMessage.includes('will') && (lowerMessage.includes('create') || lowerMessage.includes('make') || lowerMessage.includes('write'))) {
      response = 'To create a digital will in DigiAsset:\n\n1. Go to the **Will Builder** section\n2. Fill in your personal information\n3. Add executor details — someone you trust to carry out your wishes\n4. Specify asset distribution — assign percentages to your beneficiaries\n5. Add any special instructions or conditions\n6. Review and finalize your will\n\nRemember, a digital will should complement (not replace) a traditional legal will. Consider consulting with a lawyer for complex estates.';
    } else if (lowerMessage.includes('beneficiar')) {
      response = 'Beneficiaries are the people or organizations who will inherit your digital assets. Here\'s how to manage them:\n\n• **Add beneficiaries** with their full name, email, and relationship to you\n• **Verify their identity** by uploading identity documents\n• **Assign allocation percentages** to determine how assets are divided\n• You can assign different beneficiaries to different assets\n\nTip: Regularly review and update your beneficiary list, especially after major life events like marriage, divorce, or the birth of a child.';
    } else if (lowerMessage.includes('dead man') || lowerMessage.includes('deadman') || lowerMessage.includes('switch')) {
      response = 'The **Dead Man\'s Switch** is a safety mechanism that activates your inheritance plan if you become unresponsive:\n\n1. **Set an interval** (e.g., 90 days) — you must check in within this period\n2. **Add emergency contacts** who will be notified if you miss check-ins\n3. **Link an inheritance plan** that will trigger automatically\n4. If you miss too many check-ins, the system assumes something has happened and initiates your plan\n\n⚠️ Make sure to check in regularly to prevent false triggers!';
    } else if (lowerMessage.includes('crypto') || lowerMessage.includes('bitcoin') || lowerMessage.includes('ethereum') || lowerMessage.includes('wallet')) {
      response = 'Managing crypto assets in your estate is crucial:\n\n• **Document all wallets** — record wallet addresses and types (hardware, software, exchange)\n• **Secure recovery phrases** — store seed phrases securely using our encrypted vault\n• **Never share private keys** in plain text — DigiAsset encrypts all sensitive data\n• **Include exchange accounts** — document login credentials for Coinbase, Binance, etc.\n• **Consider a crypto-specific executor** — someone who understands blockchain technology\n\n💡 Pro tip: Without proper documentation, crypto assets can be permanently lost after death.';
    } else if (lowerMessage.includes('encrypt') || lowerMessage.includes('security') || lowerMessage.includes('secure') || lowerMessage.includes('safe')) {
      response = 'DigiAsset uses multiple layers of security to protect your data:\n\n🔒 **AES-256 Encryption** for all sensitive credentials and account details\n🔑 **JWT Authentication** with secure token management\n📄 **Document Encryption** — your uploaded files can be encrypted at rest\n🛡️ **Two-Factor Authentication** available for account access\n\nBest practices:\n• Use strong, unique passwords\n• Enable MFA on your account\n• Regularly update your credentials\n• Only share access with trusted executors';
    } else if (lowerMessage.includes('inheritance') || lowerMessage.includes('plan') || lowerMessage.includes('estate')) {
      response = 'An inheritance plan in DigiAsset defines how your digital assets will be transferred:\n\n1. **Create a plan** — name it and add a description\n2. **Choose a trigger** — death, incapacity, specific date, or dead man\'s switch\n3. **Assign beneficiaries and assets** — specify who gets what\n4. **Set verification requirements** — death certificate, court order, etc.\n5. **Define transfer stages** — step-by-step process for asset transfer\n\nYou can have multiple plans for different scenarios. Remember to review your plans annually or after major life changes.';
    } else if (lowerMessage.includes('document') || lowerMessage.includes('upload') || lowerMessage.includes('file')) {
      response = 'The Document Vault lets you securely store important files:\n\n📁 **Supported categories**: Will, Passport, Property, Tax, Insurance, Legal, Identity, Financial\n📤 **Upload formats**: Images, PDFs, Word docs, spreadsheets, audio, and video\n📏 **Max file size**: 50MB per file\n🔐 **Encryption**: Optional encryption for sensitive documents\n\nRecommended documents to upload:\n• Legal will and testament\n• Passport and government ID\n• Property deeds and titles\n• Insurance policies\n• Tax returns\n• Power of attorney documents';
    } else if (lowerMessage.includes('get started') || lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('new') || lowerMessage.includes('help')) {
      response = 'Welcome to DigiAsset! Here\'s how to get started:\n\n1️⃣ **Add your digital assets** — bank accounts, crypto, email, social media, etc.\n2️⃣ **Add beneficiaries** — the people who should inherit your assets\n3️⃣ **Upload documents** — wills, IDs, legal papers for safekeeping\n4️⃣ **Create your digital will** — specify how assets should be distributed\n5️⃣ **Set up an inheritance plan** — define triggers and verification steps\n6️⃣ **Configure the Dead Man\'s Switch** — automatic safety mechanism\n\nNeed help with any specific step? Just ask!';
    } else if (lowerMessage.includes('value') || lowerMessage.includes('worth') || lowerMessage.includes('total')) {
      response = 'To get a clear picture of your digital estate value:\n\n• Go to the **Dashboard** to see your total portfolio value\n• View **asset breakdown by category** in the analytics section\n• Each asset can have its value set in any currency\n• The system aggregates all values to show your total estate worth\n\n💡 Tip: Regularly update asset values, especially for volatile assets like cryptocurrency. Accurate valuations help beneficiaries and executors understand the full scope of your estate.';
    } else {
      response = 'I\'m your DigiAsset estate planning assistant! I can help you with:\n\n• **Creating a will** — guidance on digital will creation\n• **Managing beneficiaries** — adding and organizing your heirs\n• **Crypto estate planning** — securing digital currencies\n• **Inheritance plans** — setting up transfer plans\n• **Dead Man\'s Switch** — automatic safety mechanisms\n• **Document management** — uploading and securing files\n• **Security best practices** — protecting your digital estate\n\nTry asking me something like "How do I create a will?" or "How does the dead man\'s switch work?"';
    }

    res.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI chat error:', error.message);
    res.status(500).json({ message: 'Error processing chat', error: error.message });
  }
});

// GET /api/ai/readiness-score — Calculate inheritance readiness score
router.get('/readiness-score', async (req, res) => {
  try {
    const userId = req.user._id;

    // Gather all user data
    const assets = await Asset.find({ userId });
    const beneficiaries = await Beneficiary.find({ userId });
    const documents = await Document.find({ userId });
    const will = await Will.findOne({ userId }).sort({ version: -1 });
    const plans = await InheritancePlan.find({ userId });

    let totalScore = 0;
    const breakdown = [];

    // 1. Assets documented (0-25 points)
    let assetScore = 0;
    if (assets.length >= 10) {
      assetScore = 25;
    } else if (assets.length >= 5) {
      assetScore = 20;
    } else if (assets.length >= 3) {
      assetScore = 15;
    } else if (assets.length >= 1) {
      assetScore = 10;
    }
    // Bonus: assets with beneficiaries assigned
    const assignedAssets = assets.filter((a) => a.beneficiaries && a.beneficiaries.length > 0);
    if (assets.length > 0 && assignedAssets.length === assets.length) {
      assetScore = 25; // All assets have beneficiaries = max score
    }
    totalScore += assetScore;
    breakdown.push({
      category: 'Assets Documented',
      score: assetScore,
      maxScore: 25,
      status: assetScore >= 20 ? 'excellent' : assetScore >= 10 ? 'good' : 'needs_work',
      details: `${assets.length} asset(s) documented, ${assignedAssets.length} with beneficiaries assigned`,
    });

    // 2. Beneficiaries assigned (0-25 points)
    let beneficiaryScore = 0;
    if (beneficiaries.length >= 5) {
      beneficiaryScore = 20;
    } else if (beneficiaries.length >= 3) {
      beneficiaryScore = 15;
    } else if (beneficiaries.length >= 1) {
      beneficiaryScore = 10;
    }
    // Bonus for verified beneficiaries
    const verifiedBeneficiaries = beneficiaries.filter((b) => b.verified);
    if (beneficiaries.length > 0 && verifiedBeneficiaries.length === beneficiaries.length) {
      beneficiaryScore = Math.min(25, beneficiaryScore + 5);
    }
    totalScore += beneficiaryScore;
    breakdown.push({
      category: 'Beneficiaries Assigned',
      score: beneficiaryScore,
      maxScore: 25,
      status: beneficiaryScore >= 20 ? 'excellent' : beneficiaryScore >= 10 ? 'good' : 'needs_work',
      details: `${beneficiaries.length} beneficiary(ies), ${verifiedBeneficiaries.length} verified`,
    });

    // 3. Documents uploaded (0-20 points)
    let documentScore = 0;
    if (documents.length >= 10) {
      documentScore = 20;
    } else if (documents.length >= 5) {
      documentScore = 15;
    } else if (documents.length >= 2) {
      documentScore = 10;
    } else if (documents.length >= 1) {
      documentScore = 5;
    }
    totalScore += documentScore;
    breakdown.push({
      category: 'Documents Uploaded',
      score: documentScore,
      maxScore: 20,
      status: documentScore >= 15 ? 'excellent' : documentScore >= 10 ? 'good' : 'needs_work',
      details: `${documents.length} document(s) stored securely`,
    });

    // 4. Will created (0-15 points)
    let willScore = 0;
    if (will) {
      if (will.status === 'notarized') {
        willScore = 15;
      } else if (will.status === 'finalized') {
        willScore = 12;
      } else if (will.status === 'draft') {
        willScore = 7;
      }
    }
    totalScore += willScore;
    breakdown.push({
      category: 'Will Created',
      score: willScore,
      maxScore: 15,
      status: willScore >= 12 ? 'excellent' : willScore >= 7 ? 'good' : 'needs_work',
      details: will ? `Will status: ${will.status} (v${will.version})` : 'No will created yet',
    });

    // 5. Inheritance plan active (0-15 points)
    let planScore = 0;
    const activePlans = plans.filter((p) => p.status === 'active');
    if (activePlans.length > 0) {
      planScore = 10;
      // Bonus: plan has beneficiaries and verification requirements
      const detailedPlan = activePlans.find((p) => p.beneficiaries && p.beneficiaries.length > 0);
      if (detailedPlan) {
        planScore = 15;
      }
    } else if (plans.length > 0) {
      planScore = 5; // Has plans but none active
    }
    totalScore += planScore;
    breakdown.push({
      category: 'Inheritance Plan Active',
      score: planScore,
      maxScore: 15,
      status: planScore >= 12 ? 'excellent' : planScore >= 5 ? 'good' : 'needs_work',
      details: `${activePlans.length} active plan(s) out of ${plans.length} total`,
    });

    // Determine overall status
    let overallStatus = 'critical';
    if (totalScore >= 80) overallStatus = 'excellent';
    else if (totalScore >= 60) overallStatus = 'good';
    else if (totalScore >= 40) overallStatus = 'fair';
    else if (totalScore >= 20) overallStatus = 'needs_work';

    res.json({
      score: totalScore,
      maxScore: 100,
      percentage: totalScore,
      status: overallStatus,
      breakdown,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Readiness score error:', error.message);
    res.status(500).json({ message: 'Error calculating readiness score', error: error.message });
  }
});

module.exports = router;
