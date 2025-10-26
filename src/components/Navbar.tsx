import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Sprout, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./Auth/AuthContext"; // Import useAuth hook
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming you have an Avatar component
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Use the auth context

  const publicNavItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Contact", path: "/contact" },
    { name: "Login", path: "/login" },
  ];

  const farmerNavItems = [
    // Add other farmer-specific navigation items here if needed
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to home page after logout
  };

  // Determine button colors based on the current dashboard
  let logoutButtonBg = "bg-primary-green";
  let logoutButtonHoverBg = "hover:bg-green-700";

  if (location.pathname.startsWith("/admin-dashboard")) {
    logoutButtonBg = "bg-blue-600";
    logoutButtonHoverBg = "hover:bg-blue-700";
  } else if (location.pathname.startsWith("/service-provider-dashboard")) {
    logoutButtonBg = "bg-sp-primary-DEFAULT";
    logoutButtonHoverBg = "hover:bg-sp-primary-dark";
  }

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95 animate-fade-in-down">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-hero p-2 rounded-lg transition-transform group-hover:scale-110">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">ClaimEasy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {!user ? ( // If not logged in, show public nav items
              publicNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "text-primary bg-primary/10"
                      : item.name === "Login"
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.name}
                </Link>
              ))
            ) : (
              // If logged in, show user-specific info and logout
              <>
                {user.role === "FARMER" && (
                  farmerNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))
                )}
                <div className="flex items-center space-x-2 ml-4">
                  <Avatar>
                    <AvatarImage src={user.profilePhoto || "https://github.com/shadcn.png"} alt="User Avatar" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">
                    {user.name}
                  </span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                        <LogOut className="h-5 w-5 mr-2" /> Logout
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Logging out will end your current session and require you to log in again to access your dashboard.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className={`${logoutButtonBg} ${logoutButtonHoverBg} text-white`}>Continue Logout</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-muted"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fade-in">
            {!user ? (
              publicNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "text-primary bg-primary/10"
                      : item.name === "Login"
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.name}
                </Link>
              ))
            ) : (
              <>
                {user.role === "FARMER" && (
                  farmerNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))
                )}
                <div className="flex items-center space-x-2 px-4 py-2">
                  <Avatar>
                    <AvatarImage src={user.profilePhoto || "https://github.com/shadcn.png"} alt="User Avatar" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">
                    {user.name}
                  </span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Logging out will end your current session and require you to log in again to access your dashboard.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className={`${logoutButtonBg} ${logoutButtonHoverBg} text-white`}>Continue Logout</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
