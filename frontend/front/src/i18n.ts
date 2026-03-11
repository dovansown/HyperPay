import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      common: {
        signIn: 'Sign in',
        startNow: 'Start now',
        contactSales: 'Contact sales',
        createAccount: 'Create account',
        dashboard: 'Dashboard',
      },
      auth: {
        email: 'Email address',
        emailPlaceholder: 'name@company.com',
        password: 'Password',
        login: {
          title: 'Sign in to your account',
          subtitle: 'Welcome back. Please enter your details to continue.',
          remember: 'Remember me',
          forgot: 'Forgot password?',
          loading: 'Signing in...',
          noAccount: "Don't have an account?",
        },
        register: {
          title: 'Create your account',
          subtitle: 'Join thousands of businesses processing payments with HyperPay.',
          fullName: 'Full name',
          fullNamePlaceholder: 'Jane Doe',
          org: 'Organization name',
          orgPlaceholder: 'Acme Corp',
          terms: 'I agree to the Terms of Service and Privacy Policy.',
          submit: 'Create account',
          loading: 'Creating account...',
          haveAccount: 'Already have an account?',
        },
        forgot: {
          title: 'Forgot password?',
          subtitle:
            "Enter the email address associated with your account and we'll send you a link to reset your password.",
          submit: 'Send reset link',
          loading: 'Sending...',
          success: 'Reset link has been sent to your email.',
          back: 'Back to sign in',
          privacy: 'Privacy',
          terms: 'Terms',
        },
        backHome: 'Back to homepage',
      },
      nav: {
        products: 'Products',
        solutions: 'Solutions',
        developers: 'Developers',
        pricing: 'Pricing',
      },
      app: {
        nav: {
          dashboard: 'Dashboard',
          payments: 'Payments',
          customers: 'Customers',
          reports: 'Reports',
          settings: 'Settings',
          banking: 'Banking',
          billing: 'Billing',
          webhooks: 'Webhooks',
        },
        user: {
          signedInAs: 'Signed in as',
          profile: 'Profile',
          logout: 'Sign out',
        },
      },
      landing: {
        heroBadge: 'New: HyperPay Components 2.0',
        heroTitle: 'The infrastructure for global commerce',
        heroDescription:
          'Millions of companies of all sizes—from startups to Fortune 500s—use HyperPay’s software and APIs to accept payments, send payouts, and manage their businesses online.',
        heroPrimaryCta: 'Start now',
        heroSecondaryCta: 'Contact sales',
        suiteLabel: 'The Suite',
        suiteTitle: 'A fully integrated suite of financial products',
        dashboardTitle: 'Your unified business command center',
        dashboardDescription:
          'Track your performance across every channel and region. HyperPay Dashboard gives you real-time visibility into your financial ecosystem, all in one place.',
        globalReachLabel: 'Global Reach',
        globalReachTitle: 'Scale faster with localized commerce',
        globalReachDescription:
          'Connect with customers in their preferred language and currency, with support for local payment methods in over 45 countries.',
        developersLabel: 'Developers first',
        developersTitle: 'Global Statistics',
        developersDescription:
          'We believe that developers should spend more time building great products and less time building payment systems. Our tools are built to integrate seamlessly into your existing stack.',
        developersCtaDocs: 'Read the docs',
        developersCtaApi: 'Explore API Reference',
        businessTitle: 'Optimized for every business model',
        securityLabel: 'Security first',
        securityTitle: 'Enterprise-grade security by default',
        securityDescription:
          "We use best-in-class security practices to ensure your data and your customers' data is always safe. We're certified to PCI Service Provider Level 1.",
        suite: {
          payments:
            'Accept payments and move money globally with our powerful APIs and checkout solutions.',
          subscriptions:
            'Manage subscriptions, recurring billing, and invoicing at any scale for your SaaS business.',
          banking:
            'Build financial features like cards and lending into your product with zero overhead.',
        },
        dashboardGrossVolume: 'Gross Volume',
        dashboardNetEarnings: 'Net earnings',
        dashboardTotalFees: 'Total fees',
        dashboardFeature1: 'Real-time transaction monitoring',
        dashboardFeature2: 'Advanced filtering and custom reports',
        dashboardFeature3: 'Multi-user access with granular permissions',
        globalStats: {
          c1: 'Currencies supported',
          c2: 'Countries with local acquiring',
          c3: 'Historical uptime',
          c4: 'API requests per day',
        },
        businessCards: {
          ecommerce: {
            title: 'E-commerce',
            description:
              'Convert more customers with a checkout built for speed and global scale.',
          },
          saas: {
            title: 'SaaS',
            description:
              'Automate recurring billing and manage full lifecycle of your customer base.',
          },
          platforms: {
            title: 'Platforms',
            description:
              'Multi-party payments for SaaS platforms and multi-sided marketplaces.',
          },
          marketplaces: {
            title: 'Marketplaces',
            description:
              'Onboard sellers globally and manage complex payout flows with ease.',
          },
        },
        securityBadges: {
          pci: 'PCI-DSS Compliant',
          encryption: '256-bit Encryption',
          fraud: 'Fraud Protection',
          twofa: '2FA Support',
        },
        testimonialQuote:
          '“HyperPay allowed us to scale our international operations in months, not years. Their documentation is world-class and the platform is incredibly reliable.”',
        testimonialName: 'Elena Rodriguez',
        testimonialRole: 'CTO at GlobalTech Solutions',
        features: {
          reporting: {
            title: 'Financial Reporting',
            description: 'Automate your accounting with custom exports and real-time data syncing.',
          },
          payouts: {
            title: 'Fast Payouts',
            description:
              'Get paid in as little as two business days with our accelerated payout schedule.',
          },
          fraud: {
            title: 'Fraud Detection',
            description:
              'Identify and prevent fraud before it happens with machine learning-powered Radar.',
          },
          api: {
            title: 'Rich API',
            description:
              'Build anything you can imagine with our clean, well-documented, and powerful REST API.',
          },
        },
        toolsTitle: 'Works with the tools you already use',
        banksLabel: 'Our Network',
        banksTitle: "Partnering with the world's leading banks",
        products: {
          payments: {
            title: 'Payments',
            desc: 'Online and in-person payments',
          },
          billing: {
            title: 'Billing',
            desc: 'Subscription management',
          },
          treasury: {
            title: 'Treasury',
            desc: 'Banking-as-a-Service',
          },
          radar: {
            title: 'Radar',
            desc: 'Fraud and risk management',
          },
        },
        resourcesLabel: 'Resources',
        resourcesTitle: 'From the Blog',
        blogViewAll: 'View all posts',
        blogReadMore: 'Read more',
        blog: {
          engineering: {
            category: 'Engineering',
            title: 'Optimizing checkout for mobile commerce',
            excerpt:
              'Learn how we improved mobile conversion rates by 15% through streamlined UI components.',
          },
          product: {
            category: 'Product',
            title: 'Expanding into Southeast Asia: A Guide',
            excerpt:
              "The payment landscape in SEA is evolving. Here's what you need to know about local methods.",
          },
          strategy: {
            category: 'Strategy',
            title: '2024 Global Payments Report',
            excerpt:
              'Discover the latest trends in cross-border commerce and digital wallet adoption rates.',
          },
        },
        pricingPaygTitle: 'Pay-as-you-go',
        pricingPaygSubtitle: 'Best for startups and growing businesses.',
        pricingPayg: {
          b1: 'No monthly fees or hidden costs',
          b2: 'Access to entire product suite',
          b3: 'Basic reporting and support',
        },
        pricingEnterpriseTitle: 'Enterprise',
        pricingEnterpriseSubtitle: 'For companies with large payment volume.',
        pricingEnterprise: {
          b1: 'Volume-based pricing discounts',
          b2: '24/7 dedicated support team',
          b3: 'Custom platform integrations',
        },
        ctaTitle: 'Ready to get started?',
        ctaDescription:
          'Join millions of companies that use HyperPay to build better financial experiences. Explore the platform today.',
        footerCopyright: '© 2024 HyperPay, Inc. All rights reserved.',
        footerPrivacy: 'Privacy Policy',
        footerCookie: 'Cookie Settings',
        footerTerms: 'Terms of Service',
        footer: {
          products: {
            title: 'Products',
            payments: 'Payments',
            billing: 'Billing',
            connect: 'Connect',
            terminal: 'Terminal',
            issuing: 'Issuing',
          },
          solutions: {
            title: 'Solutions',
            ecommerce: 'E-commerce',
            saas: 'SaaS',
            marketplaces: 'Marketplaces',
            embeddedFinance: 'Embedded Finance',
            crypto: 'Crypto',
          },
          resources: {
            title: 'Resources',
            docs: 'Documentation',
            api: 'API Reference',
            guides: 'Guides',
            caseStudies: 'Case Studies',
            support: 'Support',
          },
          company: {
            title: 'Company',
            about: 'About',
            careers: 'Careers',
            newsroom: 'Newsroom',
            security: 'Security',
            privacy: 'Privacy',
          },
        },
        langEn: 'English',
        langVi: 'Tiếng Việt',
      },
      errors: {
        notFound: {
          badge: 'Error 404',
          title: 'Page not found',
          description:
            "The page you are looking for doesn't exist or has been moved. Try searching or use the quick links below.",
          searchPlaceholder: 'Search HyperPay help, docs, and more...',
          links: {
            dashboard: {
              title: 'Dashboard',
              description: 'Manage your payments and transactions',
            },
            docs: {
              title: 'Documentation',
              description: 'Explore API reference and developer guides',
            },
            support: {
              title: 'Support',
              description: 'Get expert help from our support team',
            },
          },
          footer: {
            contact: 'Contact us',
            privacy: 'Privacy Policy',
            status: 'Status',
            copyright: '© 2024 HyperPay. All rights reserved.',
          },
        },
      },
      dashboard: {
        title: 'Dashboard Overview',
        subtitle: 'Monitor balances, revenue, and transactions across your HyperPay account.',
        cards: {
          totalBalance: 'Total Balance',
          totalBalanceValue: '$128,430.00',
          totalBalanceTrend: '+12.5% this month',
          todayRevenue: 'Today Revenue',
          todayRevenueValue: '$4,250.50',
          todayRevenueTrend: '+8.2% from yesterday',
          accounts: 'Linked Accounts',
          accountsSubtitle: 'Bank accounts connected to HyperPay',
          plans: 'Active Plans',
          plansSubtitle: 'Subscription plans configured',
        },
        chart: {
          title: 'Revenue over time',
          subtitle: 'Monitor your earnings daily across all channels',
          days: 'Days',
        },
        table: {
          title: 'Latest Transactions',
          viewAll: 'View all',
          columns: {
            id: 'Transaction ID',
            date: 'Date',
            status: 'Status',
            amount: 'Amount',
          },
          unknownId: '#Unknown',
          unknownStatus: 'Unknown',
          empty: 'No transactions found yet. Start processing payments to see them here.',
        },
      },
      banks: {
        breadcrumb: {
          root: 'Settings',
          current: 'Bank accounts',
        },
        title: 'Bank accounts',
        subtitle:
          'Add and manage the bank accounts used to receive payouts and pay for HyperPay services.',
        actions: {
          add: 'Add bank account',
        },
        tabs: {
          active: 'Active accounts',
        },
        table: {
          columns: {
            bankName: 'Bank name',
            accountNumber: 'Account number',
            holder: 'Account holder',
            actions: 'Actions',
          },
          loading: 'Loading bank accounts...',
          empty:
            'No bank accounts added yet. Click “Add bank account” to link your first account.',
        },
        info: {
          verifyTitle: 'Verify new accounts instantly',
          verifyDescription:
            'Connect your bank via Plaid for instant verification without micro-deposits.',
          learnMore: 'Learn more →',
          payoutsTitle: 'About payouts',
          payoutsDescription:
            'HyperPay sends payouts to your active bank accounts on a rolling 2-day schedule. You can manage your payout schedule in Payout Settings.',
          securityTitle: 'Security & Compliance',
          securityDescription:
            "All bank data is encrypted and stored according to PCI-DSS standards. We never store your full bank account numbers on our servers.",
        },
        add: {
          title: 'Add bank account',
          subtitle: 'Securely link your bank to HyperPay',
          searchPlaceholder: 'Search for your bank...',
          accountHolder: 'Account holder',
          accountHolderPlaceholder: 'Enter account holder name',
          accountNumber: 'Account number',
          accountNumberPlaceholder: 'Enter account number',
          cancel: 'Cancel',
          submit: 'Continue to link',
          loading: 'Linking...',
        },
      },
      webhook: {
        breadcrumb: {
          root: 'Developers',
          current: 'Webhooks',
        },
        title: 'Webhooks',
        subtitle:
          'Receive real-time notifications from HyperPay when events happen in your account.',
        learnMore: 'Learn more about webhooks',
        actions: {
          test: 'Test event',
        },
        tabs: {
          settings: 'Endpoint',
        },
        form: {
          title: 'Active endpoint',
          urlLabel: 'Endpoint URL',
          urlPlaceholder: 'https://your-system.com/webhooks/hyperpay',
          secretLabel: 'Signing secret',
          secretPlaceholder: 'whsec_...',
          secretHint:
            'Use this secret to verify that webhook events are sent from HyperPay.',
          activeToggle: 'Enable this endpoint',
          status: {
            enabled: 'Enabled',
            disabled: 'Disabled',
          },
          save: 'Save changes',
          saving: 'Saving...',
          reset: 'Reset',
          saved: 'Webhook configuration saved successfully.',
        },
        info: {
          verifyTitle: 'Verify signatures',
          verifyDescription:
            'Use HyperPay libraries to verify that events are coming from us. Secure your integration with a signing secret.',
          viewSecret: 'View signing secret',
          localTitle: 'Local testing',
          localDescription:
            'Test your webhooks locally with our CLI tool. Forward events directly to your local server.',
          installCli: 'Install CLI',
        },
        billing: {
          title: 'Billing Settings',
          subtitle: 'Manage your subscription, view invoices, and update payment details.',
          plan: {
            activeBadge: 'ACTIVE',
            name: 'Pro Plan',
            price: '$49.00 billed monthly',
            change: 'Change plan',
            nextRenewal: 'Your next renewal date is October 24, 2023.',
            manageAutoRenew: 'Manage auto-renew',
          },
          payment: {
            title: 'Payment Method',
            add: 'Add New',
            cardLabel: 'Visa ending in 4242',
            cardMeta: 'Expires 12/26 • Default',
          },
          invoice: {
            title: 'Upcoming Invoice',
            dateLabel: 'Date',
            dateValue: 'Oct 24, 2023',
            lineLabel: 'Pro Subscription',
            taxLabel: 'Tax (0%)',
            totalLabel: 'Total Amount',
          },
          help: {
            title: 'Need help?',
            description:
              'Have questions about your billing or want to cancel? Contact our support team.',
            contact: 'Contact Support',
          },
          history: {
            title: 'Billing History',
            export: 'Export all',
            columns: {
              id: 'Invoice ID',
              date: 'Date',
              amount: 'Amount',
              status: 'Status',
              receipt: 'Receipt',
            },
            status: {
              paid: 'Paid',
              failed: 'Failed',
            },
          },
        },
        verify: {
          title: 'Verify your identity',
          description:
            "We've sent a verification link to your email. Please check your inbox and follow the instructions to continue.",
          primaryCta: 'Open email app',
          resend: "Didn't receive anything? Resend email",
          otherMethod: 'Use another verification method',
          secure: 'Secure Encryption Enabled',
        },
        settings: {
          sidebar: {
            title: 'Settings',
            subtitle: 'Account preferences',
          },
          nav: {
            profile: 'Settings',
            notifications: 'Notification settings',
            security: 'Security',
          },
          profile: {
            title: 'Account settings',
            subtitle: 'Update your personal information and how it appears across HyperPay.',
            sectionMain: 'Profile details',
            sectionMainSubtitle: 'Basic information about your account.',
            fullName: 'Full name',
            fullNamePlaceholder: 'Jane Doe',
            email: 'Email',
            company: 'Company',
            companyPlaceholder: 'Acme Inc.',
            timezone: 'Timezone',
            discard: 'Discard changes',
            save: 'Save changes',
          },
          notifications: {
            title: 'Notification settings',
            subtitle:
              'Manage how and when you receive email updates from HyperPay regarding your account activity.',
            emailTitle: 'Email notifications',
            emailSubtitle: 'Automated updates sent to your primary email address.',
            successTitle: 'Successful payments',
            successDescription: 'Receive an email for every successful payment received.',
            failedTitle: 'Failed payments',
            failedDescription: 'Get notified immediately when a payment attempt fails.',
            disputesTitle: 'Disputes',
            disputesDescription: 'Receive alerts for new disputes and evidence deadlines.',
            payoutsTitle: 'Payouts',
            payoutsDescription: 'Get notified when funds are sent to your bank account.',
            teamTitle: 'New team members',
            teamDescription: 'Receive a confirmation when a new member joins your team.',
            reset: 'Reset defaults',
            save: 'Save changes',
            note:
              'Critical security updates and billing alerts will always be sent to your primary email address regardless of these settings.',
          },
          security: {
            title: 'Security settings',
            subtitle:
              'Manage security preferences and how access is protected across your account.',
            sessionsTitle: 'Sign-in & sessions',
            sessionsSubtitle: 'View active sessions and sign out from other devices.',
            signOutAll: 'Sign out of all devices',
            sessionsDevice: 'Device',
            sessionsLocation: 'Location',
            sessionsLastActive: 'Last active',
            sessionsActions: 'Actions',
            currentSession: 'Current session',
            signOut: 'Sign out',
            mfaTitle: 'Two-factor authentication',
            mfaDescription:
              'Add an extra layer of security to your account by requiring a code in addition to your password.',
            mfaStatus: 'Authenticator app',
            mfaStatusOff: 'Not configured',
            mfaSetup: 'Set up',
          },
        },
      },
    },
  },
  vi: {
    translation: {
      common: {
        signIn: 'Đăng nhập',
        startNow: 'Bắt đầu ngay',
        contactSales: 'Liên hệ sales',
        createAccount: 'Tạo tài khoản',
        dashboard: 'Bảng điều khiển',
      },
      auth: {
        email: 'Email',
        emailPlaceholder: 'name@company.com',
        password: 'Mật khẩu',
        login: {
          title: 'Đăng nhập tài khoản',
          subtitle: 'Chào mừng quay lại. Nhập thông tin để tiếp tục.',
          remember: 'Ghi nhớ đăng nhập',
          forgot: 'Quên mật khẩu?',
          loading: 'Đang đăng nhập...',
          noAccount: 'Chưa có tài khoản?',
        },
        register: {
          title: 'Tạo tài khoản mới',
          subtitle: 'Tham gia cùng hàng nghìn doanh nghiệp đang xử lý thanh toán với HyperPay.',
          fullName: 'Họ tên',
          fullNamePlaceholder: 'Nguyễn Văn A',
          org: 'Tên tổ chức',
          orgPlaceholder: 'Công ty ABC',
          terms: 'Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.',
          submit: 'Tạo tài khoản',
          loading: 'Đang tạo tài khoản...',
          haveAccount: 'Đã có tài khoản?',
        },
        forgot: {
          title: 'Quên mật khẩu?',
          subtitle:
            'Nhập email gắn với tài khoản, chúng tôi sẽ gửi cho bạn liên kết đặt lại mật khẩu.',
          submit: 'Gửi liên kết đặt lại',
          loading: 'Đang gửi...',
          success: 'Đã gửi liên kết đặt lại mật khẩu tới email của bạn.',
          back: 'Quay lại đăng nhập',
          privacy: 'Bảo mật',
          terms: 'Điều khoản',
        },
        backHome: 'Về trang chủ',
      },
      nav: {
        products: 'Sản phẩm',
        solutions: 'Giải pháp',
        developers: 'Developers',
        pricing: 'Bảng giá',
      },
      app: {
        nav: {
          dashboard: 'Bảng điều khiển',
          payments: 'Thanh toán',
          customers: 'Khách hàng',
          reports: 'Báo cáo',
          settings: 'Cài đặt',
          banking: 'Ngân hàng',
          billing: 'Thanh toán',
          webhooks: 'Webhook',
        },
        user: {
          signedInAs: 'Đăng nhập dưới tài khoản',
          profile: 'Thông tin cá nhân',
          logout: 'Đăng xuất',
        },
      },
      billing: {
        title: 'Cài đặt thanh toán',
        subtitle: 'Quản lý gói đăng ký, xem hóa đơn và cập nhật phương thức thanh toán.',
        plan: {
          activeBadge: 'ĐANG HOẠT ĐỘNG',
          name: 'Gói Pro',
          price: '$49.00 thanh toán hàng tháng',
          change: 'Thay đổi gói',
          nextRenewal: 'Ngày gia hạn tiếp theo là 24 tháng 10, 2023.',
          manageAutoRenew: 'Quản lý gia hạn tự động',
        },
        payment: {
          title: 'Phương thức thanh toán',
          add: 'Thêm mới',
          cardLabel: 'Visa kết thúc bằng 4242',
          cardMeta: 'Hết hạn 12/26 • Mặc định',
        },
        invoice: {
          title: 'Hóa đơn sắp tới',
          dateLabel: 'Ngày',
          dateValue: '24 Tháng 10, 2023',
          lineLabel: 'Gói Pro',
          taxLabel: 'Thuế (0%)',
          totalLabel: 'Tổng tiền',
        },
        help: {
          title: 'Cần hỗ trợ?',
          description:
            'Bạn có câu hỏi về thanh toán hoặc muốn hủy? Hãy liên hệ đội ngũ hỗ trợ của chúng tôi.',
          contact: 'Liên hệ hỗ trợ',
        },
        history: {
          title: 'Lịch sử thanh toán',
          export: 'Xuất tất cả',
          columns: {
            id: 'Mã hóa đơn',
            date: 'Ngày',
            amount: 'Số tiền',
            status: 'Trạng thái',
            receipt: 'Biên lai',
          },
          status: {
            paid: 'Đã thanh toán',
            failed: 'Thất bại',
          },
        },
      },
      verify: {
        title: 'Xác minh danh tính',
        description:
          'Chúng tôi đã gửi một email xác minh tới hộp thư của bạn. Vui lòng kiểm tra email và làm theo hướng dẫn để tiếp tục.',
        primaryCta: 'Mở ứng dụng email',
        resend: 'Không nhận được? Gửi lại email',
        otherMethod: 'Sử dụng phương thức xác minh khác',
        secure: 'Đã bật mã hóa an toàn',
      },
      settings: {
        sidebar: {
          title: 'Cài đặt',
          subtitle: 'Tùy chọn tài khoản',
        },
        nav: {
          profile: 'Cài đặt',
          notifications: 'Cài đặt thông báo',
          security: 'Bảo mật',
        },
        profile: {
          title: 'Cài đặt tài khoản',
          subtitle: 'Cập nhật thông tin cá nhân và cách hiển thị trên HyperPay.',
          sectionMain: 'Thông tin hồ sơ',
          sectionMainSubtitle: 'Thông tin cơ bản về tài khoản của bạn.',
          fullName: 'Họ tên',
          fullNamePlaceholder: 'Nguyễn Văn A',
          email: 'Email',
          company: 'Công ty',
          companyPlaceholder: 'Công ty ABC',
          timezone: 'Múi giờ',
          discard: 'Hủy thay đổi',
          save: 'Lưu thay đổi',
        },
        notifications: {
          title: 'Cài đặt thông báo',
          subtitle:
            'Quản lý cách và thời điểm bạn nhận email cập nhật từ HyperPay liên quan tới hoạt động tài khoản.',
          emailTitle: 'Thông báo qua email',
          emailSubtitle: 'Các cập nhật tự động gửi tới email chính của bạn.',
          successTitle: 'Thanh toán thành công',
          successDescription: 'Nhận email cho mỗi giao dịch thanh toán thành công.',
          failedTitle: 'Thanh toán thất bại',
          failedDescription: 'Được thông báo ngay khi một lần thanh toán bị lỗi.',
          disputesTitle: 'Tranh chấp',
          disputesDescription:
            'Nhận cảnh báo khi có tranh chấp mới và hạn chót cung cấp bằng chứng.',
          payoutsTitle: 'Chi tiền',
          payoutsDescription:
            'Nhận thông báo khi tiền được chuyển tới tài khoản ngân hàng của bạn.',
          teamTitle: 'Thành viên mới',
          teamDescription: 'Nhận xác nhận khi có thành viên mới tham gia nhóm.',
          reset: 'Đặt lại mặc định',
          save: 'Lưu thay đổi',
          note:
            'Các thông báo bảo mật quan trọng và cảnh báo thanh toán luôn được gửi tới email chính của bạn bất kể các cài đặt này.',
        },
        security: {
          title: 'Cài đặt bảo mật',
          subtitle: 'Quản lý tùy chọn bảo mật và cách bảo vệ truy cập vào tài khoản.',
          sessionsTitle: 'Đăng nhập & phiên làm việc',
          sessionsSubtitle: 'Xem các phiên đang hoạt động và đăng xuất khỏi thiết bị khác.',
          signOutAll: 'Đăng xuất khỏi mọi thiết bị',
          sessionsDevice: 'Thiết bị',
          sessionsLocation: 'Vị trí',
          sessionsLastActive: 'Hoạt động lần cuối',
          sessionsActions: 'Thao tác',
          currentSession: 'Phiên hiện tại',
          signOut: 'Đăng xuất',
          mfaTitle: 'Xác thực hai lớp',
          mfaDescription:
            'Tăng cường bảo mật bằng cách yêu cầu mã xác thực ngoài mật khẩu khi đăng nhập.',
          mfaStatus: 'Ứng dụng xác thực',
          mfaStatusOff: 'Chưa cấu hình',
          mfaSetup: 'Thiết lập',
        },
      },
      landing: {
        heroBadge: 'Mới: HyperPay Components 2.0',
        heroTitle: 'Hạ tầng cho thương mại toàn cầu',
        heroDescription:
          'Hàng triệu công ty từ startup đến tập đoàn Fortune 500 sử dụng HyperPay để nhận thanh toán, chi trả và quản lý kinh doanh online.',
        heroPrimaryCta: 'Bắt đầu ngay',
        heroSecondaryCta: 'Liên hệ sales',
        suiteLabel: 'Bộ sản phẩm',
        suiteTitle: 'Bộ sản phẩm tài chính tích hợp toàn diện',
        dashboardTitle: 'Trung tâm điều khiển doanh nghiệp',
        dashboardDescription:
          'Theo dõi hiệu suất trên mọi kênh và khu vực. Dashboard HyperPay cho bạn cái nhìn realtime về hệ sinh thái tài chính, tất cả trong một nơi.',
        globalReachLabel: 'Toàn cầu',
        globalReachTitle: 'Mở rộng nhanh với thương mại bản địa hóa',
        globalReachDescription:
          'Kết nối khách hàng bằng ngôn ngữ và loại tiền họ ưu tiên, hỗ trợ phương thức thanh toán địa phương tại hơn 45 quốc gia.',
        developersLabel: 'Ưu tiên Developer',
        developersTitle: 'Thống kê toàn cầu',
        developersDescription:
          'Chúng tôi muốn developer tập trung xây sản phẩm thay vì hệ thống thanh toán. Công cụ của HyperPay được thiết kế để tích hợp mượt mà vào stack sẵn có.',
        developersCtaDocs: 'Xem tài liệu',
        developersCtaApi: 'Khám phá API Reference',
        businessTitle: 'Tối ưu cho mọi mô hình kinh doanh',
        securityLabel: 'Bảo mật trước hết',
        securityTitle: 'Bảo mật cấp doanh nghiệp theo mặc định',
        securityDescription:
          'Áp dụng chuẩn bảo mật tốt nhất để bảo vệ dữ liệu của bạn và khách hàng. HyperPay đạt chứng chỉ PCI Service Provider Level 1.',
        suite: {
          payments:
            'Nhận thanh toán và luân chuyển dòng tiền toàn cầu với API mạnh mẽ và giao diện checkout tối ưu.',
          subscriptions:
            'Quản lý subscription, billing định kỳ và hóa đơn cho sản phẩm SaaS ở mọi quy mô.',
          banking:
            'Tích hợp tính năng tài chính như thẻ và cho vay vào sản phẩm với chi phí vận hành tối thiểu.',
        },
        dashboardGrossVolume: 'Tổng doanh thu',
        dashboardNetEarnings: 'Doanh thu ròng',
        dashboardTotalFees: 'Tổng phí',
        dashboardFeature1: 'Giám sát giao dịch theo thời gian thực',
        dashboardFeature2: 'Lọc nâng cao và báo cáo tùy chỉnh',
        dashboardFeature3: 'Nhiều người dùng với phân quyền chi tiết',
        globalStats: {
          c1: 'Loại tiền tệ được hỗ trợ',
          c2: 'Quốc gia có cổng thanh toán nội địa',
          c3: 'Tỉ lệ uptime lịch sử',
          c4: 'Lượt gọi API mỗi ngày',
        },
        businessCards: {
          ecommerce: {
            title: 'Thương mại điện tử',
            description:
              'Tăng chuyển đổi với trải nghiệm checkout tối ưu và mở rộng toàn cầu.',
          },
          saas: {
            title: 'SaaS',
            description:
              'Tự động hóa billing định kỳ và quản lý toàn bộ vòng đời khách hàng.',
          },
          platforms: {
            title: 'Nền tảng',
            description:
              'Thanh toán nhiều bên cho nền tảng SaaS và marketplace nhiều phía.',
          },
          marketplaces: {
            title: 'Marketplace',
            description:
              'Onboard người bán toàn cầu và xử lý dòng tiền phức tạp một cách đơn giản.',
          },
        },
        securityBadges: {
          pci: 'Tuân thủ PCI-DSS',
          encryption: 'Mã hóa 256-bit',
          fraud: 'Chống gian lận',
          twofa: 'Hỗ trợ 2FA',
        },
        testimonialQuote:
          '“HyperPay giúp chúng tôi mở rộng hoạt động quốc tế chỉ trong vài tháng thay vì nhiều năm. Tài liệu rất dễ hiểu và nền tảng cực kỳ ổn định.”',
        testimonialName: 'Elena Rodriguez',
        testimonialRole: 'CTO tại GlobalTech Solutions',
        features: {
          reporting: {
            title: 'Báo cáo tài chính',
            description:
              'Tự động hóa kế toán với export tùy chỉnh và dữ liệu realtime.',
          },
          payouts: {
            title: 'Chi trả nhanh',
            description: 'Nhận tiền trong vòng chỉ từ hai ngày làm việc với lịch chi trả tăng tốc.',
          },
          fraud: {
            title: 'Phát hiện gian lận',
            description:
              'Nhận diện và chặn gian lận trước khi xảy ra nhờ hệ thống Radar dùng machine learning.',
          },
          api: {
            title: 'API mạnh mẽ',
            description: 'Xây gần như mọi thứ bạn muốn với REST API rõ ràng, giàu tính năng.',
          },
        },
        toolsTitle: 'Tích hợp với những công cụ bạn đang dùng',
        banksLabel: 'Mạng lưới',
        banksTitle: 'Hợp tác với các ngân hàng hàng đầu thế giới',
        products: {
          payments: {
            title: 'Thanh toán',
            desc: 'Thanh toán online và tại quầy',
          },
          billing: {
            title: 'Billing',
            desc: 'Quản lý subscription và thu phí định kỳ',
          },
          treasury: {
            title: 'Treasury',
            desc: 'Ngân hàng như một dịch vụ (BaaS)',
          },
          radar: {
            title: 'Radar',
            desc: 'Quản lý rủi ro và chống gian lận',
          },
        },
        resourcesLabel: 'Tài nguyên',
        resourcesTitle: 'Từ Blog',
        blogViewAll: 'Xem tất cả bài viết',
        blogReadMore: 'Đọc tiếp',
        blog: {
          engineering: {
            category: 'Kỹ thuật',
            title: 'Tối ưu checkout cho thương mại trên di động',
            excerpt:
              'Cách chúng tôi tăng tỉ lệ chuyển đổi trên mobile thêm 15% nhờ tinh giản UI checkout.',
          },
          product: {
            category: 'Sản phẩm',
            title: 'Mở rộng sang Đông Nam Á: Cẩm nang',
            excerpt:
              'Bức tranh thanh toán tại Đông Nam Á đang thay đổi – đây là những điều bạn cần biết.',
          },
          strategy: {
            category: 'Chiến lược',
            title: 'Báo cáo thanh toán toàn cầu 2024',
            excerpt:
              'Khám phá xu hướng mới nhất trong thương mại xuyên biên giới và ví điện tử.',
          },
        },
        pricingPaygTitle: 'Trả theo sử dụng',
        pricingPaygSubtitle: 'Phù hợp startup và doanh nghiệp đang tăng trưởng.',
        pricingPayg: {
          b1: 'Không phí cố định hay chi phí ẩn',
          b2: 'Truy cập toàn bộ bộ sản phẩm',
          b3: 'Báo cáo cơ bản và hỗ trợ tiêu chuẩn',
        },
        pricingEnterpriseTitle: 'Doanh nghiệp lớn',
        pricingEnterpriseSubtitle: 'Dành cho doanh nghiệp có volume thanh toán cao.',
        pricingEnterprise: {
          b1: 'Chiết khấu theo volume giao dịch',
          b2: 'Đội ngũ hỗ trợ 24/7 chuyên trách',
          b3: 'Tích hợp tùy chỉnh theo hệ thống của bạn',
        },
        ctaTitle: 'Sẵn sàng bắt đầu?',
        ctaDescription:
          'Tham gia cùng hàng triệu công ty đang dùng HyperPay để xây dựng trải nghiệm tài chính tốt hơn.',
        footerCopyright: '© 2024 HyperPay, Inc. Giữ mọi quyền.',
        footerPrivacy: 'Chính sách bảo mật',
        footerCookie: 'Cài đặt cookie',
        footerTerms: 'Điều khoản dịch vụ',
        footer: {
          products: {
            title: 'Sản phẩm',
            payments: 'Thanh toán',
            billing: 'Billing định kỳ',
            connect: 'Connect',
            terminal: 'Terminal',
            issuing: 'Issuing',
          },
          solutions: {
            title: 'Giải pháp',
            ecommerce: 'Thương mại điện tử',
            saas: 'SaaS',
            marketplaces: 'Marketplace',
            embeddedFinance: 'Tài chính nhúng',
            crypto: 'Crypto',
          },
          resources: {
            title: 'Tài nguyên',
            docs: 'Tài liệu',
            api: 'API Reference',
            guides: 'Hướng dẫn',
            caseStudies: 'Case study',
            support: 'Hỗ trợ',
          },
          company: {
            title: 'Công ty',
            about: 'Về HyperPay',
            careers: 'Tuyển dụng',
            newsroom: 'Tin tức',
            security: 'Bảo mật',
            privacy: 'Quyền riêng tư',
          },
        },
        langEn: 'English',
        langVi: 'Tiếng Việt',
      },
      errors: {
        notFound: {
          badge: 'Lỗi 404',
          title: 'Không tìm thấy trang',
          description:
            'Trang bạn truy cập không tồn tại hoặc đã được di chuyển. Hãy thử tìm kiếm hoặc dùng các đường dẫn nhanh bên dưới.',
          searchPlaceholder: 'Tìm kiếm trợ giúp, tài liệu HyperPay...',
          links: {
            dashboard: {
              title: 'Bảng điều khiển',
              description: 'Quản lý thanh toán và giao dịch của bạn',
            },
            docs: {
              title: 'Tài liệu',
              description: 'Xem API reference và hướng dẫn cho developer',
            },
            support: {
              title: 'Hỗ trợ',
              description: 'Nhận trợ giúp từ đội ngũ hỗ trợ của HyperPay',
            },
          },
          footer: {
            contact: 'Liên hệ',
            privacy: 'Chính sách bảo mật',
            status: 'Tình trạng hệ thống',
            copyright: '© 2024 HyperPay. Giữ mọi quyền.',
          },
        },
      },
      dashboard: {
        title: 'Tổng quan Dashboard',
        subtitle: 'Theo dõi số dư, doanh thu và giao dịch trên tài khoản HyperPay của bạn.',
        cards: {
          totalBalance: 'Tổng số dư',
          totalBalanceValue: '$128,430.00',
          totalBalanceTrend: '+12.5% trong tháng này',
          todayRevenue: 'Doanh thu hôm nay',
          todayRevenueValue: '$4,250.50',
          todayRevenueTrend: '+8.2% so với hôm qua',
          accounts: 'Tài khoản liên kết',
          accountsSubtitle: 'Số tài khoản ngân hàng kết nối với HyperPay',
          plans: 'Gói đang hoạt động',
          plansSubtitle: 'Số gói dịch vụ đã cấu hình',
        },
        chart: {
          title: 'Doanh thu theo thời gian',
          subtitle: 'Theo dõi doanh thu mỗi ngày trên mọi kênh',
          days: 'Ngày',
        },
        table: {
          title: 'Giao dịch mới nhất',
          viewAll: 'Xem tất cả',
          columns: {
            id: 'Mã giao dịch',
            date: 'Thời gian',
            status: 'Trạng thái',
            amount: 'Số tiền',
          },
          unknownId: '#Không rõ',
          unknownStatus: 'Không rõ',
          empty: 'Chưa có giao dịch nào. Hãy xử lý thanh toán để thấy dữ liệu tại đây.',
        },
      },
      banks: {
        breadcrumb: {
          root: 'Cài đặt',
          current: 'Tài khoản ngân hàng',
        },
        title: 'Tài khoản ngân hàng',
        subtitle:
          'Thêm và quản lý các tài khoản ngân hàng dùng để nhận payout và thanh toán phí HyperPay.',
        actions: {
          add: 'Thêm tài khoản ngân hàng',
        },
        tabs: {
          active: 'Tài khoản đang hoạt động',
        },
        table: {
          columns: {
            bankName: 'Ngân hàng',
            accountNumber: 'Số tài khoản',
            holder: 'Chủ tài khoản',
            actions: 'Thao tác',
          },
          loading: 'Đang tải danh sách tài khoản ngân hàng...',
          empty:
            'Chưa có tài khoản ngân hàng nào. Nhấn “Thêm tài khoản ngân hàng” để liên kết tài khoản đầu tiên.',
        },
        info: {
          verifyTitle: 'Xác minh tài khoản tức thì',
          verifyDescription:
            'Kết nối ngân hàng qua Plaid để xác minh ngay lập tức, không cần giao dịch thử.',
          learnMore: 'Tìm hiểu thêm →',
          payoutsTitle: 'Về lịch chuyển tiền',
          payoutsDescription:
            'HyperPay chuyển tiền về tài khoản ngân hàng đang hoạt động theo chu kỳ 2 ngày. Bạn có thể chỉnh lịch này trong phần Cài đặt payout.',
          securityTitle: 'Bảo mật & tuân thủ',
          securityDescription:
            'Mọi dữ liệu ngân hàng đều được mã hóa và lưu trữ theo chuẩn PCI-DSS. Chúng tôi không lưu số tài khoản đầy đủ trên hệ thống.',
        },
        add: {
          title: 'Thêm tài khoản ngân hàng',
          subtitle: 'Liên kết ngân hàng với HyperPay một cách an toàn',
          searchPlaceholder: 'Tìm kiếm ngân hàng của bạn...',
          accountHolder: 'Chủ tài khoản',
          accountHolderPlaceholder: 'Nhập tên chủ tài khoản',
          accountNumber: 'Số tài khoản',
          accountNumberPlaceholder: 'Nhập số tài khoản',
          cancel: 'Hủy',
          submit: 'Tiếp tục liên kết',
          loading: 'Đang liên kết...',
        },
      },
      webhook: {
        breadcrumb: {
          root: 'Developers',
          current: 'Webhooks',
        },
        title: 'Webhooks',
        subtitle:
          'Nhận thông báo realtime từ HyperPay khi có sự kiện xảy ra trên tài khoản của bạn.',
        learnMore: 'Tìm hiểu thêm về webhooks',
        actions: {
          test: 'Gửi sự kiện thử',
        },
        tabs: {
          settings: 'Endpoint',
        },
        form: {
          title: 'Endpoint đang hoạt động',
          urlLabel: 'Endpoint URL',
          urlPlaceholder: 'https://your-system.com/webhooks/hyperpay',
          secretLabel: 'Signing secret',
          secretPlaceholder: 'whsec_...',
          secretHint:
            'Dùng secret này để xác minh sự kiện webhook thực sự được gửi từ HyperPay.',
          activeToggle: 'Bật endpoint này',
          status: {
            enabled: 'Đang bật',
            disabled: 'Đang tắt',
          },
          save: 'Lưu cấu hình',
          saving: 'Đang lưu...',
          reset: 'Hoàn tác',
          saved: 'Đã lưu cấu hình webhook thành công.',
        },
        info: {
          verifyTitle: 'Xác minh chữ ký',
          verifyDescription:
            'Sử dụng thư viện HyperPay để chắc chắn sự kiện do chúng tôi gửi. Bảo vệ tích hợp của bạn với signing secret.',
          viewSecret: 'Xem signing secret',
          localTitle: 'Test cục bộ',
          localDescription:
            'Test webhook ngay trên máy local với CLI. Forward sự kiện trực tiếp tới server của bạn.',
          installCli: 'Cài đặt CLI',
        },
      },
    },
  },
} as const

i18n.use(initReactI18next).init({
  resources,
  lng: 'vi',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export type I18nResources = typeof resources

export default i18n

