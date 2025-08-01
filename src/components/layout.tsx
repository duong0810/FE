import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem("zalo_token") || (window as any).zalo_token;
    if (!token && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
    console.log("Current href:", window.location.href);
    console.log("Current hash:", window.location.hash);
    console.log("Current pathname:", location.pathname);
  }, [location.pathname, navigate]);

  // Xác định trang hiện tại để đánh dấu menu active
  const getCurrentPath = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    // if (path === "/core") return "core";
    if (path === "/voucher-warehouse") return "warehouse";
    if (path === "/profile") return "profile";
    return "";
  };

  const currentPath = getCurrentPath();

  return (
    
    <div className="flex flex-col h-screen">

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Toast container để ngoài main/nav */}
        <ToastContainer />

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200">
        <div className="flex justify-around px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className={`flex flex-col items-center ${
              currentPath === "home" ? "text-blue-500" : "text-gray-500"
            }`}
          >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="text-xs"> Trang chủ </span>
            </button>

            {/* <button
              onClick={() => navigate("/core")}
              className={`flex flex-col items-center ${
                currentPath === "core" ? "text-blue-500" : "text-gray-500"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.75 3.75h4.5v4.5h-4.5v-4.5zm0 12h4.5v4.5h-4.5v-4.5zm12-12h4.5v4.5h-4.5v-4.5zm0 12h4.5v4.5h-4.5v-4.5zm-6-6h.008v.008H9.75v-.008zm4.5 0h.008v.008h-.008v-.008zm0 4.5h.008v.008h-.008v-.008zm-4.5 0h.008v.008H9.75v-.008zm2.25-2.25h.008v.008h-.008v-.008z"
                />
              </svg>
              <span className="text-xs"> Tích điểm </span>
            </button> */}

            <button
              onClick={() => navigate("/voucher-warehouse")}
              className={`flex flex-col items-center ${
                currentPath === "warehouse" ? "text-blue-500" : "text-gray-500"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
              <span className="text-xs">Khuyến mãi</span>
            </button>

            <button
              onClick={() => navigate("/profile")}
              className={`flex flex-col items-center ${
                currentPath === "profile" ? "text-blue-500" : "text-gray-500"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-xs">Tài khoản</span>
            </button>
          </div>
        </nav>
      
    </div>
  );
}
