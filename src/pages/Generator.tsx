import { useState, useEffect } from "react";
import DocumentGenerator from "@/components/DocumentGenerator";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { getSession, onAuthChange, type AppUser } from "@/lib/auth";

const Generator = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    getSession().then((sessionUser) => {
      if (!sessionUser) {
        navigate("/auth");
      } else {
        setUser(sessionUser);
      }
      setLoading(false);
    });

    const unsubscribe = onAuthChange((sessionUser) => {
      if (!sessionUser) {
        navigate("/auth");
      } else {
        setUser(sessionUser);
      }
    });

    return unsubscribe;
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-16">
      <Navbar />
      <DocumentGenerator user={user} />
      <Footer />
    </main>
  );
};

export default Generator;
