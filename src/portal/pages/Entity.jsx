import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../../shared/utils/toast";
import Loader from "../components/Loader";

const EntitySelection = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigateTimerRef = useRef(null);

  // Get entities from login response (already stored in user object)
  const fetchEntities = async () => {
    try {
      setLoading(true);
      setApiError("");

      const token = sessionStorage.getItem("token");
      const userData = sessionStorage.getItem("user");

      if (!token || !userData) {
        navigate("/Login");
        return;
      }

      const userObj = JSON.parse(userData);
      setUser(userObj);

      console.log("User Object:", userObj);
      console.log("User Entities:", userObj?.entities);

      // Get entities from user object (saved during login)
      const userEntities = Array.isArray(userObj?.entities)
        ? userObj.entities
        : [];

      console.log("Mapped User Entities:", userEntities);

      if (userEntities.length === 0) {
        console.error("No entities found in user object!");
        setApiError("No entities assigned to your account");
        setEntities([]);
        return;
      }

      const mappedEntities = userEntities.map((e) => ({
        id: e?.tenant_id,
        name: e?.tenant_name,
        logo: e?.tenant_logo_url,
      }));
      setEntities(mappedEntities);
    } catch (err) {
      console.error("Entity fetch error:", err);
      setApiError(err?.message || "Failed to load entities");
      toast.error("Failed to load entities!", {});
      setEntities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();

    return () => {
      if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current);
    };
  }, [navigate]);

  const handleEntitySelect = (entity) => {
    if (selecting) return;
    setSelecting(true);

    // Store selected entity in sessionStorage for persistence
    sessionStorage.setItem("selectedEntity", JSON.stringify(entity));
    console.log("Entity Selected & Stored:", entity);

    toast.success(`Selected: ${entity.name}`, {
      position: "top-right",
      autoClose: 1200,
    });

    navigateTimerRef.current = setTimeout(() => {
      // Pass entity via navigation state AND session storage
      navigate("/dashboard", {
        replace: true,
        state: { entity },
      });
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {loading ? (
        <Loader fullScreen text="Loading entities..." />
      ) : (
        <div className="w-full max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {user?.user_name || "User"}!
            </h1>
            <p className="text-gray-600 mt-2">
              Select an entity to access the dashboard
            </p>
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 max-w-2xl mx-auto">
              <p className="font-semibold">Failed to Load Entities</p>
              <p className="text-sm mt-1">{apiError}</p>
            </div>
          )}

          {entities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entities.map((entity, index) => (
                <button
                  key={`entity-${entity.id || index}-${index}`}
                  onClick={() => handleEntitySelect(entity)}
                  disabled={selecting}
                  className={`bg-white border border-gray-300 rounded-xl p-6 transition-all duration-300 text-center shadow-sm
                    hover:shadow-lg hover:scale-[1.02] active:scale-[0.99]
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
                    ${selecting ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <div className="mx-auto mb-4 flex items-center justify-center">
                    {entity.logo ? (
                      <img
                        src={entity.logo}
                        alt={`${entity.name} logo`}
                        className="w-30 h-14 "
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold">
                        {entity.name?.charAt(0)?.toUpperCase() || "E"}
                      </div>
                    )}
                  </div>

                  {/* <h3 className="text-lg font-semibold text-gray-800">
                    {entity.name}
                  </h3> */}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600 text-lg">No entities available</p>
              <p className="text-gray-500 text-sm mt-2">
                Your account does not have access to any entity.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EntitySelection;
