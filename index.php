<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Official Management System</title>
  <meta name="theme-color" content="#0f172a">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%23f59e0b'/><text x='16' y='22' font-size='18' text-anchor='middle' fill='white'>S</text></svg>" type="image/svg+xml">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          brand: {
            DEFAULT: '#f59e0b',
            dark: '#d97706',
            light: '#fbbf24',
          },
          sidebar: {
            DEFAULT: '#0f172a',
            hover: '#1e293b',
          },
          surface: '#f1f3f6',
        },
        fontFamily: {
          sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Inter', 'Roboto', 'sans-serif'],
        },
        borderRadius: {
          DEFAULT: '10px',
          sm: '6px',
          lg: '14px',
          pill: '50px',
        },
      },
    },
  }
  </script>
  <link rel="stylesheet" href="frontend/css/style.css">
</head>
<body class="bg-surface text-slate-900 font-sans antialiased min-h-dvh">
  <div id="app" class="min-h-dvh flex">
    <nav class="mobile-navbar md:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar z-50 flex items-center px-4 gap-3">
      <button class="hamburger w-9 h-9 bg-transparent border-none cursor-pointer flex flex-col items-center justify-center gap-[5px] p-1.5 rounded-[6px] shrink-0" id="hamburgerBtn" aria-label="Toggle menu">
        <span class="block w-5 h-0.5 bg-slate-400 rounded-[2px] transition-all duration-200"></span>
        <span class="block w-5 h-0.5 bg-slate-400 rounded-[2px] transition-all duration-200"></span>
        <span class="block w-5 h-0.5 bg-slate-400 rounded-[2px] transition-all duration-200"></span>
      </button>
      <span class="text-slate-200 text-[0.95rem] font-semibold">Official Management</span>
    </nav>
    <aside class="sidebar w-[270px] bg-sidebar text-slate-100 flex flex-col fixed top-0 left-0 bottom-0 z-40 transition-transform duration-300 md:!translate-x-0 md:!flex" id="sidebar" style="display:none"></aside>
    <div class="sidebar-overlay fixed inset-0 bg-[rgba(15,23,42,0.5)] z-30 backdrop-blur-[2px] hidden md:!hidden" id="sidebarOverlay"></div>
    <main class="main-content flex-1 ml-0 md:ml-[270px] p-4 md:p-8 lg:p-9 min-h-dvh pt-[68px] md:pt-8" id="mainContent">
      <div id="page-content"></div>
    </main>
  </div>

  <script src="frontend/js/api.js"></script>
  <script src="frontend/js/auth.js"></script>
  <script src="frontend/js/router.js"></script>
  <script src="frontend/js/pages/login.js"></script>
  <script src="frontend/js/pages/admin/dashboard.js"></script>
  <script src="frontend/js/pages/admin/events.js"></script>
  <script src="frontend/js/pages/admin/staff.js"></script>
  <script src="frontend/js/pages/admin/roles.js"></script>
  <script src="frontend/js/pages/admin/teams.js"></script>
  <script src="frontend/js/pages/super-admin/dashboard.js"></script>
  <script src="frontend/js/pages/super-admin/admins.js"></script>
  <script src="frontend/js/pages/super-admin/events.js"></script>
  <script src="frontend/js/pages/super-admin/staff.js"></script>
  <script src="frontend/js/pages/super-admin/roles.js"></script>
  <script src="frontend/js/pages/super-admin/teams.js"></script>
  <script src="frontend/js/app.js"></script>
</body>
</html>
